from backend.tools.rag.vector.main import VectorDBBase


class Vector:

    @staticmethod
    def get_vector(vector_type: str) -> VectorDBBase:
        """
        get vector db instance by vector type
        """
        match vector_type:
            case "milvus":
                from backend.tools.rag.vector.dbs.milvus import MilvusClient

                return MilvusClient()
            case _:
                raise ValueError(f"Unsupported vector type: {vector_type}")

VECTOR_DB_CLIENT = Vector.get_vector("milvus")