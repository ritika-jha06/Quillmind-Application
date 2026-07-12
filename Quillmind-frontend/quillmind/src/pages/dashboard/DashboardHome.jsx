import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  MessageSquare, FileSearch, BookOpen, FileText,
  GraduationCap, Zap, TrendingUp, Clock, Star,
} from 'lucide-react'
import { StatCard, Card, Badge } from '@/components/ui'
import { useAuth } from '@/hooks'

const MODULES = [
  { to: '/dashboard/chat',    icon: MessageSquare, label: 'General AI Chat',  desc: 'Ask anything, get intelligent answers', color: 'brand',   badge: 'Popular' },
  { to: '/dashboard/doc-qa',  icon: FileSearch,    label: 'Document Q&A',     desc: 'Upload docs and ask questions', color: 'violet',  badge: null },
  { to: '/dashboard/reading', icon: BookOpen,      label: 'Reading App',      desc: 'Smart reading with AI insights', color: 'emerald', badge: 'New' },
  { to: '/dashboard/summary', icon: FileText,      label: 'Summary Maker',    desc: 'Generate summaries instantly', color: 'yellow',  badge: null },
  { to: '/dashboard/exam',    icon: GraduationCap, label: 'Exam Maker',       desc: 'Create MCQ tests from any topic', color: 'brand',   badge: null },
]

const ICON_COLORS = {
  brand:   'from-brand-500 to-brand-600',
  violet:  'from-violet-500 to-violet-600',
  emerald: 'from-emerald-500 to-emerald-600',
  yellow:  'from-yellow-500 to-yellow-600',
}

const RECENT = [
  { label: 'Summarized "Quantum Mechanics Ch.4"', time: '2h ago', icon: FileText },
  { label: 'Generated 20 MCQs on Organic Chemistry', time: '5h ago', icon: GraduationCap },
  { label: 'Chat session: Machine Learning basics', time: '1d ago', icon: MessageSquare },
]

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }

export default function DashboardHome() {
  const { user } = useAuth()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero greeting */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden p-8 bg-gradient-to-br from-brand-950 via-violet-950 to-slate-950"
      >
        <div className="absolute inset-0 bg-mesh-dark opacity-50" />
        <div className="absolute top-4 right-6 w-32 h-32 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-20 w-24 h-24 bg-violet-500/20 rounded-full blur-2xl" />
        <div className="relative z-10">
          <p className="text-white/60 text-sm font-medium mb-1">{greeting} 👋</p>
          <h1 className="text-3xl font-bold text-white mb-2">{user?.name || 'Student'}</h1>
          <p className="text-white/50 text-sm max-w-md">
            Your AI-powered academic assistant is ready. What would you like to explore today?
          </p>
          <div className="flex gap-3 mt-5">
            <Link to="/dashboard/chat" className="btn-primary bg-white/10 backdrop-blur hover:bg-white/20 border border-white/20 text-white shadow-none hover:shadow-none">
              <Zap size={16} /> Start Chat
            </Link>
            <Link to="/dashboard/reading" className="btn-ghost text-white/70 hover:text-white hover:bg-white/10">
              Open Reader →
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={container} initial="hidden" animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Chats This Week',    value: '24',   icon: MessageSquare, color: 'brand',   change: 12 },
          { label: 'Documents Analyzed', value: '7',    icon: FileSearch,    color: 'violet',  change: -3 },
          { label: 'Summaries Made',     value: '15',   icon: FileText,      color: 'emerald', change: 20 },
          { label: 'Exams Generated',    value: '6',    icon: GraduationCap, color: 'yellow',  change: 5 },
        ].map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </motion.div>

      {/* Module cards */}
      <div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Zap size={18} className="text-brand-500" /> AI Modules
        </h2>
        <motion.div
          variants={container} initial="hidden" animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {MODULES.map(({ to, icon: Icon, label, desc, color, badge }) => (
            <motion.div key={to} variants={item}>
              <Link to={to}>
                <Card hover className="group relative overflow-hidden">
                  {badge && (
                    <div className="absolute top-3 right-3">
                      <Badge variant={badge === 'New' ? 'emerald' : 'brand'}>{badge}</Badge>
                    </div>
                  )}
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${ICON_COLORS[color]} flex items-center justify-center mb-4 shadow-glow-sm group-hover:shadow-glow transition-shadow`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-1">{label}</h3>
                  <p className="text-xs text-[var(--text-muted)]">{desc}</p>
                  <div className="mt-3 text-xs font-medium text-brand-500 group-hover:gap-2 flex items-center gap-1 transition-all">
                    Open module <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Clock size={16} className="text-[var(--text-muted)]" /> Recent Activity
          </h3>
          <div className="space-y-3">
            {RECENT.map(({ label, time, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 py-2 border-b border-[var(--border-color)] last:border-0">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[var(--text-primary)] truncate">{label}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-[var(--text-muted)]" /> Weekly Usage
          </h3>
          <div className="space-y-3">
            {[
              { label: 'General Chat',  pct: 72, color: 'bg-brand-500' },
              { label: 'Document Q&A',  pct: 45, color: 'bg-violet-500' },
              { label: 'Summary Maker', pct: 60, color: 'bg-emerald-500' },
              { label: 'Exam Maker',    pct: 30, color: 'bg-yellow-500' },
            ].map(({ label, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-secondary)]">{label}</span>
                  <span className="text-[var(--text-muted)]">{pct}%</span>
                </div>
                <div className="h-1.5 bg-[var(--surface-200)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                    className={`h-full ${color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
