import os
import sys

# Add the project root to Python path
# This script is in backend/tools/rag/test_rag.py
# Project root is 3 levels up
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, '../../..'))

if project_root not in sys.path:
    sys.path.insert(0, project_root)

from backend.tools.rag.utils import save_docs_to_vector_db, query_docs_from_vector_db

from dotenv import load_dotenv

load_dotenv()

text = """{
  "中央批量集中采购": [
    {
      "title": "中央国家机关2025年空调批量集中采购项目-8月中...",
      "link": "../cggg/zygg/zbgg/202508/t20250820"
    }
  ]
}"""

gold_process = """
[
 {
    "name":"抛光工艺",
    "description":"通过抛光机使黄金表面光滑、光亮，形成镜面效果，展现黄金的光泽和质感.",
    "unit_price":"5 - 15 元/克"
 },
 {
    "name":"花丝工艺",
    "description":"花丝工艺是指黄金经过拔丝、搓丝、掐丝、填丝、堆垒、焊接、攒活、镶嵌等复杂手段制作造型的细金工艺。成品极尽精巧，富有细节，如同工艺品一般",
    "unit_price":"10 - 20 元/克"
 }
]
"""

if __name__ == "__main__":
    col_name = "test_coll"

    # save_docs_to_vector_db([text], col_name)

    docs = query_docs_from_vector_db(col_name, ["液化天然气"], 2)

    print("result:", "\n".join(docs['documents'][0]))
