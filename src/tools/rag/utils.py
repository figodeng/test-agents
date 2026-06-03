import logging
import os
from typing import Optional, Union
import uuid
import requests
import hashlib
from concurrent.futures import ThreadPoolExecutor

from backend.tools.rag.vector.factory import VECTOR_DB_CLIENT

log = logging.getLogger(__name__)
log.setLevel("INFO")


def query_doc(
        collection_name: str, query_embedding: list[float], k: int
):
    try:
        log.debug(f"query_doc:doc {collection_name}")
        result = VECTOR_DB_CLIENT.search(
            collection_name=collection_name,
            vectors=[query_embedding],
            limit=k,
        )

        if result:
            log.info(f"query_doc:result {result.ids} {result.metadatas}")

        return result
    except Exception as e:
        log.exception(f"Error querying doc {collection_name} with limit {k}: {e}")
        raise e


def merge_get_results(get_results: list[dict]) -> dict:
    # Initialize lists to store combined data
    combined_documents = []
    combined_metadatas = []
    combined_ids = []

    for data in get_results:
        combined_documents.extend(data["documents"][0])
        combined_metadatas.extend(data["metadatas"][0])
        combined_ids.extend(data["ids"][0])

    # Create the output dictionary
    result = {
        "documents": [combined_documents],
        "metadatas": [combined_metadatas],
        "ids": [combined_ids],
    }

    return result


def merge_and_sort_query_results(query_results: list[dict], k: int) -> dict:
    # Initialize lists to store combined data
    combined = dict()  # To store documents with unique document hashes

    for data in query_results:
        distances = data["distances"][0]
        documents = data["documents"][0]
        metadatas = data["metadatas"][0]

        for distance, document, metadata in zip(distances, documents, metadatas):
            if isinstance(document, str):
                doc_hash = hashlib.sha256(
                    document.encode()
                ).hexdigest()  # Compute a hash for uniqueness

                if doc_hash not in combined.keys():
                    combined[doc_hash] = (distance, document, metadata)
                    continue  # if doc is new, no further comparison is needed

                # if doc is alredy in, but new distance is better, update
                if distance > combined[doc_hash][0]:
                    combined[doc_hash] = (distance, document, metadata)

    combined = list(combined.values())
    # Sort the list based on distances
    combined.sort(key=lambda x: x[0], reverse=True)

    # Slice to keep only the top k elements
    sorted_distances, sorted_documents, sorted_metadatas = (
        zip(*combined[:k]) if combined else ([], [], [])
    )

    # Create and return the output dictionary
    return {
        "distances": [list(sorted_distances)],
        "documents": [list(sorted_documents)],
        "metadatas": [list(sorted_metadatas)],
    }


def query_collection(
        collection_names: list[str],
        queries: list[str],
        embedding_function,
        k: int,
) -> dict:
    results = []
    error = False

    def process_query_collection(collection_name, query_embedding):
        try:
            if collection_name:
                result = query_doc(
                    collection_name=collection_name,
                    k=k,
                    query_embedding=query_embedding,
                )
                if result is not None:
                    return result.model_dump(), None
            return None, None
        except Exception as e:
            log.exception(f"Error when querying the collection: {e}")
            return None, e

    # Generate all query embeddings (in one call)
    query_embeddings = embedding_function(queries, prefix=None)
    log.debug(
        f"query_collection: processing {len(queries)} queries across {len(collection_names)} collections"
    )

    with ThreadPoolExecutor() as executor:
        future_results = []
        for query_embedding in query_embeddings:
            for collection_name in collection_names:
                result = executor.submit(
                    process_query_collection, collection_name, query_embedding
                )
                future_results.append(result)
        task_results = [future.result() for future in future_results]

    for result, err in task_results:
        if err is not None:
            error = True
        elif result is not None:
            results.append(result)

    if error and not results:
        log.warning("All collection queries failed. No results returned.")

    return merge_and_sort_query_results(results, k=k)


