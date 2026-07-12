# QuillMind — AI-Powered Academic Platform (Frontend)

> Production-ready React frontend for QuillMind — built with Vite, Tailwind CSS, Framer Motion, Redux Toolkit, and React Query.

---

## 🏗 Project Structure

```
quillmind/
├── public/
├── src/
│   ├── api/
│   │   ├── axios.js          ← Axios instance with JWT interceptor
│   │   ├── auth.js           ← Auth API re-export
│   │   └── index.js          ← ALL API service functions (qaAPI, readingAPI, etc.)
│   ├── components/
│   │   ├── chat/
│   │   │   └── ChatInterface.jsx    ← Reusable ChatGPT-like chat UI
│   │   ├── common/
│   │   │   └── FileDropzone.jsx     ← Drag & drop file upload
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx        ← Main dashboard layout
│   │   │   ├── AdminLayout.jsx      ← Admin panel layout
│   │   │   ├── PublicLayout.jsx     ← Landing/public layout
│   │   │   ├── Sidebar.jsx          ← Animated sidebar with all nav links
│   │   │   └── Navbar.jsx           ← Top navbar with breadcrumbs
│   │   └── ui/
│   │       └── index.jsx            ← Button, Input, Card, Badge, Modal, Skeleton, etc.
│   ├── hooks/
│   │   └── index.js          ← useAuth, useTheme, useSidebar
│   ├── pages/
│   │   ├── admin/            ← AdminDashboard, Users, SubAdmins, Docs, Files, Settings
│   │   ├── auth/             ← Login, Register, Forgot, AdminLogin
│   │   ├── dashboard/        ← Home, GeneralChat, DocumentQA, History, Settings, Profile
│   │   ├── exam/             ← ExamPage (MCQ + Quiz mode + Scoreboard)
│   │   ├── landing/          ← Landing, Features, About, Contact
│   │   ├── reading/          ← ReadingPage (3-panel reader)
│   │   └── summary/          ← SummaryPage
│   ├── routes/
│   │   ├── ProtectedRoute.jsx
│   │   └── AdminRoute.jsx
│   ├── store/
│   │   ├── index.js           ← Redux store
│   │   └── slices/
│   │       ├── authSlice.js   ← Login, register, logout, JWT
│   │       ├── themeSlice.js  ← Dark/light mode
│   │       └── uiSlice.js     ← Sidebar state, modals
│   ├── styles/
│   │   └── globals.css        ← Design tokens, glassmorphism, animations
│   ├── App.jsx                ← Full router setup
│   └── main.jsx               ← Entry point
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd quillmind
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env — set VITE_API_URL to your FastAPI backend URL
```

### 3. Start development server
```bash
npm run dev
# Opens at http://localhost:3000
```

### 4. Build for production
```bash
npm run build
npm run preview
```

---

## 🔌 API Integration

All API calls are in `src/api/index.js`. Each function maps directly to your FastAPI endpoints:

```js
// General Q&A
qaAPI.ask({ question, history })         → POST /qa/general/

// Document Q&A
docQaAPI.ask({ question, document_id })  → POST /qa/ask/

// Reading
readingAPI.upload(formData)              → POST /reading/upload/
readingAPI.extract({ document_id })      → GET  /reading/extract/
readingAPI.getPage({ document_id, page })→ GET  /reading/page/
readingAPI.getAllPages({ document_id })  → GET  /reading/all-pages/
readingAPI.getInsight({ document_id })   → GET  /reading/insight/
readingAPI.chat({ question, document_id })→ POST /reading/chat/
readingAPI.saveProgress(payload)         → POST /reading/progress/save/
readingAPI.getProgress(params)           → GET  /reading/progress/

// Summary
summaryAPI.fromText({ text, length })    → POST /summary/text/
summaryAPI.fromPdf(formData)             → POST /summary/pdf/

// Exam
examAPI.fromText({ text, num_questions, difficulty }) → POST /exam/generate/
examAPI.fromPdf(formData)                             → POST /exam/generate-from-pdf/

// Admin
adminAPI.addSubAdmin(data)               → POST /admin/sub-admins/add/
adminAPI.deleteSubAdmin(id)              → DELETE /admin/sub-admins/delete/
adminAPI.listSubAdmins()                 → GET  /admin/sub-admins/
adminAPI.upload(folder, formData)        → POST /admin/upload/{folder}/
adminAPI.deleteFile(folder, filename)    → DELETE /admin/delete/{folder}/{filename}/
adminAPI.reloadDocs()                    → POST /admin/reload/
adminAPI.viewAll()                       → GET  /admin/view/
adminAPI.downloadFile(folder, filename)  → GET  /admin/download/{folder}/{filename}
```

---

## 🎨 Design System

- **Colors**: Indigo (brand), Violet, Emerald accents
- **Dark/Light Mode**: CSS variables + Tailwind `dark:` class
- **Glassmorphism**: `.glass`, `.glass-card` utility classes
- **Animations**: Framer Motion + Tailwind keyframes
- **Typography**: Sora (UI) + JetBrains Mono (code)
- **Components**: Button, Input, Card, Badge, Modal, Skeleton, EmptyState, StatCard, ProgressBar

---

## 🔐 Authentication Flow

1. User logs in → `POST /auth/login/` → JWT token stored in `localStorage`
2. Axios interceptor attaches `Authorization: Bearer <token>` to every request
3. On 401 → auto logout + redirect to `/login`
4. Redux `authSlice` manages `user`, `token`, `isAdmin` state
5. `ProtectedRoute` guards all `/dashboard/*` routes
6. `AdminRoute` guards all `/admin/*` routes (requires `isAdmin`)

---

## 📱 Responsive Layout

| Screen     | Layout                          |
|------------|---------------------------------|
| Mobile     | Hamburger menu, stacked panels  |
| Tablet     | Collapsible sidebar             |
| Desktop    | Full 3-panel reading, sidebars  |

---

## 🛠 Customization Checklist

- [ ] Update `VITE_API_URL` in `.env` to point to your FastAPI server
- [ ] Adjust API response shapes in `src/api/index.js` to match your backend
- [ ] Add real auth endpoints (`/auth/login/`, `/auth/register/`) in FastAPI
- [ ] Replace mock data in History/Admin pages with real API calls via React Query
- [ ] Add JWT refresh token logic if needed
- [ ] Deploy frontend to Vercel / Netlify; backend to Railway / Render

---

## 🧩 Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Framework   | React 18 + Vite 5                 |
| Styling     | Tailwind CSS 3 + custom CSS vars  |
| Animation   | Framer Motion 11                  |
| State       | Redux Toolkit + React Query 5     |
| Forms       | React Hook Form 7                 |
| HTTP        | Axios with interceptors           |
| Routing     | React Router 6                    |
| Markdown    | react-markdown + remark-gfm       |
| File Upload | react-dropzone                    |
| Toasts      | react-hot-toast                   |
| Icons       | lucide-react                      |
