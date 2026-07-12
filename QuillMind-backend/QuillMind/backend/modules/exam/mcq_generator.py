# # # """
# # # QuillMind — MCQ Generator (Exam Maker Module)

# # # Generates multiple-choice questions from raw text using spaCy NLP.
# # # No LLM / API tokens required — runs entirely locally.
# # # """

# # # import random
# # # from collections import Counter
# # # from typing import List, Dict, Optional

# # # import spacy  # type: ignore

# # # from shared.utils.logger import logger


# # # class MCQGenerator:
# # #     """
# # #     Generates fill-in-the-blank style MCQs from any text using spaCy POS tagging.

# # #     Usage:
# # #         gen = MCQGenerator()
# # #         mcqs = gen.generate_mcqs(text, num_questions=10)
# # #     """

# # #     def __init__(self) -> None:
# # #         try:
# # #             self.nlp = spacy.load("en_core_web_sm")
# # #             logger.info("MCQGenerator: spaCy model loaded successfully.")
# # #         except OSError:
# # #             raise RuntimeError(
# # #                 "spaCy model 'en_core_web_sm' not found.\n"
# # #                 "Run: python -m spacy download en_core_web_sm"
# # #             )

# # #     # ── Internal helpers ───────────────────────────────────────────────────────

# # #     @staticmethod
# # #     def _safe_text(text: str) -> str:
# # #         """Strip non-UTF-8 characters."""
# # #         return text.encode("utf-8", "ignore").decode("utf-8")

# # #     # ── Public API ─────────────────────────────────────────────────────────────

# # #     def generate_mcqs(
# # #         self, text: Optional[str], num_questions: int = 10
# # #     ) -> List[Dict]:
# # #         """
# # #         Generate up to `num_questions` MCQs from `text`.

# # #         Each returned dict has the shape:
# # #             {
# # #                 "id": int,
# # #                 "question": str,
# # #                 "options": {"A": str, "B": str, "C": str, "D": str},
# # #                 "correct_answer": str     # "A" | "B" | "C" | "D"
# # #             }
# # #         """
# # #         if not text:
# # #             return []

# # #         text = self._safe_text(text)
# # #         doc = self.nlp(text)

# # #         sentences = [
# # #             sent.text.strip()
# # #             for sent in doc.sents
# # #             if len(sent.text.strip().split()) >= 6
# # #         ]

# # #         if not sentences:
# # #             logger.warning("MCQGenerator: no usable sentences found in text.")
# # #             return []

# # #         random.shuffle(sentences)

# # #         mcqs: List[Dict] = []
# # #         used_subjects: set = set()
# # #         idx = 0

# # #         while len(mcqs) < num_questions and idx < len(sentences):
# # #             sentence = self._safe_text(sentences[idx])
# # #             idx += 1

# # #             sent_doc = self.nlp(sentence)

# # #             keywords = [
# # #                 token.text
# # #                 for token in sent_doc
# # #                 if token.pos_ in ("NOUN", "PROPN") and len(token.text) > 3
# # #             ]

# # #             if len(keywords) < 2:
# # #                 continue

# # #             subject = Counter(keywords).most_common(1)[0][0]

# # #             if subject.lower() in used_subjects:
# # #                 continue
# # #             used_subjects.add(subject.lower())

# # #             stem = sentence.replace(subject, "______", 1)
# # #             stem = stem[0].upper() + stem[1:]

# # #             distractors = [
# # #                 k for k in set(keywords)
# # #                 if k != subject and k.lower() != subject.lower()
# # #             ]

# # #             if len(distractors) >= 3:
# # #                 distractors = random.sample(distractors, 3)
# # #             else:
# # #                 while len(distractors) < 3:
# # #                     distractors.append("[Option]")

# # #             options_pool = [subject] + distractors
# # #             random.shuffle(options_pool)

# # #             options = {
# # #                 "A": options_pool[0],
# # #                 "B": options_pool[1],
# # #                 "C": options_pool[2],
# # #                 "D": options_pool[3],
# # #             }
# # #             correct = ["A", "B", "C", "D"][options_pool.index(subject)]

# # #             mcqs.append(
# # #                 {
# # #                     "id": len(mcqs) + 1,
# # #                     "question": stem,
# # #                     "options": options,
# # #                     "correct_answer": correct,
# # #                 }
# # #             )

# # #         logger.info(
# # #             "MCQGenerator: generated %d / %d requested questions.",
# # #             len(mcqs),
# # #             num_questions,
# # #         )
# # #         return mcqs



# """
# QuillMind — MCQ Generator (Exam Maker Module)
# =============================================
# Generates high-quality, structured multiple-choice questions from raw text
# using Qwen2.5-3B-Instruct (causal LM).

# Changes from the Flan-T5 version
# ---------------------------------
# * Model replaced: google/flan-t5-base  →  Qwen/Qwen2.5-3B-Instruct
# * Loader:   T5ForConditionalGeneration + T5Tokenizer
#          →  AutoModelForCausalLM + AutoTokenizer
# * dtype:    float32 (CPU only)
#          →  float16 when CUDA / MPS available, float32 on CPU
# * device_map="auto" — lets Accelerate spread layers across all available
#   devices automatically (GPU → CPU offload if needed).
# * Generation:  encoder-decoder beam-search  →  causal greedy / temperature
#   sampling with a JSON-only system prompt via the chat template.
# * Prompt format: Qwen chat template (system + user messages) — the model
#   expects this and produces much cleaner structured output than a raw prompt.
# * Parser: old regex (Question:/Options:/Answer:) replaced with robust JSON
#   extractor + multiple fallback patterns that match Qwen's output style.
# * _validate_and_fix: minor bug fix (undefined `correct_text` variable in the
#   old code) — now safely resolved.
# * All public signatures unchanged: generate_mcqs(text, num_questions, difficulty)
#   returns the same list-of-dicts schema used by the router and frontend.

# Memory / performance notes (see bottom of file for full recommendations)
# ------------------------------------------------------------------------
# * Qwen2.5-3B in float16 needs ~6 GB VRAM or ~12 GB RAM (CPU).
# * On CPU, each question takes ~15-40 s — acceptable for exam generation.
# * Set QUILLMIND_QWEN_4BIT=1 in .env to enable 4-bit BitsAndBytes
#   quantisation (~3 GB VRAM / ~6 GB RAM, ~30 % slower).

# Dependencies (requirements.txt additions — see below)
# ------------------------------------------------------
#     transformers>=4.43.0
#     torch>=2.2.0
#     accelerate>=0.30.0
#     sentencepiece>=0.1.99
#     nltk>=3.8.0
#     bitsandbytes>=0.43.0   # only if QUILLMIND_QWEN_4BIT=1
# """

# from __future__ import annotations

# import hashlib
# import json
# import os
# import random
# import re
# from collections import Counter
# from typing import Dict, List, Optional, Set, Tuple

# import nltk
# from nltk.corpus import stopwords, wordnet as wn
# from nltk.tokenize import sent_tokenize

# from shared.utils.logger import logger

# # ---------------------------------------------------------------------------
# # NLTK bootstrap
# # ---------------------------------------------------------------------------
# _NLTK_PACKAGES = [
#     "punkt",
#     "punkt_tab",
#     "averaged_perceptron_tagger",
#     "averaged_perceptron_tagger_eng",
#     "stopwords",
#     "wordnet",
#     "omw-1.4",
# ]


# def _ensure_nltk_data() -> None:
#     for pkg in _NLTK_PACKAGES:
#         for prefix in ("tokenizers", "corpora", "taggers"):
#             try:
#                 nltk.data.find(f"{prefix}/{pkg}")
#                 break
#             except LookupError:
#                 pass
#         else:
#             try:
#                 nltk.download(pkg, quiet=True)
#             except Exception:
#                 pass


