# """
# QuillMind — Groq LLM Client (replaces Gemini)
# Singleton wrapper around the Groq Python SDK.

# Groq provides fast inference for open-source models like LLaMA 3.
# Get a free API key at: https://console.groq.com
# """

# from groq import Groq
# from config.settings import GROQ_API_KEY, GROQ_MODEL
# from shared.utils.logger import logger

# _groq_client: Groq | None = None


# def get_groq_client() -> Groq:
#     """
#     Return the singleton Groq client.
#     Initialised lazily on first call.
#     """
#     global _groq_client
#     if _groq_client is None:
#         if not GROQ_API_KEY:
#             raise RuntimeError(
#                 "GROQ_API_KEY is not set. "
#                 "Add it to your .env file. "
#                 "Get a free key at https://console.groq.com"
#             )
#         _groq_client = Groq(api_key=GROQ_API_KEY)
#         logger.info("Groq client initialised (model: %s).", GROQ_MODEL)
#     return _groq_client


# def groq_chat(prompt: str, system: str = "You are a helpful academic AI assistant.") -> str:
#     """
#     Send a prompt to Groq and return the response text.

#     Args:
#         prompt: The user-facing prompt / question.
#         system: Optional system message to set the AI's role.

#     Returns:
#         The model's response as a plain string.
#     """
#     client = get_groq_client()
#     response = client.chat.completions.create(
#         model=GROQ_MODEL,
#         messages=[
#             {"role": "system", "content": system},
#             {"role": "user",   "content": prompt},
#         ],
#         temperature=0.3,
#         max_tokens=1024,
#     )
#     return response.choices[0].message.content or ""



"""
QuillMind — Groq LLM Client (replaces Gemini)
Singleton wrapper around the Groq Python SDK.

Groq provides fast inference for open-source models like LLaMA 3.
Get a free API key at: https://console.groq.com
"""

from groq import Groq
from config.settings import GROQ_API_KEY, GROQ_MODEL
from shared.utils.logger import logger

_groq_client: Groq | None = None


def get_groq_client() -> Groq:
    """
    Return the singleton Groq client.
    Initialised lazily on first call.
    """
    global _groq_client

    if _groq_client is None:
        if not GROQ_API_KEY:
            raise RuntimeError(
                "GROQ_API_KEY is not set. "
                "Add it to your .env file. "
                "Get a free key at https://console.groq.com"
            )

        _groq_client = Groq(api_key=GROQ_API_KEY)

        logger.info(
            "Groq client initialised (model: %s).",
            GROQ_MODEL,
        )

    return _groq_client


DEFAULT_SYSTEM_PROMPT = """
You are QuillMind AI, an advanced educational assistant designed for students, teachers, and learners.

IMPORTANT RULES:

1. Always provide well-structured answers.
2. Format answers using Markdown.
3. Start with a short overview or summary.
4. Use clear headings and subheadings.
5. Use bullet points where appropriate.
6. Use numbered steps for procedures or explanations.
7. Highlight important concepts using bold formatting.
8. Provide concise and accurate explanations.
9. Avoid unnecessary repetition.
10. Use educational and professional language.

DOCUMENT-BASED ANSWERING:

11. If document context is provided, answer ONLY using the provided context.
12. Do NOT invent facts that are not present in the document.
13. If the answer is not available in the document, clearly say:
    "The provided document does not contain enough information to answer this question."

FORMATTING RULES:

14. For definition questions:
    - Definition
    - Explanation
    - Example (if available)

15. For theory questions:
    - Introduction
    - Detailed Explanation
    - Key Points
    - Conclusion

16. For comparison questions:
    - Comparison Table
    - Key Differences
    - Conclusion

17. For process/workflow questions:
    - Overview
    - Step-by-Step Explanation
    - Result

18. For long answers:
    - Use multiple sections
    - Use bullet points
    - Keep paragraphs readable

19. End long answers with:

## Key Takeaways

- Important point 1
- Important point 2
- Important point 3

20. If the user asks for a summary:
    - Provide a concise summary
    - Then list key points

21. If the user asks for notes:
    - Generate study notes
    - Use bullet points
    - Keep them exam-oriented

22. Never output raw JSON unless explicitly requested.

23. Ensure answers are suitable for academic and educational use.

24. Maintain clean formatting and readability at all times.
"""

def groq_chat(
    prompt: str,
    system: str = DEFAULT_SYSTEM_PROMPT,
) -> str:
    """
    Send a prompt to Groq and return the response text.

    Args:
        prompt: The user-facing prompt / question.
        system: Optional system message.

    Returns:
        Model response text.
    """

    try:
        client = get_groq_client()

        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": system,
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.2,
            max_tokens=1500,
        )

        content = response.choices[0].message.content

        if not content:
            return "No response generated."

        return content.strip()

    except Exception as e:
        logger.exception("Groq generation failed: %s", e)
        return f"[Groq Error] {str(e)}"