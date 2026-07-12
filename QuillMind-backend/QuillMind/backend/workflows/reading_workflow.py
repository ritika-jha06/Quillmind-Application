# """
# QuillMind — Reading Workflow
# Thin orchestration layer for the Reading Application module.
# """

# from modules.reading.reading_service import (
#     get_pdf_page,
#     get_pdf_all_pages,
#     get_page_insight,
#     save_reading_progress,
#     get_reading_progress,
# )
# from shared.utils.logger import logger


# def run_get_page(filename: str, page: int) -> dict:
#     logger.info("Reading workflow — page %d of '%s'.", page, filename)
#     return get_pdf_page(filename, page)


# def run_get_all_pages(filename: str) -> dict:
#     logger.info("Reading workflow — all pages of '%s'.", filename)
#     return get_pdf_all_pages(filename)


# def run_get_insight(filename: str, page: int) -> dict:
#     logger.info("Reading workflow — insight for page %d of '%s'.", page, filename)
#     return get_page_insight(filename, page)


# def run_save_progress(username: str, filename: str, page: int) -> dict:
#     logger.info("Reading workflow — save progress: %s, %s, p%d.", username, filename, page)
#     return save_reading_progress(username, filename, page)


# def run_get_progress(username: str, filename: str) -> dict:
#     logger.info("Reading workflow — get progress: %s, %s.", username, filename)
#     return get_reading_progress(username, filename)



"""
QuillMind — Reading Workflow (v2)
Thin orchestration layer for the enhanced Reading module.
"""

from modules.reading.reading_service import (
    extract_document,
    get_document_page,
    get_document_all_pages,
    get_page_insight,
    chat_with_document,
    save_reading_progress,
    get_reading_progress,
)
from shared.utils.logger import logger


def run_extract_document(filename: str) -> dict:
    logger.info("Reading workflow — extract document '%s'.", filename)
    return extract_document(filename)


def run_get_page(filename: str, page: int) -> dict:
    logger.info("Reading workflow — page %d of '%s'.", page, filename)
    return get_document_page(filename, page)


def run_get_all_pages(filename: str) -> dict:
    logger.info("Reading workflow — all pages of '%s'.", filename)
    return get_document_all_pages(filename)


def run_get_insight(filename: str, page: int) -> dict:
    logger.info("Reading workflow — insight for page %d of '%s'.", page, filename)
    return get_page_insight(filename, page)


def run_chat_with_document(filename: str, question: str,
                           page: int = None, chat_history: list = None) -> dict:
    logger.info("Reading workflow — chat '%s' about '%s'.", question[:50], filename)
    return chat_with_document(filename, question, page, chat_history)


def run_save_progress(username: str, filename: str, page: int) -> dict:
    return save_reading_progress(username, filename, page)


def run_get_progress(username: str, filename: str) -> dict:
    return get_reading_progress(username, filename)