# _ensure_nltk_data()

# _STOP_WORDS: Set[str] = set()
# try:
#     _STOP_WORDS = set(stopwords.words("english"))
# except Exception:
#     pass

# # ---------------------------------------------------------------------------
# # Constants
# # ---------------------------------------------------------------------------
# _LETTERS = ("A", "B", "C", "D")
# _DIFFICULTY_CYCLE = ["easy", "medium", "hard"]

# _MODEL_ID = os.getenv("QUILLMIND_QWEN_MODEL", "Qwen/Qwen2.5-1.5B-Instruct")
# # _USE_4BIT = os.getenv("QUILLMIND_QWEN_4BIT", "0").strip() == "1"

# # ---------------------------------------------------------------------------
# # Prompt templates (system + user) — one per difficulty
# # The system prompt is strict: the model MUST output ONLY a JSON object.
# # ---------------------------------------------------------------------------

# _SYSTEM_PROMPT = (
#     "You are an expert academic MCQ generator. "
#     "Your ONLY output must be a single valid JSON object — no markdown, no code fences, "
#     "no extra text before or after the JSON. "
#     "The JSON must have exactly these keys:\n"
#     '  "question"  : string — a complete, self-contained question ending with "?"\n'
#     '  "options"   : object with exactly four keys "A", "B", "C", "D" — each a short string\n'
#     '  "answer"    : one of "A", "B", "C", "D"\n'
#     '  "difficulty": one of "Easy", "Medium", "Hard"\n'
#     "Rules:\n"
#     "- The question must be derived ONLY from the given text.\n"
#     "- All four options must be different from each other.\n"
#     "- Distractors must be plausible but clearly incorrect to a knowledgeable reader.\n"
#     "- Do NOT use fill-in-the-blank style questions.\n"
#     "- Do NOT repeat information from other options.\n"
#     "- Do NOT include 'All of the above' or 'None of the above'.\n"
#     "- Output ONLY the JSON. No explanation. No preamble."
# )

# _USER_EASY = (
#     "Generate ONE Easy-difficulty MCQ from the text below.\n"
#     "Easy means: tests direct recall of an explicit fact stated in the text.\n\n"
#     "TEXT:\n{context}"
# )

# _USER_MEDIUM = (
#     "Generate ONE Medium-difficulty MCQ from the text below.\n"
#     "Medium means: tests understanding of a concept, relationship, or process in the text.\n\n"
#     "TEXT:\n{context}"
# )

# _USER_HARD = (
#     "Generate ONE Hard-difficulty MCQ from the text below.\n"
#     "Hard means: tests the ability to apply, infer, or analyse information from the text; "
#     "distractors should be sophisticated and require careful reasoning to eliminate.\n\n"
#     "TEXT:\n{context}"
# )

# _USER_TEMPLATES: Dict[str, str] = {
#     "easy":   _USER_EASY,
#     "medium": _USER_MEDIUM,
#     "hard":   _USER_HARD,
# }

# # ---------------------------------------------------------------------------
# # Helper: extract key sentences
# # ---------------------------------------------------------------------------

# def _extract_key_sentences(text: str, max_sentences: int = 30) -> List[str]:
#     """
#     Return the most informative sentences from *text* ranked by a lightweight
#     heuristic. Unchanged from the previous version.
#     """
#     raw_sentences: List[str] = []
#     try:
#         raw_sentences = sent_tokenize(text)
#     except Exception:
#         raw_sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]

#     scored: List[Tuple[float, str]] = []
#     for sent in raw_sentences:
#         sent = re.sub(r"\s+", " ", sent.strip())
#         words = sent.split()
#         if len(words) < 8 or len(words) > 120:
#             continue

#         score = 0.0
#         lower = sent.lower()

#         if any(p in lower for p in ("is the ", "are the ", "refers to", "defined as",
#                                      "known as ", "is a ", "are a ", "called ")):
#             score += 3.0
#         if any(p in lower for p in ("occurs ", "involves ", "produces ", "converts ",
#                                      "results in", "leads to", "causes ", "affects ",
#                                      "depends on", "consists of", "composed of")):
#             score += 2.0
#         if re.search(r"\d", sent):
#             score += 1.0
#         score += min(len(words) / 10.0, 2.0)

#         scored.append((score, sent))

#     scored.sort(key=lambda x: x[0], reverse=True)
#     return [s for _, s in scored[:max_sentences]]


# # ---------------------------------------------------------------------------
# # Helper: WordNet-based distractor generation
# # ---------------------------------------------------------------------------

# def _wordnet_distractors(answer: str, n: int = 3) -> List[str]:
#     """Return up to *n* WordNet-derived plausible distractors for *answer*."""
#     candidates: Set[str] = set()
#     synsets = wn.synsets(answer.replace(" ", "_"))

#     for synset in synsets[:3]:
#         for hypernym in synset.hypernyms()[:2]:
#             for hyponym in hypernym.hyponyms()[:6]:
#                 for lemma in hyponym.lemmas()[:2]:
#                     name = lemma.name().replace("_", " ")
#                     if name.lower() != answer.lower() and len(name) > 2:
#                         candidates.add(name)
#             for lemma in hypernym.lemmas()[:2]:
#                 name = lemma.name().replace("_", " ")
#                 if name.lower() != answer.lower():
#                     candidates.add(name)
#         for lemma in synset.lemmas():
#             for ant in lemma.antonyms():
#                 candidates.add(ant.name().replace("_", " "))

#     result = list(candidates)
#     random.shuffle(result)
#     return result[:n]


# # ---------------------------------------------------------------------------
# # Helper: JSON extraction — handles nested braces and code fences
# # ---------------------------------------------------------------------------

# def _extract_json_object(text: str) -> Optional[str]:
#     """
#     Find and return the outermost JSON object ``{…}`` in *text*.
#     Strips markdown code fences (```json … ```) first.
#     """
#     # Remove code fences
#     text = re.sub(r"```(?:json)?", "", text, flags=re.IGNORECASE).strip()

#     start = text.find("{")
#     if start == -1:
#         return None

#     depth = 0
#     for i, ch in enumerate(text[start:], start):
#         if ch == "{":
#             depth += 1
#         elif ch == "}":
#             depth -= 1
#             if depth == 0:
#                 return text[start: i + 1]
#     return None


# # ---------------------------------------------------------------------------
# # Helper: MCQ output parser (JSON-first with regex fallback)
# # ---------------------------------------------------------------------------

# def _parse_mcq(raw: str, fallback_difficulty: str = "medium") -> Optional[Dict]:
#     """
#     Parse Qwen's raw output into a validated MCQ dict.

#     Strategy
#     --------
#     1. Extract outermost JSON object → parse with json.loads.
#     2. Validate required keys: question, options (A/B/C/D), answer.
#     3. If JSON fails entirely → try a loose regex fallback.
#     4. Return None if everything fails.

#     The old regex that matched "Question:", "Options:", "Answer:" is removed
#     because Qwen (instructed to emit JSON) never produces that format.
#     """
#     if not raw:
#         return None

#     raw = raw.strip()

#     # ── 1. JSON path ─────────────────────────────────────────────────────────
#     blob = _extract_json_object(raw)
#     if blob:
#         # Repair common truncation: missing closing brace
#         if not blob.rstrip().endswith("}"):
#             blob = blob.rstrip().rstrip(",") + "}"
#         try:
#             data = json.loads(blob)
#         except json.JSONDecodeError:
#             # Try relaxed: replace single quotes, trailing commas
#             blob_fixed = re.sub(r",\s*([}\]])", r"\1", blob)
#             blob_fixed = blob_fixed.replace("'", '"')
#             try:
#                 data = json.loads(blob_fixed)
#             except json.JSONDecodeError:
#                 data = None

