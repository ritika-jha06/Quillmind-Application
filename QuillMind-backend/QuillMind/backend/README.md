# QuillMind 🧠✍️

> **AI-Powered Academic Platform** — Q&A, Summarization, Exam Generation, and Reading Application in a single production-ready backend.

---

## 📌 Project Overview

QuillMind is a Final Year Project that integrates four AI-powered academic tools into one unified FastAPI backend:

| Module | Description |
|---|---|
| **Q&A** | Ask natural-language questions against uploaded PDF documents |
| **Summary Maker** | Generate structured AI summaries from text or PDFs |
| **Exam Maker** | Auto-generate multiple-choice questions from any text or PDF |
| **Reading App** | Page-by-page PDF reading with AI comprehension insights and progress tracking |

---

## ✨ Features

- 🔍 **Semantic Search** — SentenceTransformer embeddings + cosine similarity for accurate retrieval
- ⚡ **Groq + LLaMA 3** — Ultra-fast, free-tier LLM powering Q&A, summaries, and reading insights
- 📝 **MCQ Generation** — spaCy NLP-based multiple-choice question generation (no LLM tokens used)
- 📄 **PDF Processing** — Upload, index, read, and summarize PDF documents
- 🔐 **JWT Authentication** — Sub-admin account management with token-based auth
- 📂 **Subject-based Indexing** — PDFs organized by subject folder for targeted Q&A
- 📊 **Reading Progress** — Track the last-read page per user per document
- 🪵 **Structured Logging** — All events logged to console and `logs/quillmind.log`
- ⚡ **Modular Architecture** — Clean separation of modules, workflows, shared services, and API routers

---

## 🏗️ Architecture

```
Request → FastAPI Router → Workflow → Module Service → Shared Services → Response
                                                      ↓
                                          (Groq LLM / VectorStore / DB / Embeddings)
```

All AI model singletons (SentenceTransformer, spaCy, Groq client) are loaded **once at startup** and shared across all modules.

---

## 📁 Folder Structure

```
QuillMind/
└── backend/
    ├── main.py                        # App entry point, startup, router registration
    ├── requirements.txt
    ├── .env.example
    │
    ├── config/
    │   └── settings.py                # Centralized env config
    │
    ├── api/
    │   ├── admin_router.py            # Auth, file management
    │   ├── qa_router.py               # Q&A endpoints
    │   ├── summary_router.py          # Summary endpoints
    │   ├── exam_router.py             # MCQ generation endpoints
    │   └── reading_router.py          # Reading + progress endpoints
    │
    ├── workflows/
    │   ├── qa_workflow.py
    │   ├── summary_workflow.py
    │   ├── exam_workflow.py
    │   └── reading_workflow.py
    │
    ├── modules/
    │   ├── qa/qa_service.py
    │   ├── summary/summary_service.py
    │   ├── exam/mcq_generator.py
    │   └── reading/reading_service.py
    │
    ├── shared/
    │   ├── llm/groq_client.py              # Singleton Groq client
    │   ├── embeddings/sentence_encoder.py  # Singleton SentenceTransformer
    │   ├── vectorstore/folder_store.py     # In-memory subject index
    │   ├── preprocessing/text_processor.py # PDF extraction, chunking, cleaning
    │   ├── prompts/templates.py            # All LLM prompt strings
    │   └── utils/
    │       ├── logger.py
    │       └── auth.py
    │
    ├── database/
    │   └── db.py                      # SQLite init + connection manager
    │
    ├── uploads/                       # PDF files stored here (auto-created)
    └── logs/                          # Log files (auto-created)
```

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| **FastAPI** | Web framework + auto-generated API docs |
| **Uvicorn** | ASGI server |
| **Groq + LLaMA 3** | LLM for Q&A, summaries, reading insights (free & fast) |
| **SentenceTransformers** | Semantic embeddings (`all-MiniLM-L6-v2`) |
| **spaCy** | NLP for MCQ generation (`en_core_web_sm`) |
| **PyPDF2** | PDF text extraction |
| **SQLite** | Lightweight database for auth + reading progress |
| **PyJWT** | JWT token creation and validation |
| **NLTK** | Tokenization utilities |
| **python-dotenv** | Environment variable management |

---

## ⚙️ Installation Steps

### 1. Clone / Download the Project

```bash
git clone <your-repo-url>
cd QuillMind/backend
```

### 2. Create and Activate a Virtual Environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Download the spaCy Language Model

```bash
python -m spacy download en_core_web_sm
```

### 5. Configure Environment Variables

```bash
cp .env.example .env
# Open .env and set your GROQ_API_KEY
```

---

## 🔑 Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | — | Groq API key (free at https://console.groq.com) |
| `GROQ_MODEL` | No | `llama3-8b-8192` | Groq model string |
| `JWT_SECRET` | ✅ Yes | `quillmind-dev-secret` | JWT signing secret |
| `JWT_EXPIRY_HOURS` | No | `6` | Token validity in hours |
| `SENTENCE_MODEL_NAME` | No | `all-MiniLM-L6-v2` | HuggingFace model name |
| `CHUNK_SIZE` | No | `400` | Words per text chunk |
| `TOP_K_RESULTS` | No | `3` | Chunks retrieved per query |
| `CORS_ORIGINS` | No | `*` | Comma-separated allowed origins |

### Available Groq Models (all free tier)

