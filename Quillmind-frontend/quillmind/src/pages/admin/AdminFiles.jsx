import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FolderOpen, Upload, Download, Trash2, RefreshCw, File, Archive } from 'lucide-react'
import { adminAPI } from '@/api'
import { Button, Card, Badge } from '@/components/ui'
import FileDropzone from '@/components/common/FileDropzone'
import toast from 'react-hot-toast'

// const FOLDERS = ['lectures', 'textbooks', 'notes', 'assignments', 'misc']

// const MOCK_FILES = {
//   lectures:    [{ name: 'intro-cs.pdf', size: '3.2 MB' }, { name: 'data-structures.pdf', size: '5.1 MB' }],
//   textbooks:   [{ name: 'algorithms.pdf', size: '18.4 MB' }],
//   notes:       [{ name: 'week1-notes.pdf', size: '0.8 MB' }, { name: 'week2-notes.pdf', size: '1.2 MB' }],
//   assignments: [],
//   misc:        [{ name: 'syllabus.pdf', size: '0.3 MB' }],
// }

export default function AdminFiles() {
  const [files, setFiles] = useState({})
  const [activeFolder, setActiveFolder] = useState('')
  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const res = await adminAPI.viewAll()

      const data = res.data || {}

      setFiles(data)

      const folders = Object.keys(data)

      if (folders.length > 0) {
        setActiveFolder(folders[0])
      }

    } catch (err) {
      console.error(err)
      toast.error('Failed to load files')
    }
  }
  const [uploadFile, setUploadFile]     = useState(null)
  const [uploading, setUploading]       = useState(false)

  const handleUpload = async () => {
    if (!uploadFile) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', uploadFile)
      await adminAPI.upload(activeFolder, fd)
      // setFiles((prev) => ({
      //   ...prev,
      //   [activeFolder]: [...(prev[activeFolder] || []), { name: uploadFile.name, size: `${(uploadFile.size / 1024 / 1024).toFixed(1)} MB` }],
      // }))
      await loadFiles()
      setUploadFile(null)
      toast.success(`Uploaded to /${activeFolder}`)
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (filename) => {
    try {
      await adminAPI.deleteFile(activeFolder, filename)
      // setFiles((prev) => ({ ...prev, [activeFolder]: prev[activeFolder].filter((f) => f.name !== filename) }))
      await loadFiles()
      toast.success('File deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  const handleDownloadFolder = async () => {
    try {
      const res = await adminAPI.downloadFolder(activeFolder)
      const url = URL.createObjectURL(new Blob([res.data]))
      Object.assign(document.createElement('a'), { href: url, download: `${activeFolder}.zip` }).click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Download failed')
    }
  }

  const currentFiles = (files[activeFolder] || []).map((name) => ({
    name,
    size: '-'
  }))
  const folders = Object.keys(files)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">File Manager</h1>
          <p className="text-sm text-[var(--text-muted)]">Manage uploaded files across all folders</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Folder sidebar */}
        <div className="col-span-3 space-y-1">
          <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider px-3 mb-2">Folders</p>
          {folders.map((folder) => {
            const count = files[folder]?.length || 0
            return (
              <button key={folder} onClick={() => setActiveFolder(folder)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeFolder === folder
                    ? 'bg-brand-600/10 text-brand-500 border border-brand-500/20'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-100)] hover:text-[var(--text-primary)]'
                }`}>
                <span className="flex items-center gap-2">
                  <FolderOpen size={15} />
                  <span className="capitalize">{folder}</span>
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded-md ${activeFolder === folder ? 'bg-brand-500/20 text-brand-400' : 'bg-[var(--surface-200)] text-[var(--text-muted)]'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Main panel */}
        <div className="col-span-9 space-y-4">
          {/* Upload */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-[var(--text-primary)] flex items-center gap-2">
                <Upload size={15} className="text-brand-400" />
                Upload to <span className="text-brand-500 capitalize">/{activeFolder}</span>
              </h3>
            </div>
            <FileDropzone
              onFileSelect={setUploadFile}
              accept={{ 'application/pdf': ['.pdf'], 'application/msword': ['.doc', '.docx'], 'text/plain': ['.txt'] }}
              label="Drop files to upload"
              hint="PDF, DOC, TXT up to 50MB"
            />
            {uploadFile && (
              <Button loading={uploading} onClick={handleUpload} className="mt-3 justify-center w-full">
                <Upload size={15} /> Upload to /{activeFolder}
              </Button>
            )}
          </Card>

          {/* Files list */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-[var(--text-primary)] capitalize">
                /{activeFolder} ({currentFiles.length} files)
              </h3>
              {currentFiles.length > 0 && (
                <button onClick={handleDownloadFolder}
                  className="btn-ghost text-xs gap-1.5">
                  <Archive size={13} /> Download All
                </button>
              )}
            </div>

            {currentFiles.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen size={28} className="text-[var(--text-muted)] mx-auto mb-2 opacity-30" />
                <p className="text-xs text-[var(--text-muted)]">No files in this folder</p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentFiles.map((file, i) => (
                  <motion.div key={file.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--surface-100)] transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                      <File size={15} className="text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--text-primary)] truncate">{file.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{file.size}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => adminAPI.downloadFile(activeFolder, file.name)}
                        className="p-1.5 rounded-lg hover:bg-brand-500/10 hover:text-brand-400 text-[var(--text-muted)] transition-colors">
                        <Download size={14} />
                      </button>
                      <button onClick={() => handleDelete(file.name)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-[var(--text-muted)] transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