#         if data and isinstance(data, dict):
#             q = str(data.get("question", "")).strip()
#             opts_raw = data.get("options", {})
#             ans = str(data.get("answer", data.get("correct_answer", ""))).strip().upper()
#             diff = str(data.get("difficulty", fallback_difficulty)).strip()

#             # Normalise options — list or dict both accepted
#             if isinstance(opts_raw, list) and len(opts_raw) >= 4:
#                 opts = {_LETTERS[i]: str(v).strip() for i, v in enumerate(opts_raw[:4])}
#             elif isinstance(opts_raw, dict):
#                 opts = {}
#                 for k, v in opts_raw.items():
#                     k_up = k.strip().upper()
#                     if k_up in _LETTERS:
#                         opts[k_up] = str(v).strip()
#             else:
#                 opts = {}

#             if q and len(opts) == 4 and ans in _LETTERS:
#                 return {
#                     "question":       q,
#                     "options":        {ltr: opts.get(ltr, "[Option]") for ltr in _LETTERS},
#                     "correct_answer": ans,
#                     "explanation":    str(data.get("explanation", "")).strip(),
#                     "difficulty":     diff.capitalize() if diff.lower() in
#                                       ("easy", "medium", "hard") else fallback_difficulty.capitalize(),
#                 }

#     # ── 2. Regex fallback — for Qwen outputs that break JSON format ──────────
#     # Pattern: "question": "...", or Question: ...
#     q_m = re.search(
#         r'"question"\s*:\s*"([^"]+)"'
#         r'|Question\s*:\s*(.+?)(?=\nA[)\.\s]|Options|$)',
#         raw, re.IGNORECASE | re.DOTALL,
#     )
#     # Options A-D
#     opt_m = re.findall(
#         r'"([A-D])"\s*:\s*"([^"]+)"'
#         r'|(?:^|\n)\s*([A-D])[)\.\:]\s*(.+?)(?=(?:\n\s*[A-D][)\.\:])|Answer|$)',
#         raw, re.DOTALL | re.MULTILINE,
#     )
#     ans_m = re.search(r'"answer"\s*:\s*"?([A-D])"?|Answer\s*:\s*([A-D])', raw, re.IGNORECASE)

#     q_text = None
#     if q_m:
#         q_text = (q_m.group(1) or q_m.group(2) or "").strip()

#     opts: Dict[str, str] = {}
#     for m in opt_m:
#         # Each match has 4 groups from two alternatives
#         letter = (m[0] or m[2]).upper()
#         text   = (m[1] or m[3]).strip()
#         if letter in _LETTERS and text:
#             opts[letter] = text

#     ans_text = None
#     if ans_m:
#         ans_text = (ans_m.group(1) or ans_m.group(2) or "").upper()

#     if q_text and len(opts) == 4 and ans_text in _LETTERS:
#         return {
#             "question":       q_text,
#             "options":        {ltr: opts.get(ltr, "[Option]") for ltr in _LETTERS},
#             "correct_answer": ans_text,
#             "explanation":    "",
#             "difficulty":     fallback_difficulty.capitalize(),
#         }

#     return None


# # ---------------------------------------------------------------------------
# # Helper: post-process and validate
# # ---------------------------------------------------------------------------

# def _validate_and_fix(mcq: Dict, context_sentences: Set[str]) -> Optional[Dict]:
#     """
#     Apply quality gates and minor fixes to a parsed MCQ dict.

#     Rejects if:
#     - question < 10 or > 400 chars
#     - question contains fill-in-the-blank underscores
#     - any option is blank
#     - all four options are identical

#     Fixes:
#     - Capitalise question if lowercase.
#     - Append '?' if no terminal punctuation.
#     - Fill missing option slots with "[Option]".
#     """
#     q = mcq.get("question", "").strip()

#     if len(q) < 10 or len(q) > 400:
#         return None
#     if "______" in q or "____" in q:
#         return None
#     if not q[0].isupper():
#         q = q[0].upper() + q[1:]
#     if q[-1] not in ".?!":
#         q += "?"

#     opts = {ltr: mcq.get("options", {}).get(ltr, "").strip() for ltr in _LETTERS}
#     ans  = mcq.get("correct_answer", "A").upper()

#     # Fill blanks
#     for ltr in _LETTERS:
#         if not opts[ltr]:
#             opts[ltr] = "[Option]"

#     # Reject if all options are identical (degenerate output)
#     if len(set(opts.values())) == 1:
#         return None

#     # Correct answer must be valid
#     if ans not in _LETTERS:
#         ans = "A"

#     # Bug fix from original code: `correct_text` was referenced before assignment
#     correct_text = opts.get(ans, "")  # noqa: F841 (kept for future checks)

#     return {
#         "question":       q,
#         "options":        opts,
#         "correct_answer": ans,
#         "explanation":    mcq.get("explanation", "").strip(),
#         "difficulty":     mcq.get("difficulty", "Medium"),
#     }


# # ---------------------------------------------------------------------------
# # Helper: deduplication fingerprint
# # ---------------------------------------------------------------------------

# def _fingerprint(question: str) -> str:
#     clean = re.sub(r"[^a-z0-9\s]", "", question.lower())
#     words = sorted(w for w in clean.split() if w not in _STOP_WORDS and len(w) > 2)
#     return hashlib.sha1(" ".join(words[:8]).encode()).hexdigest()[:12]


# # ---------------------------------------------------------------------------
# # Main class
# # ---------------------------------------------------------------------------

# class MCQGenerator:
#     """
#     Wraps Qwen2.5-1.5B-Instruct for high-quality MCQ generation.

#     Thread-safe for concurrent read-only inference after __init__ completes.
#     Instantiate once at application startup via init_exam_workflow().

#     Usage
#     -----
#         gen = MCQGenerator()
#         mcqs = gen.generate_mcqs(text, num_questions=10, difficulty="mixed")
#     """

#     def __init__(self) -> None:
#         self._model     = None
#         self._tokenizer = None
#         self._device    = "cpu"
#         self._dtype     = None
#         self._load_model()

#     # ── Model loading ────────────────────────────────────────────────────────

#     def _load_model(self) -> None:
#         """
#         Load Qwen2.5-1.5B-Instruct from HuggingFace Hub (or local cache).

#         Float16 is used when a CUDA / MPS GPU is available; float32 on CPU.
#         If QUILLMIND_QWEN_4BIT=1 in environment, loads in 4-bit via
#         BitsAndBytes (requires bitsandbytes package and a CUDA GPU).
#         """
#         try:
#             import torch
#             from transformers import AutoModelForCausalLM, AutoTokenizer

#             # ── Device & dtype ───────────────────────────────────────────────
#             if torch.cuda.is_available():
#                 self._device = "cuda"
#                 self._dtype  = torch.float16
#                 logger.info("MCQGenerator: CUDA available — using float16.")
#             elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
#                 self._device = "mps"
#                 self._dtype  = torch.float16
#                 logger.info("MCQGenerator: Apple MPS available — using float16.")
#             else:
#                 self._device = "cpu"
#                 self._dtype  = torch.float32
#                 logger.info("MCQGenerator: No GPU found — using CPU float32 (slow but functional).")

#             logger.info("MCQGenerator: loading %s …", _MODEL_ID)

