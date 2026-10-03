"""
CampusMind AI - Knowledge Base Ingestion Script
Ingests generated markdown files from /knowledge_base into persistent ChromaDB
with strict metadata tagging (branch, year, batch, doc_type, applicable_to, source).
Uses high-performance local ONNX embeddings (all-MiniLM-L6-v2) for instant, zero-quota ingestion.
"""

import os
import sys
import json
import time
from pathlib import Path

# Ensure safe UTF-8 output on Windows console
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

import chromadb
from chromadb.utils import embedding_functions

BASE_DIR = Path(__file__).resolve().parent
KB_DIR = BASE_DIR / "knowledge_base"
CHROMA_DIR = BASE_DIR / "backend" / "chroma_db"
CHROMA_DIR.mkdir(parents=True, exist_ok=True)

COLLECTION_NAME = "campusmind_knowledge"

def parse_markdown_file(file_path: Path):
    raw_content = file_path.read_text(encoding="utf-8")
    metadata = {
        "source": file_path.name,
        "title": file_path.stem.replace("_", " ").title(),
        "branch": "all",
        "year": "all",
        "batch": "all",
        "doc_type": "general",
        "applicable_to": "all"
    }
    
    body = raw_content
    if raw_content.startswith("---"):
        parts = raw_content.split("---", 2)
        if len(parts) >= 3:
            try:
                frontmatter = json.loads(parts[1].strip())
                metadata.update(frontmatter)
                body = parts[2].strip()
            except Exception as e:
                print(f"Warning parsing frontmatter in {file_path.name}: {e}")
                
    cleaned_metadata = {}
    for k, v in metadata.items():
        if isinstance(v, (str, int, float, bool)):
            cleaned_metadata[k] = v
        else:
            cleaned_metadata[k] = str(v)
            
    return body, cleaned_metadata

def chunk_text(text: str, max_chars: int = 900, overlap: int = 100):
    """Simple robust chunker by sections and paragraphs."""
    sections = text.split("\n### ")
    chunks = []
    for sec_idx, sec in enumerate(sections):
        sec_text = ("### " + sec) if sec_idx > 0 else sec
        sec_text = sec_text.strip()
        if not sec_text:
            continue
        if len(sec_text) <= max_chars:
            chunks.append(sec_text)
        else:
            # Sub-split by double newlines
            paragraphs = sec_text.split("\n\n")
            current = ""
            for p in paragraphs:
                if len(current) + len(p) < max_chars:
                    current += ("\n\n" + p if current else p)
                else:
                    if current:
                        chunks.append(current)
                    current = p
            if current:
                chunks.append(current)
    return chunks if chunks else [text]

def run_ingestion():
    print("=" * 60)
    print("🚀 CampusMind AI Knowledge Base Ingestion")
    print(f"📁 Source: {KB_DIR}")
    print(f"💾 ChromaDB Directory: {CHROMA_DIR}")
    print("=" * 60)

    if not KB_DIR.exists():
        raise FileNotFoundError(f"Knowledge base directory not found at {KB_DIR}")

    md_files = sorted(list(KB_DIR.glob("*.md")))
    print(f"[ingest] Found {len(md_files)} markdown files in knowledge base.")

    client = chromadb.PersistentClient(path=str(CHROMA_DIR))
    
    # Reset collection for clean fresh index
    try:
        client.delete_collection(name=COLLECTION_NAME)
        print(f"[ingest] Cleared old collection '{COLLECTION_NAME}'")
    except Exception:
        pass

    ef = embedding_functions.DefaultEmbeddingFunction()
    collection = client.create_collection(
        name=COLLECTION_NAME,
        embedding_function=ef
    )

    all_ids = []
    all_texts = []
    all_metadatas = []
    
    total_docs = 0
    for f in md_files:
        body, meta = parse_markdown_file(f)
        chunks = chunk_text(body)
        total_docs += 1
        for idx, chunk in enumerate(chunks):
            doc_id = f"{f.stem}_chunk_{idx}"
            chunk_meta = dict(meta)
            chunk_meta["chunk_id"] = idx
            
            all_ids.append(doc_id)
            all_texts.append(chunk)
            all_metadatas.append(chunk_meta)

    print(f"[ingest] Extracted {len(all_texts)} total chunks from {total_docs} files.")

    # Batch add in chunks of 50
    batch_size = 50
    for i in range(0, len(all_texts), batch_size):
        end_idx = min(i + batch_size, len(all_texts))
        collection.add(
            ids=all_ids[i:end_idx],
            documents=all_texts[i:end_idx],
            metadatas=all_metadatas[i:end_idx]
        )
        print(f"  -> Indexed chunks {i+1} to {end_idx} of {len(all_texts)}...")

    print(f"\n✅ SUCCESS! Ingested {len(all_texts)} chunks into ChromaDB at {CHROMA_DIR}")
    print(f"Verified count in collection: {collection.count()}")

if __name__ == "__main__":
    run_ingestion()
