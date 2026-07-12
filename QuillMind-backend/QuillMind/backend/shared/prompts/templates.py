"""
QuillMind — Prompt Templates
All prompts used across Q&A, Summary, and Reading modules.
Designed for LLaMA 3 via Groq.
"""


def qa_prompt(context: str, question: str) -> str:
    """Grounded Q&A prompt — answer only from the provided context."""
    return f"""You are an academic assistant. Answer the student's question using ONLY the context below.
If the answer is not found in the context, say: "I could not find relevant information in the uploaded documents."

--- CONTEXT ---
{context}

--- QUESTION ---
{question}

--- ANSWER ---
Provide a clear, concise, and accurate answer based solely on the context above."""


def summary_prompt(text: str) -> str:
    """Structured summary prompt."""
    return f"""You are an expert academic summarizer. Read the text below and produce a structured summary.

Format your response as:
## Overview
(2-3 sentence high-level summary)

## Key Points
- Point 1
- Point 2
- Point 3
(list the most important points)

## Conclusion
(1-2 sentence takeaway)

--- TEXT ---
{text}"""


def reading_insight_prompt(page_text: str) -> str:
    """Per-page comprehension insight prompt."""
    return f"""You are an academic reading assistant. Analyze the page content below and provide:

1. **Mini Summary** — 2-3 sentences summarizing this page.
2. **Key Terms** — List 3-5 important terms or concepts from this page.
3. **Comprehension Questions** — Write 2 questions a student should be able to answer after reading this page.

--- PAGE CONTENT ---
{page_text}"""