#             # ── Tokeniser ────────────────────────────────────────────────────
#             self._tokenizer = AutoTokenizer.from_pretrained(
#                 _MODEL_ID,
#                 trust_remote_code=True,
#             )

#             # ── Model ────────────────────────────────────────────────────────
#             # if _USE_4BIT and self._device == "cuda":
#             #     from transformers import BitsAndBytesConfig
#             #     bnb_cfg = BitsAndBytesConfig(
#             #         load_in_4bit=True,
#             #         bnb_4bit_quant_type="nf4",
#             #         bnb_4bit_compute_dtype=self._dtype,
#             #         bnb_4bit_use_double_quant=True,
#             #     )
#             #     self._model = AutoModelForCausalLM.from_pretrained(
#             #         _MODEL_ID,
#             #         quantization_config=bnb_cfg,
#             #         device_map="auto",
#             #         trust_remote_code=True,
#             #     )
#             #     logger.info("MCQGenerator: loaded in 4-bit BitsAndBytes mode.")
#             # else:
#             self._model = AutoModelForCausalLM.from_pretrained(
#                     _MODEL_ID,
#                     torch_dtype=self._dtype,
#                     device_map="auto",       # spreads across GPU/CPU automatically
#                     trust_remote_code=True,
#                 )

#             self._model.eval()
#             logger.info("MCQGenerator: %s ready.", _MODEL_ID)

#         except Exception as exc:
#             logger.error("MCQGenerator: failed to load %s — %s", _MODEL_ID, exc)
#             logger.warning(
#                 "MCQGenerator: model unavailable. "
#                 "Falling back to rule-based stub for all requests."
#             )
#             self._model     = None
#             self._tokenizer = None

#     # ── Core inference ───────────────────────────────────────────────────────

#     def _build_prompt(self, context: str, difficulty: str) -> str:
#         """
#         Build the full prompt string using Qwen's chat template.

#         Qwen2.5-Instruct uses the ChatML format:
#             <|im_start|>system … <|im_end|>
#             <|im_start|>user … <|im_end|>
#             <|im_start|>assistant

#         apply_chat_template handles this automatically.
#         """
#         user_text = _USER_TEMPLATES.get(difficulty, _USER_MEDIUM).format(
#             context=context[:200]  # cap context to keep prompt fast
#         )
#         messages = [
#             {"role": "system", "content": _SYSTEM_PROMPT},
#             {"role": "user",   "content": user_text},
#         ]
#         return self._tokenizer.apply_chat_template(
#             messages,
#             tokenize=False,
#             add_generation_prompt=True,  # appends <|im_start|>assistant\n
#         )

#     def _generate_one(self, context: str, difficulty: str) -> Optional[str]:
#         """
#         Run one Qwen inference call and return the raw decoded output string.
#         Returns *None* on any error.
#         """
#         if self._model is None or self._tokenizer is None:
#             return None

#         import torch

#         try:
#             prompt = self._build_prompt(context, difficulty)
#             enc = self._tokenizer(
#                 prompt,
#                 return_tensors="pt",
#                 truncation=True,
#                 max_length=1024,  # plenty for system + user + context
#             )

#             # Move inputs to the model's first device
#             # (device_map="auto" may split layers; inputs go to the first shard)
#             first_device = next(self._model.parameters()).device
#             enc = {k: v.to(first_device) for k, v in enc.items()}

#             with torch.no_grad():
#                 out = self._model.generate(
#                     **enc,
#                     max_new_tokens=80,      # enough for a full JSON MCQ
#                     do_sample=False,          # sampling for variety across questions
#                     temperature=0.3,         # controlled creativity
#                     top_p=0.9,
#                     repetition_penalty=1.1,  # reduce repetitive option text
#                     pad_token_id=self._tokenizer.eos_token_id,
#                     eos_token_id=self._tokenizer.eos_token_id,
#                 )

#             # Decode only the newly generated tokens (strip the prompt)
#             input_len = enc["input_ids"].shape[1]
#             new_tokens = out[0][input_len:]
#             decoded = self._tokenizer.decode(new_tokens, skip_special_tokens=True)
#             logger.debug("MCQGenerator raw output: %s", decoded[:200])
#             return decoded

#         except Exception as exc:
#             logger.warning("MCQGenerator: inference error — %s", exc)
#             return None
        
#     def _generate_batch(
#         self,
#         context: str,
#         difficulty: str,
#         num_questions: int
#     ) -> Optional[str]:

#         if self._model is None or self._tokenizer is None:
#             return None

#         import torch

#         prompt = f"""
#     Generate exactly {num_questions} multiple choice questions.

#     Return ONLY valid JSON.

#     {{
#         "questions": [
#             {{
#                 "question": "",
#                 "options": {{
#                     "A": "",
#                     "B": "",
#                     "C": "",
#                     "D": ""
#                 }},
#                 "answer": "A",
#                 "difficulty": "{difficulty.capitalize()}"
#             }}
#         ]
#     }}

#     Rules:
#     - Exactly {num_questions} questions.
#     - Four unique options.
#     - One correct answer.
#     - No explanation.
#     - No markdown.
#     - Output ONLY JSON.

#     TEXT:
#     {context[:1000]}
#     """

#         enc = self._tokenizer(
#             prompt,
#             return_tensors="pt",
#             truncation=True,
#             max_length=1024,
#         )

#         first_device = next(self._model.parameters()).device

#         enc = {
#             k: v.to(first_device)
#             for k, v in enc.items()
#         }

#         with torch.no_grad():
#             out = self._model.generate(
#                 **enc,
#                 max_new_tokens=300,
#                 do_sample=False,
#                 temperature=0.3,
#                 repetition_penalty=1.1,
#                 pad_token_id=self._tokenizer.eos_token_id,
#                 eos_token_id=self._tokenizer.eos_token_id,
#             )

#         input_len = enc["input_ids"].shape[1]

#         generated = out[0][input_len:]

#         return self._tokenizer.decode(
#             generated,
#             skip_special_tokens=True
#         ) 
    
#     def _parse_batch_mcqs(self, raw: str):

#         try:

#             data = json.loads(raw)

#             return data.get("questions", [])

#         except Exception:

#             return []   

#     # ── Distractor enhancement ───────────────────────────────────────────────

#     def _enhance_distractors(self, mcq: Dict) -> Dict:
#         """
#         Replace placeholder distractors ("[Option]", empty, too short) with
#         WordNet-derived alternatives when possible.
#         """
#         opts    = mcq["options"].copy()
#         correct = mcq["correct_answer"]
#         correct_text = opts.get(correct, "")

#         wn_pool = _wordnet_distractors(correct_text, n=6)
#         wn_iter = iter(wn_pool)

#         for ltr in _LETTERS:
#             if ltr == correct:
#                 continue
#             val = opts.get(ltr, "").strip()
#             if val in ("[Option]", "", correct_text) or len(val) < 2:
#                 replacement = next(wn_iter, None)
#                 if replacement:
#                     opts[ltr] = replacement.capitalize()

#         mcq["options"] = opts
#         return mcq

#     # ── Fallback (rule-based stub when model unavailable) ───────────────────

#     @staticmethod
#     def _fallback_mcq(sentence: str, mcq_id: int, difficulty: str) -> Optional[Dict]:
#         """
#         Minimal rule-based MCQ — used ONLY when Qwen is unavailable.
#         Generates a basic fill-in question as a last resort.
#         """
#         words = [w for w in sentence.split() if len(w) > 4 and w.isalpha()]
#         if not words:
#             return None

#         subject = Counter(words).most_common(1)[0][0]
#         stem    = sentence.replace(subject, "______", 1)
#         stem    = stem[0].upper() + stem[1:]
#         if "______" not in stem:
#             return None

