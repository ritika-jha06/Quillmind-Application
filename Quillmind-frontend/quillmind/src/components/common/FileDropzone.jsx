import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, X, CheckCircle2, AlertCircle } from 'lucide-react'

export default function FileDropzone({
  onFileSelect,
  accept = { 'application/pdf': ['.pdf'] },
  maxSize = 20 * 1024 * 1024, // 20MB
  label = 'Drop your file here',
  hint = 'PDF up to 20MB',
  multiple = false,
}) {
  const [files, setFiles]   = useState([])
  const [rejected, setRejected] = useState([])

  const onDrop = useCallback((accepted, rejectedFiles) => {
    setFiles(multiple ? accepted : [accepted[0]].filter(Boolean))
    setRejected(rejectedFiles)
    if (accepted.length > 0) onFileSelect?.(multiple ? accepted : accepted[0])
  }, [multiple, onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept, maxSize, multiple,
  })

  const removeFile = (name) => {
    const next = files.filter((f) => f.name !== name)
    setFiles(next)
    onFileSelect?.(multiple ? next : null)
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-brand-500 bg-brand-500/5 shadow-glow-sm'
            : 'border-[var(--border-color)] hover:border-brand-500/50 hover:bg-[var(--surface-100)]'
        }`}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={{ y: isDragActive ? -4 : 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
            isDragActive
              ? 'bg-brand-500/10 shadow-glow-sm'
              : 'bg-[var(--surface-100)]'
          }`}
        >
          <Upload size={24} className={isDragActive ? 'text-brand-500' : 'text-[var(--text-muted)]'} />
        </motion.div>
        <div className="text-center">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {isDragActive ? 'Drop it!' : label}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {isDragActive ? 'Release to upload' : `or click to browse · ${hint}`}
          </p>
        </div>
      </div>

      {/* Accepted files */}
      <AnimatePresence>
        {files.map((file) => (
          <motion.div
            key={file.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20"
          >
            <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
            <File size={15} className="text-[var(--text-muted)] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--text-primary)] truncate">{file.name}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{formatSize(file.size)}</p>
            </div>
            <button onClick={() => removeFile(file.name)}
              className="p-1 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-[var(--text-muted)] transition-colors">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Rejected files */}
      <AnimatePresence>
        {rejected.map(({ file, errors }) => (
          <motion.div
            key={file.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/20"
          >
            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-red-400 truncate">{file.name}</p>
              {errors.map((e) => (
                <p key={e.code} className="text-[10px] text-red-300">{e.message}</p>
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