| Model | Context | Best For |
|---|---|---|
| `llama3-8b-8192` | 8K | Fast responses, development |
| `llama3-70b-8192` | 8K | Higher quality answers |
| `mixtral-8x7b-32768` | 32K | Long documents |

---

## ▶️ Run Commands

```bash
# Development (auto-reload on file changes)
uvicorn main:app --reload

# Production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2

# Custom port
uvicorn main:app --reload --port 8080
```

---

## 📡 API Explanation

### Base URL: `http://127.0.0.1:8000`
### Interactive Docs: `http://127.0.0.1:8000/docs`

---

### 🔐 Admin Endpoints (`/admin`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/admin/login/` | Login and get JWT token |
| `POST` | `/admin/token/` | Get JWT token only |
| `POST` | `/admin/sub-admins/add/` | Create a sub-admin account |
| `DELETE` | `/admin/sub-admins/delete/` | Delete a sub-admin |
| `GET` | `/admin/sub-admins/` | List all sub-admins |
| `POST` | `/admin/upload/{folder}/` | Upload PDFs to a subject folder |
| `DELETE` | `/admin/delete/{folder}/{filename}/` | Delete a file |
| `POST` | `/admin/reload/` | Rebuild the vector index from disk |
| `GET` | `/admin/view/` | List all uploaded files |
| `GET` | `/admin/view/{folder}/` | List files in a specific folder |
| `POST` | `/admin/download/{folder}/` | Download multiple files (base64) |
| `GET` | `/admin/download/{folder}/{filename}` | Download a single file |

> **Default admin credentials:** username: `admin` / password: `quillmind123`
> Change these immediately in production!

---

### 🔍 Q&A Endpoints (`/qa`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/qa/ask/` | Ask a question against indexed PDFs |

**Request Body:**
```json
{
  "question": "What is photosynthesis?",
  "subject": "biology"
}
```

---

### 📄 Summary Endpoints (`/summary`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/summary/text/` | Summarize raw text |
| `POST` | `/summary/pdf/` | Upload a PDF and get a summary |

---

### 📝 Exam Maker Endpoints (`/exam`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/exam/generate/` | Generate MCQs from text |
| `POST` | `/exam/generate-from-pdf/` | Upload PDF and generate MCQs |

**Request Body (text):**
```json
{
  "text": "The mitochondria is the powerhouse of the cell...",
  "number_of_questions": 5
}
```

---

### 📖 Reading Endpoints (`/reading`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/reading/page/?filename=X&page=1` | Get text of a specific page |
| `GET` | `/reading/all-pages/?filename=X` | Get all pages of a PDF |
| `GET` | `/reading/insight/?filename=X&page=1` | Get AI comprehension insight for a page |
| `POST` | `/reading/progress/save/` | Save reading progress |
| `GET` | `/reading/progress/?username=X&filename=Y` | Get reading progress |

---

## 🔄 Module Workflow

### Q&A Workflow
```
User Question → /qa/ask/ → qa_workflow → qa_service
  → VectorStore (retrieve top-K chunks via cosine similarity)
  → Groq/LLaMA 3 (grounded answer from context)
  → Response
```

### Summary Workflow
```
Text/PDF → /summary/ → summary_workflow → summary_service
  → Text Extraction (PDF) → Truncate to 1500 words → Groq/LLaMA 3
  → Structured summary (Overview / Key Points / Conclusion)
  → Response
```

### Exam Maker Workflow
```
Text/PDF → /exam/generate/ → exam_workflow → MCQGenerator (spaCy)
  → POS Tagging → Keyword Extraction → Blank Generation → Distractor Selection
  → Response  [No LLM tokens used]
```

### Reading Workflow
```
PDF + Page → /reading/page/ → reading_workflow → reading_service
  → PDF Page Extraction → (optional) Groq/LLaMA 3 Insight
  → Progress saved in SQLite
  → Response
```

---

## 🖼️ Screenshots

> _Add screenshots of the API docs (Swagger UI) and sample responses here._

- `docs/screenshots/swagger_ui.png`
- `docs/screenshots/qa_response.png`
- `docs/screenshots/mcq_output.png`
- `docs/screenshots/summary_output.png`

---

## 🚀 Future Enhancements

- [ ] Frontend (React / Next.js) integration
- [ ] MongoDB support for scalable document storage
- [ ] User authentication with role-based access control
- [ ] Streaming responses for long LLM answers
- [ ] Support for DOCX and TXT file uploads
- [ ] Export MCQ exams to PDF
- [ ] Reading mode with text highlighting
- [ ] Multi-language support
- [ ] Switch between Groq models per request

---

## 🐛 Troubleshooting

| Problem | Fix |
|---|---|
| `spaCy model not found` | Run `python -m spacy download en_core_web_sm` |
| `GROQ_API_KEY not set` | Add your key to `.env` and restart. Get free key at https://console.groq.com |
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` |
| `No data available` (Q&A) | Upload PDFs first via `/admin/upload/{folder}/` |
| Port already in use | Use `--port 8080` or kill the existing process |
| `JWT decode error` | Ensure `JWT_SECRET` in `.env` matches what was used to create the token |
| `groq.AuthenticationError` | Your GROQ_API_KEY is invalid or missing |
| `Rate limit exceeded` | Switch to `llama3-70b-8192` or wait 1 minute (Groq free tier limit) |

---

## 👥 Contributors

| Name | Role |
|---|---|
| _(Your Name)_ | Full Stack Developer / AI Engineer |

---

## 📜 License

This project was developed as a Final Year Project. All rights reserved.