#         distractors = _wordnet_distractors(subject, n=3)
#         while len(distractors) < 3:
#             distractors.append("[Option]")
#         distractors = distractors[:3]

#         pool = [subject] + distractors
#         random.shuffle(pool)
#         opts    = {ltr: pool[i] for i, ltr in enumerate(_LETTERS)}
#         correct = _LETTERS[pool.index(subject)]

#         return {
#             "question":       f"Fill in the blank: {stem}?",
#             "options":        opts,
#             "correct_answer": correct,
#             "explanation":    f"The correct answer is '{subject}' as mentioned in the source text.",
#             "difficulty":     difficulty.capitalize(),
#         }

#     # ── Public API ───────────────────────────────────────────────────────────

#     def generate_mcqs(
#         self,
#         text:          Optional[str],
#         num_questions: int = 10,
#         difficulty:    str = "mixed",
#     ) -> List[Dict]:
#         """
#         Generate up to *num_questions* MCQs from *text*.

#         Parameters
#         ----------
#         text          : source text (any length)
#         num_questions : how many questions to produce (default 10)
#         difficulty    : "easy" | "medium" | "hard" | "mixed"

#         Returns
#         -------
#         List of dicts:
#             {
#                 "id":             int,
#                 "question":       str,
#                 "options":        {"A": str, "B": str, "C": str, "D": str},
#                 "correct_answer": "A" | "B" | "C" | "D",
#                 "explanation":    str,
#                 "difficulty":     "Easy" | "Medium" | "Hard",
#             }
#         """
#         if not text or not text.strip():
#             return []

#         text = self._safe_text(text)

#         # ── 1. Extract key sentences ─────────────────────────────────────────
#         max_candidates = 10
#         sentences = _extract_key_sentences(text, max_sentences=max_candidates)

#         if not sentences:
#             logger.warning("MCQGenerator: no usable sentences extracted from text.")
#             return []

#         # ── 2. Build difficulty sequence ─────────────────────────────────────
#         diff_sequence: List[str]
#         if difficulty == "mixed":
#             diff_sequence = [_DIFFICULTY_CYCLE[i % 3] for i in range(num_questions)]
#         else:
#             diff_sequence = [difficulty.lower()] * num_questions

#         # ── 3. Prepare sentence pool (shuffled, deduplicated) ────────────────
#         random.shuffle(sentences)
#         # Repeat pool if we need more sentences than available
#         multiplier = (num_questions // max(len(sentences), 1)) + 2
#         sent_pool: List[str] = []
#         seen_pool: Set[str]  = set()
#         for s in sentences * multiplier:
#             if s not in seen_pool:
#                 seen_pool.add(s)
#                 sent_pool.append(s)

#         # ── 4. Generate MCQs ─────────────────────────────────────────────────
#         # mcqs:               List[Dict] = []
#         # used_fingerprints:  Set[str]   = set()
#         # sent_index:         int        = 0
#         # max_attempts:       int        = num_questions * 4  # safety cap

#         # for _ in range(max_attempts):
#         #     if len(mcqs) >= num_questions:
#         #         break
#         #     if sent_index >= len(sent_pool):
#         #         break

#         #     context     = sent_pool[sent_index]
#         #     sent_index += 1
#         #     target_diff = diff_sequence[len(mcqs)]

#         #     # ── 4a. Model inference ──────────────────────────────────────────
#         #     raw    = self._generate_one(context, target_diff)
#         #     print("\nRAW OUTPUT:")
#         #     print(raw)
#         #     print("=" * 100)
#         #     parsed = _parse_mcq(raw, target_diff) if raw else None
#         #     print("PARSED =", parsed)

#         #     # ── 4b. Retry once with a fresh context if parse failed ──────────
#         #     if parsed is None and sent_index < len(sent_pool):
#         #         context2    = sent_pool[sent_index]
#         #         sent_index += 1
#         #         raw2        = self._generate_one(context2, target_diff)
#         #         parsed      = _parse_mcq(raw2, target_diff) if raw2 else None
#         #         if parsed is None:
#         #             context = context2  # use for fallback

#         #     # ── 4c. Rule-based fallback ──────────────────────────────────────
#         #     if parsed is None:
#         #         parsed = self._fallback_mcq(context, len(mcqs) + 1, target_diff)

#         #     if parsed is None:
#         #         continue

#         #     # ── 4d. Validate and fix ─────────────────────────────────────────
#         #     validated = _validate_and_fix(parsed, context_sentences=set(sentences))
#         #     if validated is None:
#         #         continue

#         #     # ── 4e. Deduplicate ──────────────────────────────────────────────
#         #     fp = _fingerprint(validated["question"])
#         #     if fp in used_fingerprints:
#         #         continue
#         #     used_fingerprints.add(fp)

#         #     # ── 4f. Enhance distractors ──────────────────────────────────────
#         #     validated = self._enhance_distractors(validated)

#         #     # ── 4g. Assign sequential id ─────────────────────────────────────
#         #     validated["id"] = len(mcqs) + 1
#         #     mcqs.append(validated)

#         # logger.info(
#         #     "MCQGenerator: produced %d / %d requested MCQs (difficulty=%s).",
#         #     len(mcqs), num_questions, difficulty,
#         # )
#         # return mcqs

#         # ── Batch generation ──────────────────────────────────────────────

#         context = " ".join(sentences[:5])

#         target_diff = (
#             difficulty.lower()
#             if difficulty != "mixed"
#             else "medium"
#         )

#         raw = self._generate_batch(
#             context=context,
#             difficulty=target_diff,
#             num_questions=num_questions
#         )

#         print("\nRAW BATCH OUTPUT:")
#         print(raw)
#         print("=" * 100)

#         questions = self._parse_batch_mcqs(raw) if raw else []

#         mcqs = []
#         used_fingerprints = set()

#         for q in questions:

#             parsed = {
#                 "question": q.get("question", ""),
#                 "options": q.get("options", {}),
#                 "correct_answer": q.get("answer", "A"),
#                 "difficulty": q.get("difficulty", target_diff),
#                 "explanation": ""
#             }

#             validated = _validate_and_fix(
#                 parsed,
#                 context_sentences=set(sentences)
#             )

#             if validated is None:
#                 continue

#             fp = _fingerprint(validated["question"])

#             if fp in used_fingerprints:
#                 continue

#             used_fingerprints.add(fp)

#             validated = self._enhance_distractors(validated)

#             validated["id"] = len(mcqs) + 1

#             mcqs.append(validated)

#         logger.info(
#             "MCQGenerator: produced %d / %d requested MCQs (batch mode).",
#             len(mcqs),
#             num_questions
#         )

#         return mcqs

#     # ── Utility ──────────────────────────────────────────────────────────────

#     @staticmethod
#     def _safe_text(text: str) -> str:
#         """Strip non-UTF-8 bytes."""
#         return text.encode("utf-8", "ignore").decode("utf-8")