def get_embedding_function(
        embedding_engine,
        embedding_model,
        url,
        key,
        embedding_batch_size,
        azure_api_version=None,
):
    if embedding_engine in ["ollama", "openai", "azure_openai"]:
        func = lambda query, prefix=None, user=None: generate_embeddings(
            engine=embedding_engine,
            model=embedding_model,
            text=query,
            prefix=prefix,
            url=url,
            key=key,
            user=user,
            azure_api_version=azure_api_version,
        )

        def generate_multiple(query, prefix, user, func):
            if isinstance(query, list):
                embeddings = []
                for i in range(0, len(query), embedding_batch_size):
                    embeddings.extend(
                        func(
                            query[i: i + embedding_batch_size],
                            prefix=prefix,
                            user=user,
                        )
                    )
                return embeddings
            else:
                return func(query, prefix, user)

        return lambda query, prefix=None, user=None: generate_multiple(
            query, prefix, user, func
        )
    else:
        raise ValueError(f"Unknown embedding engine: {embedding_engine}")


def generate_ollama_batch_embeddings(
        model: str,
        texts: list[str],
        url: str,
        key: str = "",
) -> Optional[list[list[float]]]:
    try:
        log.debug(
            f"generate_ollama_batch_embeddings:model {model} batch size: {len(texts)}"
        )
        json_data = {"input": texts, "model": model}

        r = requests.post(
            f"{url}/api/embed",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {key}",
            },
            json=json_data,
        )
        r.raise_for_status()
        data = r.json()

        if "embeddings" in data:
            return data["embeddings"]
        else:
            raise "Something went wrong :/"
    except Exception as e:
        log.exception(f"Error generating ollama batch embeddings: {e}")
        return None


def generate_embeddings(
        engine: str,
        model: str,
        text: Union[str, list[str]],
        prefix: Union[str, None] = None,
        **kwargs,
):
    url = kwargs.get("url", "")
    key = kwargs.get("key", "")

    if prefix is not None:
        if isinstance(text, list):
            text = [f"{prefix}{text_element}" for text_element in text]
        else:
            text = f"{prefix}{text}"

    if engine == "ollama":
        embeddings = generate_ollama_batch_embeddings(
            **{
                "model": model,
                "texts": text if isinstance(text, list) else [text],
                "url": url,
                "key": key,
            }
        )
        return embeddings[0] if isinstance(text, str) else embeddings


from llama_index.core.node_parser import SentenceSplitter

sentence_splitter = SentenceSplitter(
    chunk_size=512,
    chunk_overlap=50
)

from llama_index.core import Document
import os
import sys

# Add the project root to Python path to access env.py
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

def get_ollama_embedding_function():
    OLLAMA_URL = os.getenv('OLLAMA_URL')
    OLLAMA_MODEL = os.getenv('OLLAMA_MODEL')

    return get_embedding_function(
        "ollama",
        OLLAMA_MODEL,
        OLLAMA_URL,
        "",
        50,
        None,
    )


def save_docs_to_vector_db(
        docs,
        collection_name
) -> bool:
    log.info(
        f"save_docs_to_vector_db: document {collection_name}"
    )
    docs = [Document(text=doc) for doc in docs]
    nodes = sentence_splitter.get_nodes_from_documents(docs)
    # docs = [node.get_content() for i, node in enumerate(nodes, 1)]

    if len(docs) == 0:
        raise ValueError(
            "The content provided is empty. Please ensure that there is text or data present before proceeding.")

    texts = [node.get_content() for node in nodes]

    try:
        if VECTOR_DB_CLIENT.has_collection(collection_name=collection_name):
            log.info(f"collection {collection_name} already exists")

        log.info(f"adding to collection {collection_name}")
        embedding_function = get_ollama_embedding_function()

        embeddings = embedding_function(
            list(map(lambda x: x.replace("\n", " "), texts)),
            prefix=None,
        )

        items = [
            {
                "id": str(uuid.uuid4()),
                "text": text,
                "vector": embeddings[idx],
                "metadata": {}
            }
            for idx, text in enumerate(texts)
        ]

        VECTOR_DB_CLIENT.insert(
            collection_name=collection_name,
            items=items,
        )

        return True
    except Exception as e:
        log.exception(e)
        raise e


def query_docs_from_vector_db(
        collection_name: str, query_docs: list[str], k: int
):
    embedding_function = get_ollama_embedding_function()

    return query_collection([collection_name], query_docs, embedding_function, k)
