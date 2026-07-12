import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FileSearch, Upload, X } from 'lucide-react'
import ChatInterface from '@/components/chat/ChatInterface'
import FileDropzone from '@/components/common/FileDropzone'
import { docQaAPI } from '@/api'
import { Button, Badge, EmptyState } from '@/components/ui'
import toast from 'react-hot-toast'

export default function DocumentQAPage() {
  const [file,     setFile]     = useState(null)
  const [docId,    setDocId]    = useState(null)
  const [uploading,setUploading]= useState(false)
  const [messages, setMessages] = useState([])
  const [loading,  setLoading]  = useState(false)

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      // Upload via reading endpoint and get a doc id back
      const res = await import('@/api').then(m => m.readingAPI.upload(fd))
      setDocId(res.data?.document_id || res.data?.id || 'uploaded')
      toast.success('Document uploaded! You can now ask questions.')
    } catch {
      toast.error('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleSend = useCallback(async (question) => {
    const userMsg = { role: 'user', content: question }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)
    try {
      const res = await docQaAPI.ask({ question, document_id: docId })
      const answer = res.data?.answer || res.data?.response || 'No response.'
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }])
    } catch {
      toast.error('Failed to get answer.')
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }, [docId])

  const reset = () => { setFile(null); setDocId(null); setMessages([]) }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Document Q&A</h1>
        <p className="text-sm text-[var(--text-muted)]">Upload a document and ask questions about its content</p>
      </div>

      {!docId ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 max-w-xl mx-auto">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-3">
              <FileSearch size={26} className="text-violet-400" />
            </div>
            <h2 className="font-bold text-[var(--text-primary)]">Upload a Document</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">PDF, Word, or text files supported</p>
          </div>
          <FileDropzone
            onFileSelect={setFile}
            accept={{ 'application/pdf': ['.pdf'], 'text/plain': ['.txt'], 'application/msword': ['.doc'] }}
            label="Drop your document here"
            hint="PDF, DOC up to 20MB"
          />
          {file && (
            <Button loading={uploading} onClick={handleUpload} className="w-full justify-center mt-4">
              <Upload size={16} /> Process Document
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-var(--navbar-h)-8rem)]">
          {/* Sidebar info */}
          <div className="lg:col-span-3">
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-[var(--text-primary)]">Active Document</h3>
                <button onClick={reset} className="btn-ghost p-1 text-red-400 hover:bg-red-500/10">
                  <X size={15} />
                </button>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <FileSearch size={16} className="text-emerald-400" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[var(--text-primary)] truncate">{file?.name}</p>
                  <Badge variant="emerald" className="mt-1">Ready</Badge>
                </div>
              </div>
              {/* <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Try asking:</p>
                {[
                  'What is the main topic?',
                  'Summarize this document',
                  'List the key points',
                  'What are the conclusions?',
                ].map((q) => (
                  <button key={q} onClick={() => handleSend(q)}
                    className="w-full text-left text-xs p-2.5 rounded-lg border border-[var(--border-color)] hover:border-brand-500/30 hover:bg-brand-500/5 text-[var(--text-secondary)] transition-all">
                    {q}
                  </button>
                ))}
              </div> */}
            </div>
          </div>

          {/* Chat */}
          {/* <div className="lg:col-span-9 glass-card overflow-hidden h-full">
            <ChatInterface
              messages={messages}
              loading={loading}
              onSend={handleSend}
              placeholder="Ask a question about your document..."
              showSuggestions={messages.length === 0}
            />
          </div> */}
          <div className="lg:col-span-9 glass-card overflow-hidden h-full flex flex-col">
            <ChatInterface
              messages={messages}
              loading={loading}
              onSend={handleSend}
              placeholder="Ask a question about your document..."
              showSuggestions={false}
            />
          </div>
        </div>
      )}
    </div>
  )
}
