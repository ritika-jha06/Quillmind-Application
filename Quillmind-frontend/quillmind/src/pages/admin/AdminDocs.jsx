import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileStack, Search, RefreshCw, Download, Trash2, File, FolderOpen } from 'lucide-react'
import { adminAPI } from '@/api'
import { Button, Card, Badge } from '@/components/ui'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

const MOCK_DOCS = [
  { name: 'quantum-physics.pdf',       folder: 'lectures',   size: '4.2 MB', date: '2h ago'  },
  { name: 'organic-chemistry.pdf',     folder: 'textbooks',  size: '12.1 MB', date: '1d ago' },
  { name: 'machine-learning-notes.pdf',folder: 'notes',      size: '2.3 MB', date: '3d ago'  },
  { name: 'world-history.pdf',         folder: 'textbooks',  size: '8.7 MB', date: '5d ago'  },
  { name: 'calculus-ch1-5.pdf',        folder: 'lectures',   size: '3.1 MB', date: '1w ago'  },
  { name: 'biology-cells.pdf',         folder: 'notes',      size: '1.8 MB', date: '2w ago'  },
]

export default function AdminDocs() {
  const [search,    setSearch]    = useState('')
  const [docs, setDocs] = useState([])
  const [reloading, setReloading] = useState(false)

  // const loadDocuments = async () => {
  //   try {
  //     const res = await adminAPI.viewAll()

  //     console.log("Documents API Response:", res.data)

  //     setDocs(res.data)
  //   } catch (err) {
  //     console.error(err)
  //     toast.error('Failed to load documents')
  //   }
  // }
  // useEffect(() => {
  //   loadDocuments()
  // }, [])

  const loadDocuments = async () => {
    try {
      const res = await adminAPI.viewAll()

      const formattedDocs = []

      Object.entries(res.data).forEach(([folder, files]) => {
        files.forEach((file) => {
          formattedDocs.push({
            name: file,
            folder,
            size: '-',
            date: '-',
          })
        })
      })

      setDocs(formattedDocs)

    } catch (err) {
      console.error(err)
      toast.error('Failed to load documents')
    }
  }
  useEffect(() => {
    loadDocuments()
  }, [])

  const filtered = docs.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.folder.toLowerCase().includes(search.toLowerCase())
  )

  const handleReload = async () => {
    setReloading(true)
    try {
      await adminAPI.reloadDocs()
      toast.success('Document index reloaded!')
    } catch {
      toast.error('Reload failed')
    } finally {
      setReloading(false)
    }
  }

  const handleDelete = async (folder, name) => {
    try {
      await adminAPI.deleteFile(folder, name)
      setDocs((prev) => prev.filter((d) => !(d.folder === folder && d.name === name)))
      toast.success('File deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  const handleDownload = async (folder, name) => {
    try {
      const res = await adminAPI.downloadFile(folder, name)
      const url = URL.createObjectURL(new Blob([res.data]))
      Object.assign(document.createElement('a'), { href: url, download: name }).click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Download failed')
    }
  }

  const folders = [...new Set(docs.map((d) => d.folder))]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Documents</h1>
          <p className="text-sm text-[var(--text-muted)]">{docs.length} documents in the knowledge base</p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleReload} loading={reloading}>
          <RefreshCw size={14} /> Reload Index
        </Button>
      </div>

      {/* Folder summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {folders.map((folder) => {
          const count = docs.filter((d) => d.folder === folder).length
          return (
            <Card key={folder} className="flex items-center gap-3 cursor-pointer hover:border-brand-500/30 transition-all">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                <FolderOpen size={17} className="text-brand-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--text-primary)] capitalize">{folder}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{count} files</p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents..."
          className="input-field pl-9 text-xs"
        />
      </div>

      {/* Files table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--surface-100)]">
                {['File', 'Folder', 'Size', 'Added', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc, i) => (
                <motion.tr key={`${doc.folder}-${doc.name}`}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--surface-100)] transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <File size={14} className="text-brand-400 flex-shrink-0" />
                      <span className="text-xs font-medium text-[var(--text-primary)] truncate max-w-xs">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="default" className="capitalize">{doc.folder}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{doc.size}</td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{doc.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDownload(doc.folder, doc.name)}
                        className="p-1.5 rounded-lg hover:bg-brand-500/10 hover:text-brand-400 text-[var(--text-muted)] transition-colors">
                        <Download size={14} />
                      </button>
                      <button onClick={() => handleDelete(doc.folder, doc.name)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-[var(--text-muted)] transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-sm text-[var(--text-muted)]">No documents found</div>
          )}
        </div>
      </Card>
    </div>
  )
}
