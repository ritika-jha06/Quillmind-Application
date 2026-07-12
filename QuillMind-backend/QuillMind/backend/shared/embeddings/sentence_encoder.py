"""
QuillMind — Sentence Encoder
Singleton SentenceTransformer model + cosine-similarity chunk retrieval.
"""

from typing import List
import numpy as np
from sentence_transformers import SentenceTransformer  # type: ignore

from config.settings import SENTENCE_MODEL_NAME
from shared.utils.logger import logger

_model: SentenceTransformer | None = None


def load_sentence_model() -> None:
    """Load (or no-op if already loaded) the SentenceTransformer model."""
    global _model
    if _model is None:
        logger.info("Loading SentenceTransformer '%s'…", SENTENCE_MODEL_NAME)
        _model = SentenceTransformer(SENTENCE_MODEL_NAME)
        logger.info("SentenceTransformer ready.")


def get_sentence_model() -> SentenceTransformer:
    """Return the singleton model, loading it if necessary."""
    if _model is None:
        load_sentence_model()
    return _model  # type: ignore


# def encode(texts: List[str]) -> np.ndarray:
#     """Encode a list of strings into embedding vectors."""
#     model = get_sentence_model()
#     return model.encode(texts, convert_to_numpy=True)  # type: ignore

def encode(texts) -> np.ndarray:
    model = get_sentence_model()

    cleaned_texts = []

    for i, text in enumerate(texts):
        if text is None:
            print(f"Skipping None at index {i}")
            continue

        if not isinstance(text, str):
            print(f"Converting {type(text)} at index {i}")
            text = str(text)

        text = text.strip()

        if not text:
            continue

        # Remove invalid unicode characters
        text = text.encode("utf-8", errors="ignore").decode("utf-8")

        cleaned_texts.append(text)

    print(f"Encoding {len(cleaned_texts)} chunks")

    return model.encode(
        cleaned_texts,
        convert_to_numpy=True,
        show_progress_bar=True
    )


def top_k_chunks(
    query: str,
    chunks: List[str],
    embeddings: np.ndarray,
    k: int = 3,
) -> List[str]:
    """
    Return the top-k chunks most similar to `query` using cosine similarity.

    Args:
        query:      The user's question.
        chunks:     List of text chunks.
        embeddings: Pre-computed embeddings for `chunks` (shape: [N, D]).
        k:          Number of chunks to return.

    Returns:
        List of up to k most relevant chunk strings.
    """
    if not chunks:
        return []

    query_vec = encode([query])[0]

    # Cosine similarity
    norms = np.linalg.norm(embeddings, axis=1) * np.linalg.norm(query_vec)
    norms = np.where(norms == 0, 1e-10, norms)
    scores = np.dot(embeddings, query_vec) / norms

    top_indices = np.argsort(scores)[::-1][: k]
    return [chunks[i] for i in top_indices]
