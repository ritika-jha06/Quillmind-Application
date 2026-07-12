import { motion } from 'framer-motion'
import { History, MessageSquare, FileText, GraduationCap, BookOpen, FileSearch, Clock, Trash2 } from 'lucide-react'
import { Badge, EmptyState, Card } from '@/components/ui'
import { useState, useEffect } from 'react'
import api from '@/api/axios'

// const MOCK_HISTORY = [
//   { id: 1, type: 'chat',    title: 'Questions about Quantum Physics',           time: '2h ago',  count: 12 },
//   { id: 2, type: 'summary', title: 'Summary of Introduction to Machine Learning', time: '5h ago',  count: null },
//   { id: 3, type: 'exam',    title: 'Organic Chemistry MCQ (20 questions)',       time: '1d ago',  count: 20 },
//   { id: 4, type: 'reading', title: 'Reading: Advanced Algorithms PDF',           time: '2d ago',  count: 15 },
//   { id: 5, type: 'doc-qa',  title: 'Q&A on Research Paper: Neural Networks',    time: '3d ago',  count: 8  },
//   { id: 6, type: 'chat',    title: 'Study help: Calculus Integration',           time: '4d ago',  count: 6  },
//   { id: 7, type: 'summary', title: 'Summary of The Great Gatsby - Chapter 3',   time: '5d ago',  count: null },
//   { id: 8, type: 'exam',    title: 'World History MCQ Quiz (15 questions)',      time: '1w ago',  count: 15 },
// ]

const TYPE_META = {
  chat:    { icon: MessageSquare, label: 'Chat',    variant: 'brand'   },
  summary: { icon: FileText,      label: 'Summary', variant: 'violet'  },
  exam:    { icon: GraduationCap, label: 'Exam',    variant: 'yellow'  },
  reading: { icon: BookOpen,      label: 'Reading', variant: 'emerald' },
  'doc-qa':{ icon: FileSearch,    label: 'Doc Q&A', variant: 'brand'   },
}

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }

export default function HistoryPage() {
  const [filter, setFilter] = useState('all')
  const [items, setItems] = useState([])

  const loadHistory = async () => {
    try {
      const res = await api.get('/admin/history/')

      const formatted = res.data.map((item) => ({
        id: item.id,
        type: item.activity_type,
        title: item.title,
        time: item.created_at,
        count: item.item_count,
      }))

      setItems(formatted)
    } catch (err) {
      console.error('Failed to load history:', err)
    }
  }
  useEffect(() => {
    loadHistory()
  }, [])

  const filtered = filter === 'all' ? items : items.filter((i) => i.type === filter)

  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Activity History</h1>
        <p className="text-sm text-[var(--text-muted)]">Your recent AI interactions across all modules</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'chat', 'summary', 'exam', 'reading', 'doc-qa'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize ${
              filter === f
                ? 'bg-brand-600/10 text-brand-500 border border-brand-500/20'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-100)]'
            }`}>
            {f === 'all' ? 'All' : TYPE_META[f]?.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={History} title="No activity yet" description="Your interactions will appear here." />
      ) : (
        <motion.div variants={container} initial="hidden" animate="visible" className="space-y-3">
          {filtered.map((entry) => {
            const { icon: Icon, label, variant } = TYPE_META[entry.type] || {}
            return (
              <motion.div key={entry.id} variants={item}>
                <Card className="flex items-center gap-4 hover:border-brand-500/20 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-100)] flex items-center justify-center flex-shrink-0">
                    {Icon && <Icon size={18} className="text-[var(--text-muted)]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{entry.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={variant} className="text-[10px]">{label}</Badge>
                      <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                        <Clock size={10} />{entry.time}
                      </span>
                      {entry.count && (
                        <span className="text-[10px] text-[var(--text-muted)]">{entry.count} messages</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => remove(entry.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity btn-ghost p-1.5 text-red-400 hover:bg-red-500/10">
                    <Trash2 size={15} />
                  </button>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
