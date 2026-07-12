import { useState, useEffect } from 'react'
import { adminAPI } from '@/api'
import { motion } from 'framer-motion'
import { Users, Search, MoreVertical, ShieldCheck, Trash2, UserX, RefreshCw } from 'lucide-react'
import { Badge, Card, Skeleton, Button } from '@/components/ui'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

// const MOCK_USERS = Array.from({ length: 20 }, (_, i) => ({
//   id: i + 1,
//   name: ['Alice Johnson', 'Bob Kumar', 'Carol Smith', 'David Patel', 'Eva Chen',
//          'Frank Miller', 'Grace Lee', 'Henry Brown', 'Iris Wang', 'Jack Davis'][i % 10],
//   email: `user${i + 1}@example.com`,
//   role: i % 8 === 0 ? 'sub_admin' : 'user',
//   status: i % 7 === 0 ? 'inactive' : 'active',
//   joined: `${Math.floor(Math.random() * 30) + 1}d ago`,
//   chats: Math.floor(Math.random() * 100),
// }))

export default function AdminUsers() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [users, setUsers] = useState([])

  const loadUsers = async () => {
  try {
    const res = await adminAPI.listUsers()

    const formattedUsers = res.data.map((u) => ({
      id: u.id,
      name: u.username,
      email: u.email,
      role: 'user',
      status: 'active',
      joined: u.created_at,
      chats: 0,
    }))

    setUsers(formattedUsers)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load users')
    }
  }
  useEffect(() => {
    loadUsers()
  }, [])

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || u.status === filter || u.role === filter
    return matchSearch && matchFilter
  })

  const banUser = (id) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: 'inactive' } : u))
    toast.success('User banned')
  }
  const deleteUser = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
    toast.success('User deleted')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Users</h1>
          <p className="text-sm text-[var(--text-muted)]">{users.length} total registered users</p>
        </div>
        <Button size="sm" variant="secondary" onClick={loadUsers}>
          <RefreshCw size={14} /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="input-field pl-9 py-2 text-xs"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'inactive', 'sub_admin'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize ${
                filter === f ? 'bg-brand-600/10 text-brand-500 border border-brand-500/20' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-100)]'
              }`}>
              {f === 'sub_admin' ? 'Sub Admins' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--surface-100)]">
                {['User', 'Role', 'Status', 'Joined', 'Chats', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--surface-100)] transition-colors group"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{user.name}</p>
                        <p className="text-[10px] text-[var(--text-muted)] truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === 'sub_admin' ? 'violet' : 'default'} className="capitalize">
                      {user.role === 'sub_admin' ? <><ShieldCheck size={10} /> Sub Admin</> : 'User'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.status === 'active' ? 'emerald' : 'red'} className="capitalize">
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{user.joined}</td>
                  <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{user.chats}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => banUser(user.id)}
                        className="p-1.5 rounded-lg hover:bg-yellow-500/10 hover:text-yellow-400 text-[var(--text-muted)] transition-colors" title="Ban user">
                        <UserX size={14} />
                      </button>
                      <button onClick={() => deleteUser(user.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-[var(--text-muted)] transition-colors" title="Delete user">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-sm text-[var(--text-muted)]">No users found</div>
          )}
        </div>
      </Card>
    </div>
  )
}
