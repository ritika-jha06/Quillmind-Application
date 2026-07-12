import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { adminAPI } from '@/api'
import toast from 'react-hot-toast'
import {
  Users, FileStack, Activity, Server,
  TrendingUp, ShieldCheck, MessageSquare, Zap,
} from 'lucide-react'
import { StatCard, Card, Badge, ProgressBar } from '@/components/ui'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }

// const RECENT_USERS = [
//   { name: 'Alice Johnson', email: 'alice@uni.edu', role: 'user',      joined: '2h ago'  },
//   { name: 'Bob Kumar',     email: 'bob@college.in', role: 'user',     joined: '5h ago'  },
//   { name: 'Carol Smith',   email: 'carol@school.org', role: 'user',   joined: '1d ago'  },
//   { name: 'David Patel',   email: 'david@uni.edu', role: 'sub_admin', joined: '2d ago'  },
// ]

// const SYSTEM_METRICS = [
//   { label: 'CPU Usage',       value: 34,  color: 'from-brand-500 to-brand-400'   },
//   { label: 'Memory',          value: 62,  color: 'from-violet-500 to-violet-400' },
//   { label: 'Storage',         value: 47,  color: 'from-emerald-500 to-emerald-400'},
//   { label: 'API Rate Limit',  value: 28,  color: 'from-yellow-500 to-yellow-400' },
// ]

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDocuments: 0,
    totalSubAdmins: 0,
  })
  const navigate = useNavigate()

  const role = useSelector(
    state => state.auth.user?.role
  )

  const [recentUsers, setRecentUsers] = useState([])
  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const [usersRes, docsRes, subAdminsRes] = await Promise.all([
        adminAPI.listUsers(),
        adminAPI.viewAll(),
        adminAPI.listSubAdmins(),
      ])

      const users = usersRes.data || []
      const subAdmins = subAdminsRes.data || []

      let documentCount = 0

      Object.values(docsRes.data || {}).forEach((files) => {
        documentCount += files.length
      })

      setStats({
        totalUsers: users.length,
        totalDocuments: documentCount,
        totalSubAdmins: subAdmins.length,
      })

      setRecentUsers(users.slice(0, 5))

    } catch (err) {
      console.error(err)
      toast.error('Failed to load dashboard data')
    }
  }

  return (
    <div className="max-w-none w-full px-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin Overview</h1>
          <p className="text-sm text-[var(--text-muted)]">QuillMind platform health and activity</p>
        </div>
        <Badge variant="emerald"><Activity size={12} /> All Systems Operational</Badge>
      </div>

      {/* Stats */}
      <motion.div variants={container} initial="hidden" animate="visible"
        className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {[
            {
              label: 'Total Users',
              value: stats.totalUsers,
              icon: Users,
              color: 'brand',
              route: '/admin/users',
            },
            {
              label: 'Documents',
              value: stats.totalDocuments,
              icon: FileStack,
              color: 'violet',
              route: '/admin/documents',
            },
            // {
            //   label: 'Sub Admins',
            //   value: stats.totalSubAdmins,
            //   icon: ShieldCheck,
            //   color: 'emerald',
            //   route: '/admin/sub-admins',
            // },
            ...(role === 'admin'
              ? [{
                  label: 'Sub Admins',
                  value: stats.totalSubAdmins,
                  icon: ShieldCheck,
                  color: 'emerald',
                  route: '/admin/sub-admins',
                }]
              : [])
          ].map((s) => (
          <motion.div
            key={s.label}
            variants={item}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(s.route)}
            className="cursor-pointer"
          >
            <StatCard {...s} />
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-6">
        {/* Recent users */}
        <Card>
          <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Users size={16} className="text-brand-400" /> Recent Registrations
          </h3>
          <div className="space-y-3">
            {recentUsers.map((u) => (
              <div key={u.email} className="flex items-center gap-3 py-2 border-b border-[var(--border-color)] last:border-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {u.username?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{u.username}</p>
                  <p className="text-[10px] text-[var(--text-muted)] truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={u.role === 'sub_admin' ? 'violet' : 'default'} className="capitalize">{u.role}</Badge>
                  <span className="text-[10px] text-[var(--text-muted)]">{u.created_at || "-"}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* System metrics */}
        {/* <Card>
          <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Server size={16} className="text-brand-400" /> System Metrics
          </h3>
          <div className="space-y-4">
            {SYSTEM_METRICS.map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[var(--text-secondary)] font-medium">{label}</span>
                  <span className={`font-bold ${value > 70 ? 'text-red-400' : value > 50 ? 'text-yellow-400' : 'text-emerald-400'}`}>{value}%</span>
                </div>
                <div className="h-2 bg-[var(--surface-200)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${color}`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
            <ShieldCheck size={14} className="text-emerald-400" />
            <p className="text-xs text-emerald-400 font-medium">All services running normally</p>
          </div>
        </Card> */}
      </div>

      {/* Quick module breakdown */}
      <Card>
        <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-5 flex items-center gap-2">
          <TrendingUp size={16} className="text-brand-400" /> Module Usage (Last 7 Days)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'General Chat', count: '4,821', pct: 82 },
            { label: 'Doc Q&A',      count: '1,203', pct: 45 },
            { label: 'Reading App',  count: '986',   pct: 38 },
            { label: 'Summaries',    count: '2,145', pct: 60 },
            { label: 'Exam Maker',   count: '743',   pct: 28 },
          ].map(({ label, count, pct }) => (
            <div key={label} className="text-center p-4 rounded-xl bg-[var(--surface-100)]">
              <p className="text-lg font-bold text-[var(--text-primary)]">{count}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 mb-2">{label}</p>
              <ProgressBar value={pct} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
