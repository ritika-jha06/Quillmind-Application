import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Type, Upload, Copy, Download, Sparkles, RefreshCw } from 'lucide-react'
import { useForm } from 'react-hook-form'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import FileDropzone from '@/components/common/FileDropzone'
import { summaryAPI } from '@/api'
import { Button, Badge, Skeleton } from '@/components/ui'
import toast from 'react-hot-toast'

export default function SummaryPage() {
  const [mode,    setMode]    = useState('text') // text | pdf
  const [file,    setFile]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const handleText = async ({ text, length = 'medium' }) => {
    setLoading(true)
    setResult(null)
    try {
      const res = await summaryAPI.fromText({ text, length })
      setResult(res.data)
      toast.success('Summary generated!')
    } catch {
      toast.error('Failed to generate summary')
    } finally {
      setLoading(false)
    }
  }

  const handlePdf = async () => {
    if (!file) return
    setLoading(true)
    setResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await summaryAPI.fromPdf(fd)
      setResult(res.data)
      toast.success('PDF summarized!')
    } catch {
      toast.error('Failed to summarize PDF')
    } finally {
      setLoading(false)
    }
  }

  const copyResult = () => {
    const text = result?.summary || ''
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const downloadResult = () => {
    const text = result?.summary || ''
    const blob = new Blob([text], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    Object.assign(document.createElement('a'), { href: url, download: 'summary.txt' }).click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Summary Maker</h1>
        <p className="text-sm text-[var(--text-muted)]">Generate AI-powered summaries from text or PDF</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-6">
        {/* Input */}
        <div className="space-y-4">
          {/* Mode selector */}
          <div className="flex gap-2 p-1 bg-[var(--surface-100)] rounded-xl">
            {[
              { id: 'text', icon: Type,     label: 'From Text' },
              { id: 'pdf',  icon: FileText, label: 'From PDF' },
            ].map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => { setMode(id); setResult(null) }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === id
                    ? 'bg-[var(--surface-0)] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {mode === 'text' ? (
            <form onSubmit={handleSubmit(handleText)} className="glass-card p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Paste your text</label>
                <textarea
                  rows={7}
                  placeholder="Paste or type the content you want summarized..."
                  className={`input-field resize-none ${errors.text ? 'border-red-500' : ''}`}
                  {...register('text', { required: 'Text is required', minLength: { value: 50, message: 'Please enter at least 50 characters' } })}
                />
                {errors.text && <p className="mt-1 text-xs text-red-400">{errors.text.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Summary length</label>
                <select className="input-field" {...register('length')}>
                  <option value="short">Short (1-2 paragraphs)</option>
                  <option value="medium">Medium (3-4 paragraphs)</option>
                  <option value="long">Long (detailed)</option>
                </select>
              </div>
              <Button type="submit" loading={loading} className="w-full justify-center">
                <Sparkles size={16} /> Generate Summary
              </Button>
            </form>
          ) : (
            <div className="glass-card p-4 space-y-3">
              <FileDropzone
                onFileSelect={setFile}
                accept={{ 'application/pdf': ['.pdf'] }}
                label="Drop your PDF here"
                hint="PDF up to 20MB"
              />
              <Button loading={loading} onClick={handlePdf} disabled={!file} className="w-full justify-center">
                <Sparkles size={16} /> Summarize PDF
              </Button>
            </div>
          )}
        </div>

        {/* Output */}
        <div className="glass-card p-5 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-brand-400" />
              <h3 className="font-semibold text-sm text-[var(--text-primary)]">Summary</h3>
              {result && <Badge variant="emerald">Ready</Badge>}
            </div>
            {result && (
              <div className="flex gap-1.5">
                <button onClick={copyResult} className="btn-ghost text-xs gap-1"><Copy size={12} /> Copy</button>
                <button onClick={downloadResult} className="btn-ghost text-xs gap-1"><Download size={12} /> Download</button>
                <button onClick={() => setResult(null)} className="btn-ghost text-xs gap-1"><RefreshCw size={12} /> Clear</button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="space-y-3">
                    <Skeleton lines={8} />
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  {/* Key points */}
                  {result.key_points && (
                    <div className="mb-5 p-3 rounded-xl bg-brand-500/5 border border-brand-500/15">
                      <p className="text-xs font-semibold text-brand-400 mb-2 uppercase tracking-wider">Key Points</p>
                      <ul className="space-y-1">
                        {result.key_points.map((pt, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                            <span className="text-brand-400 mt-0.5">•</span>{pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="prose-quill text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.summary || ''}</ReactMarkdown>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" className="h-full min-h-[600px] flex items-center justify-center text-center">
                  <div>
                    <FileText size={36} className="text-[var(--text-muted)] mx-auto mb-3 opacity-30" />
                    <p className="text-sm text-[var(--text-muted)]">Your summary will appear here</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