# # =============================================================================
# # PERFORMANCE AND MEMORY OPTIMISATION RECOMMENDATIONS
# # =============================================================================
# #
# # 1. HARDWARE TARGETS
# #    ─────────────────
# #    | Config              | VRAM / RAM  | Speed per Q | Notes                   |
# #    |---------------------|-------------|-------------|-------------------------|
# #    | CUDA GPU, fp16      | ~6 GB VRAM  | 2–5 s       | Best for production     |
# #    | CUDA GPU, 4-bit     | ~3 GB VRAM  | 3–8 s       | Set QUILLMIND_QWEN_4BIT=1|
# #    | CPU, fp32           | ~12 GB RAM  | 15–40 s     | Functional, slow        |
# #    | CPU, int8 (manual)  | ~6 GB RAM   | 20–50 s     | See note below          |
# #
# # 2. ENABLING 4-BIT QUANTISATION (recommended for GPU with < 8 GB VRAM)
# #    ────────────────────────────────────────────────────────────────────
# #    pip install bitsandbytes>=0.43.0
# #    Set in .env:  QUILLMIND_QWEN_4BIT=1
# #    Requires a CUDA GPU.  Not supported on CPU or MPS.
# #
# # 3. CPU INT8 (alternative for CPU-only systems)
# #    ─────────────────────────────────────────────
# #    Replace float32 load with:
# #        self._model = AutoModelForCausalLM.from_pretrained(
# #            _MODEL_ID, load_in_8bit=True, device_map="auto"
# #        )
# #    Needs:  pip install bitsandbytes  (Linux/Mac only — not Windows natively)
# #    Windows alternative: use llama.cpp with the GGUF version of Qwen2.5-3B.
# #
# # 4. WINDOWS NOTES
# #    ──────────────
# #    - bitsandbytes works on Windows with CUDA via the pre-built wheel:
# #        pip install bitsandbytes --index-url https://huggingface.github.io/bitsandbytes-windows-webui
# #    - CPU fp32 inference works out-of-the-box on Windows with no extras.
# #    - torch.compile() (PyTorch 2+) can give ~20 % speedup on CUDA:
# #        self._model = torch.compile(self._model)
# #
# # 5. BATCH GENERATION (future optimisation)
# #    ─────────────────────────────────────────
# #    Currently generates one question per inference call.
# #    Batching N prompts together would be ~2-3× faster on GPU.
# #    Implement by collecting all contexts first, then calling model.generate()
# #    with a padded batch.  Requires left-padding for causal models:
# #        tokenizer.padding_side = "left"
# #
# # 6. CONTEXT WINDOW
# #    ────────────────
# #    Context is capped at 600 chars per question.  This keeps latency low
# #    while giving the model enough information.  For very long, dense PDFs
# #    consider passing 2–3 concatenated sentences (~1 000 chars) per question
# #    to improve answer grounding.
# #
# # 7. CACHING THE MODEL ON DISK
# #    ───────────────────────────
# #    First run downloads ~6 GB.  Set HF_HOME or TRANSFORMERS_CACHE env var
# #    to a directory with enough space:
# #        $env:HF_HOME = "D:\models"           # Windows PowerShell
# #        export HF_HOME=/data/models           # Linux / Mac
# #
# # 8. REQUIREMENTS.TXT ADDITIONS
# #    ────────────────────────────
# #    transformers>=4.43.0
# #    torch>=2.2.0
# #    accelerate>=0.30.0
# #    sentencepiece>=0.1.99
# #    tokenizers>=0.19.0
# #    nltk>=3.8.0
# #    bitsandbytes>=0.43.0   # optional — only for 4-bit mode



"""
QuillMind — MCQ Generator (Exam Maker Module)
=============================================
Generates high-quality multiple-choice questions from raw text
using the Groq API (llama3-8b-8192 by default).

Why Groq instead of a local model
----------------------------------
* No GPU / RAM requirements — runs as a pure API call.
* Speed: ~0.5–2 s per question vs 15–40 s for Qwen on CPU.
* No timeouts — each question is a small, fast request.
* llama3-8b on Groq follows JSON instructions extremely reliably.
* Re-uses the GROQ_API_KEY and GROQ_MODEL already in settings.py —
  no new credentials needed.

Changes from the Flan-T5 / Qwen version
-----------------------------------------
* Removed: transformers, torch, accelerate, T5/Qwen model loading.
* Removed: _generate_one() local inference pipeline.
* Removed: local prompt templates (text or ChatML format).
* Added:   Groq SDK client (groq.Groq) initialised once in __init__.
* Added:   _call_groq() — wrapper around chat.completions.create()
           with response_format={"type":"json_object"} for guaranteed JSON.
* Added:   Per-question retry logic (up to MAX_RETRIES attempts).
* Parser:  Simplified — Groq JSON mode means responses are always valid
           JSON; the parser only validates keys and normalises values.
* All public signatures unchanged: generate_mcqs(text, num_questions, difficulty)
  returns the same list-of-dicts schema consumed by the router and frontend.

Dependencies (only new one needed)
------------------------------------
    groq>=0.9.0    ->  pip install groq
    nltk>=3.8.0    (unchanged — already installed)

Remove from requirements.txt:
    torch, transformers, accelerate, sentencepiece, bitsandbytes
"""

from __future__ import annotations

import hashlib
import json
import os
import random
import re
import time
from collections import Counter
from typing import Dict, List, Optional, Set, Tuple

import nltk
from nltk.corpus import stopwords, wordnet as wn
from nltk.tokenize import sent_tokenize

from config.settings import GROQ_API_KEY, GROQ_MODEL
from shared.utils.logger import logger

# ---------------------------------------------------------------------------
# NLTK bootstrap (unchanged)
# ---------------------------------------------------------------------------
_NLTK_PACKAGES = [
    "punkt", "punkt_tab",
    "averaged_perceptron_tagger", "averaged_perceptron_tagger_eng",
    "stopwords", "wordnet", "omw-1.4",
]


def _ensure_nltk_data() -> None:
    for pkg in _NLTK_PACKAGES:
        for prefix in ("tokenizers", "corpora", "taggers"):
            try:
                nltk.data.find(f"{prefix}/{pkg}")
                break
            except LookupError:
                pass
        else:
            try:
                nltk.download(pkg, quiet=True)
            except Exception:
                pass


_ensure_nltk_data()

_STOP_WORDS: Set[str] = set()
try:
    _STOP_WORDS = set(stopwords.words("english"))
except Exception:
    pass

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
_LETTERS          = ("A", "B", "C", "D")
_DIFFICULTY_CYCLE = ["easy", "medium", "hard"]
MAX_RETRIES       = 2      # retry attempts per question on parse failure
RETRY_DELAY       = 0.5   # seconds to wait between retries
MAX_CONTEXT_CHARS = 1500  # chars of source text sent per question

# ---------------------------------------------------------------------------
# Prompt templates
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = """\
You are an expert academic MCQ generator.

OUTPUT FORMAT — return ONLY a single valid JSON object, no markdown, no extra text:
{
  "question":       "<complete question ending with ?>",
  "options":        {"A": "<option>", "B": "<option>", "C": "<option>", "D": "<option>"},
  "correct_answer": "<A|B|C|D>",
  "explanation":    "<one concise sentence explaining why the answer is correct>",
  "difficulty":     "<easy|medium|hard>"
}

STRICT RULES:
- Base the question ONLY on the provided text. Do not use outside knowledge.
- All four options must be distinct and non-empty strings.
- Distractors must be plausible but clearly incorrect to someone who read the text.
- Do NOT use fill-in-the-blank style (no blanks or underscores in the question).
- Do NOT use "All of the above" or "None of the above".
- The question must be self-contained and readable without the source text.
- difficulty must be exactly one of: easy, medium, hard (lowercase).
"""

_USER_EASY = """\
Generate ONE easy-difficulty MCQ from the text below.
Easy = tests direct recall of an explicit fact stated in the text.

TEXT:
{context}
"""

_USER_MEDIUM = """\
Generate ONE medium-difficulty MCQ from the text below.
Medium = tests understanding of a concept, relationship, or process described in the text.

TEXT:
{context}
"""

_USER_HARD = """\
Generate ONE hard-difficulty MCQ from the text below.
Hard = tests the ability to apply, infer, or critically analyse information from the text.
Distractors should be sophisticated and require careful reasoning to eliminate.

TEXT:
{context}
"""

