"""
QuillMind — In-Memory Subject Vector Store
Scans the uploads/ directory, chunks every PDF, encodes the chunks,
and stores them in a dict keyed by subject folder name.

Shape of each store entry:
    {
        "chunks":     List[str],
        "embeddings": np.ndarray  # shape [N, 384]
    }
"""

import os
from typing import Dict, Optional

import numpy as np

from config.settings import UPLOAD_DIR, CHUNK_SIZE
from shared.preprocessing.text_processor import extract_pdf_text, chunk_text
from shared.embeddings.sentence_encoder import encode
from shared.utils.logger import logger

# Global store: subject_name → {"chunks": [...], "embeddings": ndarray}
_store: Dict[str, dict] = {}


# def build_store() -> None:
#     """
#     Walk uploads/ and build the vector index.

#     Layout expected:
#         uploads/
#             <subject_folder>/
#                 file1.pdf
#                 file2.pdf
#     """
#     global _store
#     _store = {}

#     if not os.path.exists(UPLOAD_DIR):
#         logger.warning("uploads/ directory does not exist. Vector store is empty.")
#         return

#     all_chunks: list = []
#     subject_map: dict = {}   # subject → list of chunk indices in all_chunks

#     for folder in os.listdir(UPLOAD_DIR):
#         print("FOUND:", folder)

#         folder_path = os.path.join(UPLOAD_DIR, folder)

#         if not os.path.isdir(folder_path):
#             print("SKIPPED (not folder):", folder_path)
#             continue

#         print("ENTERING FOLDER:", folder_path)

#         for fname in os.listdir(folder_path):
#             print("FILE:", fname)

#     for folder in os.listdir(UPLOAD_DIR):
#         folder_path = os.path.join(UPLOAD_DIR, folder)
#         if not os.path.isdir(folder_path):
#             continue

#         subject_chunks: list = []

#         for fname in os.listdir(folder_path):
#             if not fname.lower().endswith(".pdf"):
#                 continue
#             pdf_path = os.path.join(folder_path, fname)
#             text = extract_pdf_text(pdf_path)
#             if not text.strip():
#                 continue
#             chunks = chunk_text(text, CHUNK_SIZE)
#             subject_chunks.extend(chunks)
#             logger.info("Indexed '%s/%s' → %d chunks.", folder, fname, len(chunks))

#         if subject_chunks:
#             start = len(all_chunks)
#             all_chunks.extend(subject_chunks)
#             subject_map[folder] = list(range(start, len(all_chunks)))

#     if not all_chunks:
#         logger.warning("No PDF content found. Vector store is empty.")
#         return

#     logger.info("Encoding %d total chunks…", len(all_chunks))
#     all_embeddings = encode(all_chunks)

#     # Per-subject store entries
#     for subject, indices in subject_map.items():
#         _store[subject] = {
#             "chunks":     [all_chunks[i] for i in indices],
#             "embeddings": all_embeddings[indices],
#         }

#     # "all" — everything together
#     _store["all"] = {
#         "chunks":     all_chunks,
#         "embeddings": all_embeddings,
#     }

#     logger.info(
#         "Vector store built: %d subjects + 'all' index (%d total chunks).",
#         len(subject_map),
#         len(all_chunks),
#     )

def build_store() -> None:
    global _store
    _store = {}

    if not os.path.exists(UPLOAD_DIR):
        logger.warning("uploads directory does not exist.")
        return

    all_chunks = []

    for fname in os.listdir(UPLOAD_DIR):

        file_path = os.path.join(UPLOAD_DIR, fname)

        # Skip folders like avatars
        if not os.path.isfile(file_path):
            continue

        # Only PDFs
        if not fname.lower().endswith(".pdf"):
            continue

        print("INDEXING:", file_path)

        text = extract_pdf_text(file_path)

        if not text.strip():
            print("NO TEXT FOUND:", fname)
            continue

        chunks = chunk_text(text, CHUNK_SIZE)

        all_chunks.extend(chunks)

        logger.info(
            "Indexed '%s' -> %d chunks",
            fname,
            len(chunks)
        )

    if not all_chunks:
        logger.warning("No PDF content found. Vector store is empty.")
        return

    logger.info("Encoding %d total chunks...", len(all_chunks))

    embeddings = encode(all_chunks)

    _store["all"] = {
        "chunks": all_chunks,
        "embeddings": embeddings,
    }

    logger.info(
        "Vector store built successfully with %d chunks.",
        len(all_chunks),
    )


def get_subject(subject: str) -> Optional[dict]:
    """Return the store entry for a subject, or None if not found."""
    return _store.get(subject) or _store.get("all")


def list_subjects() -> list:
    """Return a list of indexed subject names (excluding 'all')."""
    return [k for k in _store.keys() if k != "all"]

def clear_store():
    global _store
    _store = {}
