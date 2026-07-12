import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Upload, ChevronLeft, ChevronRight,
  ZoomIn, ZoomOut, Sparkles, MessageSquare, RotateCcw,
} from 'lucide-react'
import FileDropzone from '@/components/common/FileDropzone'
import ChatInterface from '@/components/chat/ChatInterface'
import { readingAPI } from '@/api'
import { Button, ProgressBar, Skeleton, Badge, EmptyState } from '@/components/ui'
import toast from 'react-hot-toast'

export default function ReadingPage() {
  const [docId,    setDocId]    = useState(null)
  const [file,     setFile]     = useState(null)
  const [uploading,setUploading]= useState(false)
  const [extracting, setExtracting] = useState(false)
  const [pages,    setPages]    = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [insight,  setInsight]  = useState(null)
  const [loadingInsight, setLoadingInsight] = useState(false)
  const [fontSize, setFontSize] = useState(15)
  const [tab,      setTab]      = useState('content') // content | insight | chat
  const [chatMsgs, setChatMsgs] = useState([])
  const [chatLoad, setChatLoad] = useState(false)

  const totalPages = pages.length
  const progress   = totalPages ? Math.round((currentPage / totalPages) * 100) : 0

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await readingAPI.upload(fd)
      // const id  = res.data?.document_id || res.data?.id
      // setDocId(id)
      // toast.success('Document uploaded! Extracting content...')
      // await extractContent(id)
      const filename = res.data?.filename
      setDocId(filename)
      toast.success('Document uploaded! Extracting content...')
      await extractContent(filename)
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // const extractContent = async (id) => {
  //   setExtracting(true)
  //   try {
  //     const res  = await readingAPI.getAllPages({ document_id: id })
  const extractContent = async (filename) => {
    setExtracting(true)
    try {
      const res = await readingAPI.getAllPages({
        filename: filename
      })
      const pgs  = res.data?.pages || []
      setPages(pgs)
      setCurrentPage(1)
      toast.success(`${pgs.length} pages extracted!`)
    } catch {
      toast.error('Content extraction failed')
    } finally {
      setExtracting(false)
    }
  }

  const loadInsight = async () => {
    if (!docId) return
    setLoadingInsight(true)
    try {
      const res = await readingAPI.getInsight({ filename: docId, page: currentPage })
      setInsight(res.data?.insight || 'No insights available for this page.')
    } catch {
      toast.error('Failed to load insight')
    } finally {
      setLoadingInsight(false)
    }
  }

  const handleChat = useCallback(async (question) => {
    const userMsg = { role: 'user', content: question }
    setChatMsgs((prev) => [...prev, userMsg])
    setChatLoad(true)
    try {
      const res = await readingAPI.chat({ question, filename: docId, page: currentPage })
      const ans = res.data?.answer || res.data?.response || 'No response.'
      setChatMsgs((prev) => [...prev, { role: 'assistant', content: ans }])
    } catch {
      toast.error('Chat failed')
      setChatMsgs((prev) => prev.slice(0, -1))
    } finally {
      setChatLoad(false)
    }
  }, [docId, currentPage])

  const saveProgress = async () => {
    if (!docId) return
    try {
      // await readingAPI.saveProgress({ filename: docId, page: currentPage, progress })
      const user = JSON.parse(localStorage.getItem('qm_user'))
      await readingAPI.saveProgress({
        username: user?.username,
        filename: docId,
        page: currentPage,
        progress,
      })
      toast.success('Progress saved!')
    } catch { toast.error('Could not save progress') }
  }

  const currentContent = pages[currentPage - 1] || ''

  if (!docId) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Reading Application</h1>
          <p className="text-sm text-[var(--text-muted)]">Upload any document for smart AI-powered reading</p>
        </div>
        <div className="glass-card p-2">
          <EmptyState icon={BookOpen} title="Upload a Document to Start Reading"
            description="Supports PDF, scanned PDFs, images, handwritten notes, and more."
          />
          <div className="mt-6">
            <FileDropzone
              onFileSelect={setFile}
              accept={{
                'application/pdf': ['.pdf'],
                'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
                'application/msword': ['.doc', '.docx'],
              }}
              label="Drop your document or image"
              hint="PDF, DOCX, JPG, PNG up to 50MB"
            />
            {file && (
              <Button loading={uploading} onClick={handleUpload} className="w-full justify-center mt-4">
                <Upload size={16} /> Upload & Extract Content
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-var(--navbar-h)-3rem)] flex flex-col gap-4">
      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">Reading: {file?.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <ProgressBar value={currentPage} max={totalPages} className="w-40" />
            <span className="text-xs text-[var(--text-muted)]">{progress}% complete</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={saveProgress} className="btn-ghost text-xs gap-1.5">Save Progress</button>
          <button onClick={() => { setDocId(null); setFile(null); setPages([]) }} className="btn-ghost text-xs text-red-400">
            <RotateCcw size={13} /> New Doc
          </button>
        </div>
      </div>

      {/* 3-panel layout */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Left: Page navigator */}
        <div className="col-span-2 glass-card p-3 overflow-y-auto">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2 px-1">Pages</p>
          <div className="space-y-1">
            {extracting
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
              : pages.map((_, i) => (
                <button key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-full text-left text-xs px-3 py-2.5 rounded-xl transition-all ${
                    currentPage === i + 1
                      ? 'bg-brand-600/10 text-brand-500 font-semibold border border-brand-500/20'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-100)]'
                  }`}
                >
                  Page {i + 1}
                </button>
              ))
            }
          </div>
        </div>

        {/* Center: Content */}
        <div className="col-span-4 glass-card flex flex-col overflow-hidden">
          {/* Controls */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] flex-shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} className="btn-ghost p-1.5 disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                Page {currentPage} / {totalPages}
              </span>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="btn-ghost p-1.5 disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setFontSize((s) => Math.max(11, s - 1))} className="btn-ghost p-1.5"><ZoomOut size={14} /></button>
              <span className="text-xs text-[var(--text-muted)] w-8 text-center">{fontSize}px</span>
              <button onClick={() => setFontSize((s) => Math.min(22, s + 1))} className="btn-ghost p-1.5"><ZoomIn size={14} /></button>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto p-6">
            {extracting ? (
              <div className="space-y-3"><Skeleton lines={8} /></div>
            ) : currentContent ? (
              <p className="text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap" style={{ fontSize }}>
                {currentContent}
              </p>
            ) : (
              <EmptyState icon={BookOpen} title="No content" description="This page has no extracted text." />
            )}
          </div>
        </div>

        {/* Right: AI panel */}
        <div className="col-span-6 glass-card flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-[var(--border-color)] flex-shrink-0">
            {[
              { id: 'insight', icon: Sparkles, label: 'Insights' },
              { id: 'chat',    icon: MessageSquare, label: 'Ask AI' },
            ].map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => { setTab(id); if (id === 'insight' && !insight) loadInsight() }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all ${
                  tab === id ? 'text-brand-500 border-b-2 border-brand-500' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden">
            {tab === 'insight' ? (
              <div className="p-4 h-full overflow-y-auto">
                {loadingInsight ? (
                  <div className="space-y-3 pt-2"><Skeleton lines={6} /></div>
                ) : insight ? (
                  <div className="space-y-3">
                    <Badge variant="brand"><Sparkles size={11} /> AI Insight — Page {currentPage}</Badge>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{insight}</p>
                    <button onClick={loadInsight} className="btn-ghost text-xs gap-1.5 mt-2">
                      <RotateCcw size={12} /> Refresh
                    </button>
                  </div>
                ) : (
                  <EmptyState icon={Sparkles} title="No insights yet"
                    description="Click refresh to generate AI insights for this page."
                    action={<Button size="sm" onClick={loadInsight}>Generate Insight</Button>}
                  />
                )}
              </div>
            ) : (
              <ChatInterface
                messages={chatMsgs}
                loading={chatLoad}
                onSend={handleChat}
                placeholder={`Ask about page ${currentPage}...`}
                showSuggestions={chatMsgs.length === 0}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