_USER_TEMPLATES: Dict[str, str] = {
    "easy":   _USER_EASY,
    "medium": _USER_MEDIUM,
    "hard":   _USER_HARD,
}


# ---------------------------------------------------------------------------
# Helper: extract key sentences
# ---------------------------------------------------------------------------

def _extract_key_sentences(text: str, max_sentences: int = 40) -> List[str]:
    """
    Return the most informative sentences from *text* ranked by a lightweight
    heuristic. Unchanged logic from the previous Qwen version.
    """
    raw_sentences: List[str] = []
    try:
        raw_sentences = sent_tokenize(text)
    except Exception:
        raw_sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]

    scored: List[Tuple[float, str]] = []
    for sent in raw_sentences:
        sent = re.sub(r"\s+", " ", sent.strip())
        words = sent.split()
        if len(words) < 8 or len(words) > 120:
            continue

        score = 0.0
        lower = sent.lower()

        if any(p in lower for p in ("is the ", "are the ", "refers to", "defined as",
                                     "known as ", "is a ", "are a ", "called ")):
            score += 3.0
        if any(p in lower for p in ("occurs ", "involves ", "produces ", "converts ",
                                     "results in", "leads to", "causes ", "affects ",
                                     "depends on", "consists of", "composed of")):
            score += 2.0
        if re.search(r"\d", sent):
            score += 1.0
        score += min(len(words) / 10.0, 2.0)

        scored.append((score, sent))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [s for _, s in scored[:max_sentences]]


# ---------------------------------------------------------------------------
# Helper: build a richer context window from nearby sentences
# ---------------------------------------------------------------------------

def _build_context(sentences: List[str], primary_idx: int) -> str:
    """
    Return a context string centred on *primary_idx* that stays under
    MAX_CONTEXT_CHARS. Adds neighbouring sentences for better grounding.
    Groq's 8 K context window can easily handle 1 500 chars.
    """
    primary = sentences[primary_idx]
    context = primary
    for offset in (1, -1, 2, -2):
        neighbour_idx = primary_idx + offset
        if 0 <= neighbour_idx < len(sentences):
            candidate = context + " " + sentences[neighbour_idx]
            if len(candidate) <= MAX_CONTEXT_CHARS:
                context = candidate
    return context.strip()


# ---------------------------------------------------------------------------
# Helper: WordNet distractors (unchanged)
# ---------------------------------------------------------------------------

def _wordnet_distractors(answer: str, n: int = 3) -> List[str]:
    candidates: Set[str] = set()
    synsets = wn.synsets(answer.replace(" ", "_"))
    for synset in synsets[:3]:
        for hypernym in synset.hypernyms()[:2]:
            for hyponym in hypernym.hyponyms()[:6]:
                for lemma in hyponym.lemmas()[:2]:
                    name = lemma.name().replace("_", " ")
                    if name.lower() != answer.lower() and len(name) > 2:
                        candidates.add(name)
            for lemma in hypernym.lemmas()[:2]:
                name = lemma.name().replace("_", " ")
                if name.lower() != answer.lower():
                    candidates.add(name)
        for lemma in synset.lemmas():
            for ant in lemma.antonyms():
                candidates.add(ant.name().replace("_", " "))
    result = list(candidates)
    random.shuffle(result)
    return result[:n]


# ---------------------------------------------------------------------------
# Helper: parse the Groq JSON response
# ---------------------------------------------------------------------------

def _parse_groq_response(raw: str, fallback_difficulty: str = "medium") -> Optional[Dict]:
    """
    Parse the JSON string returned by Groq into a validated MCQ dict.

    Groq's json_object mode guarantees valid JSON so this is mainly key
    normalisation and value validation.
    Returns None if required fields are missing or malformed.
    """
    if not raw:
        return None

    # Strip any accidental markdown fences
    raw = re.sub(r"```(?:json)?", "", raw, flags=re.IGNORECASE).strip().strip("`")

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        m = re.search(r"\{.*\}", raw, re.DOTALL)
        if not m:
            return None
        try:
            data = json.loads(m.group())
        except json.JSONDecodeError:
            return None

    if not isinstance(data, dict):
        return None

    # question
    question = str(data.get("question", "")).strip()
    if not question:
        return None

    # options — accept dict {"A":…} or list ["a","b","c","d"]
    opts_raw = data.get("options", {})
    if isinstance(opts_raw, list) and len(opts_raw) >= 4:
        opts = {_LETTERS[i]: str(v).strip() for i, v in enumerate(opts_raw[:4])}
    elif isinstance(opts_raw, dict):
        opts = {}
        for k, v in opts_raw.items():
            k_norm = k.strip().upper()
            if k_norm in _LETTERS:
                opts[k_norm] = str(v).strip()
    else:
        return None

    if len(opts) != 4:
        return None

    # correct_answer — accept "A" or "A. some text"
    ans = str(data.get("correct_answer", data.get("answer", ""))).strip().upper()
    if ans and ans[0] in _LETTERS:
        ans = ans[0]
    if ans not in _LETTERS:
        return None

    explanation = str(data.get("explanation", "")).strip()

    diff = str(data.get("difficulty", fallback_difficulty)).strip().lower()
    if diff not in ("easy", "medium", "hard"):
        diff = fallback_difficulty.lower()

    return {
        "question":       question,
        "options":        {ltr: opts.get(ltr, "[Option]") for ltr in _LETTERS},
        "correct_answer": ans,
        "explanation":    explanation,
        "difficulty":     diff,
    }


# ---------------------------------------------------------------------------
# Helper: validate and fix a parsed MCQ
# ---------------------------------------------------------------------------

def _validate_and_fix(mcq: Dict) -> Optional[Dict]:
    """
    Quality gates + minor auto-fixes.

    Rejects:  question < 10 / > 400 chars, fill-in blanks, empty options,
              all-identical options.
    Fixes:    capitalise question, append '?', fill empty slots.
    """
    q = mcq.get("question", "").strip()
    if len(q) < 10 or len(q) > 400:
        return None
    if "______" in q or "____" in q:
        return None
    if not q[0].isupper():
        q = q[0].upper() + q[1:]
    if q[-1] not in ".?!":
        q += "?"

    opts = {ltr: mcq.get("options", {}).get(ltr, "").strip() for ltr in _LETTERS}
    ans  = mcq.get("correct_answer", "A").upper()

    for ltr in _LETTERS:
        if not opts[ltr]:
            opts[ltr] = "[Option]"

    if len(set(opts.values())) == 1:
        return None

    if ans not in _LETTERS:
        ans = "A"

    return {
        "question":       q,
        "options":        opts,
        "correct_answer": ans,
        "explanation":    mcq.get("explanation", "").strip(),
        "difficulty":     mcq.get("difficulty", "medium"),
    }


# ---------------------------------------------------------------------------
# Helper: deduplication fingerprint
# ---------------------------------------------------------------------------

def _fingerprint(question: str) -> str:
    clean = re.sub(r"[^a-z0-9\s]", "", question.lower())
    words = sorted(w for w in clean.split() if w not in _STOP_WORDS and len(w) > 2)
    return hashlib.sha1(" ".join(words[:8]).encode()).hexdigest()[:12]


# ---------------------------------------------------------------------------
# Main class
# ---------------------------------------------------------------------------

class MCQGenerator:
    """
    Generates MCQs from text using the Groq API.

    Instantiate once at startup via init_exam_workflow().
    The Groq client is stateless and safe for concurrent use.

    Usage
    -----
        gen = MCQGenerator()
        mcqs = gen.generate_mcqs(text, num_questions=10, difficulty="mixed")
    """

    def __init__(self) -> None:
        self._client = None
        self._model  = GROQ_MODEL or "llama3-8b-8192"
        self._init_client()

    # ── Client init ──────────────────────────────────────────────────────────

    def _init_client(self) -> None:
        """Initialise Groq SDK client using GROQ_API_KEY from settings.py."""
        try:
            from groq import Groq
            if not GROQ_API_KEY:
                raise ValueError(
                    "GROQ_API_KEY is not set in your .env file. "
                    "Get a free key at https://console.groq.com"
                )
            self._client = Groq(api_key=GROQ_API_KEY)
            logger.info("MCQGenerator: Groq client ready (model=%s).", self._model)
        except ImportError:
            logger.error(
                "MCQGenerator: 'groq' package not installed. Run: pip install groq"
            )
            self._client = None
        except Exception as exc:
            logger.error("MCQGenerator: Groq client init failed — %s", exc)
            self._client = None

    # ── Core Groq call ───────────────────────────────────────────────────────

    def _call_groq(self, context: str, difficulty: str) -> Optional[str]:
        """
        One Groq chat completion call → raw JSON string.
        response_format=json_object forces valid JSON output from the model.
        Returns None on any error.
        """
        if self._client is None:
            return None

        user_text = _USER_TEMPLATES.get(difficulty, _USER_MEDIUM).format(
            context=context
        )

        try:
            response = self._client.chat.completions.create(
                model=self._model,
                messages=[
                    {"role": "system", "content": _SYSTEM_PROMPT},
                    {"role": "user",   "content": user_text},
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
                max_tokens=512,
                top_p=0.9,
            )
            return response.choices[0].message.content
        except Exception as exc:
            logger.warning("MCQGenerator: Groq API call failed — %s", exc)
            return None

    # ── Distractor enhancement ───────────────────────────────────────────────

    def _enhance_distractors(self, mcq: Dict) -> Dict:
        """Replace placeholder [Option] distractors with WordNet alternatives."""
        opts         = mcq["options"].copy()
        correct      = mcq["correct_answer"]
        correct_text = opts.get(correct, "")

        wn_pool = _wordnet_distractors(correct_text, n=6)
        wn_iter = iter(wn_pool)

        for ltr in _LETTERS:
            if ltr == correct:
                continue
            val = opts.get(ltr, "").strip()
            if val in ("[Option]", "", correct_text) or len(val) < 2:
                replacement = next(wn_iter, None)
                if replacement:
                    opts[ltr] = replacement.capitalize()

        mcq["options"] = opts
        return mcq

    # ── Rule-based fallback (Groq unavailable) ───────────────────────────────

    @staticmethod
    def _fallback_mcq(sentence: str, difficulty: str) -> Optional[Dict]:
        """
        Minimal fill-in-the-blank MCQ used ONLY when Groq is unreachable.
        Should almost never trigger in practice.
        """
        words = [w for w in sentence.split() if len(w) > 4 and w.isalpha()]
        if not words:
            return None

        subject = Counter(words).most_common(1)[0][0]
        stem    = sentence.replace(subject, "______", 1)
        stem    = stem[0].upper() + stem[1:]
        if "______" not in stem:
            return None

        distractors = _wordnet_distractors(subject, n=3)
        while len(distractors) < 3:
            distractors.append("[Option]")
        distractors = distractors[:3]

        pool    = [subject] + distractors
        random.shuffle(pool)
        opts    = {ltr: pool[i] for i, ltr in enumerate(_LETTERS)}
        correct = _LETTERS[pool.index(subject)]

        return {
            "question":       f"Which term correctly fills the blank: {stem}?",
            "options":        opts,
            "correct_answer": correct,
            "explanation":    f"'{subject}' is the term used in the source text.",
            "difficulty":     difficulty,
        }

    # ── Public API ───────────────────────────────────────────────────────────

    def generate_mcqs(
        self,
        text:          Optional[str],
        num_questions: int = 10,
        difficulty:    str = "mixed",
    ) -> List[Dict]:
        """
        Generate up to *num_questions* MCQs from *text* via Groq.

        Parameters
        ----------
        text          : source text (any length)
        num_questions : how many questions to produce (default 10)
        difficulty    : "easy" | "medium" | "hard" | "mixed"

        Returns
        -------
        List of dicts matching the existing frontend schema:
            {
                "id":             int,
                "question":       str,
                "options":        {"A": str, "B": str, "C": str, "D": str},
                "correct_answer": "A" | "B" | "C" | "D",
                "explanation":    str,
                "difficulty":     "easy" | "medium" | "hard",
            }
        """
        if not text or not text.strip():
            return []

        text = self._safe_text(text)

        # 1. Extract and rank key sentences
        max_candidates = max(num_questions * 3, 40)
        sentences = _extract_key_sentences(text, max_sentences=max_candidates)
        if not sentences:
            logger.warning("MCQGenerator: no usable sentences extracted.")
            return []

        # 2. Difficulty sequence
        if difficulty == "mixed":
            diff_sequence = [_DIFFICULTY_CYCLE[i % 3] for i in range(num_questions)]
        else:
            diff_sequence = [difficulty.lower()] * num_questions

        # 3. Sentence pool (shuffled, deduplicated)
        random.shuffle(sentences)
        multiplier = (num_questions // max(len(sentences), 1)) + 2
        seen_pool: Set[str]  = set()
        sent_pool: List[str] = []
        for s in sentences * multiplier:
            if s not in seen_pool:
                seen_pool.add(s)
                sent_pool.append(s)

        # 4. Generate MCQs
        mcqs:              List[Dict] = []
        used_fingerprints: Set[str]   = set()
        sent_index:        int        = 0
        max_attempts:      int        = num_questions * 4

        for _ in range(max_attempts):
            if len(mcqs) >= num_questions:
                break
            if sent_index >= len(sent_pool):
                break

            target_diff = diff_sequence[len(mcqs)]
            primary_idx = min(sent_index, len(sentences) - 1)
            context     = _build_context(sentences, primary_idx)
            sent_index += 1

            # 4a. Groq call with retry
            parsed = None
            for attempt in range(MAX_RETRIES):
                raw    = self._call_groq(context, target_diff)
                parsed = _parse_groq_response(raw, target_diff) if raw else None
                if parsed:
                    break
                if attempt < MAX_RETRIES - 1:
                    logger.debug("MCQGenerator: retrying question (attempt %d)…", attempt + 1)
                    time.sleep(RETRY_DELAY)

            # 4b. Rule-based fallback
            if parsed is None:
                parsed = self._fallback_mcq(sent_pool[sent_index - 1], target_diff)
            if parsed is None:
                continue

            # 4c. Validate
            validated = _validate_and_fix(parsed)
            if validated is None:
                continue

            # 4d. Deduplicate
            fp = _fingerprint(validated["question"])
            if fp in used_fingerprints:
                continue
            used_fingerprints.add(fp)

            # 4e. Enhance distractors
            validated = self._enhance_distractors(validated)

            # 4f. Assign id
            validated["id"] = len(mcqs) + 1
            mcqs.append(validated)

            logger.info(
                "MCQGenerator: %d/%d done (difficulty=%s).",
                len(mcqs), num_questions, target_diff,
            )

        logger.info(
            "MCQGenerator: finished — %d/%d MCQs (difficulty=%s).",
            len(mcqs), num_questions, difficulty,
        )
        return mcqs

    @staticmethod
    def _safe_text(text: str) -> str:
        return text.encode("utf-8", "ignore").decode("utf-8")