import { useState } from 'react'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserCog, Plus, Trash2, ShieldCheck, Mail, User, Lock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { adminAPI } from '@/api'
import { Button, Input, Card, Badge, Modal } from '@/components/ui'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'


const MOCK_SUBS = [
  { id: 1, name: 'Sarah Connor', email: 'sarah@quillmind.ai', added: '5d ago', permissions: ['files', 'docs'] },
  { id: 2, name: 'John Reese',   email: 'john@quillmind.ai',  added: '2w ago', permissions: ['users', 'files', 'docs'] },
]

export default function AdminSubAdmins() {
  const [showModal, setShowModal] = useState(false)
  const [subAdmins, setSubAdmins] = useState([])
  const [adding, setAdding] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const loadSubAdmins = async () => {
    try {
      const res = await adminAPI.listSubAdmins()
      setSubAdmins(res.data)
    } catch (err) {
      console.error('Failed to load sub-admins:', err)
    }
  }
  useEffect(() => {
    loadSubAdmins()
  }, [])

  const onAdd = async (data) => {
    setAdding(true)
    try {
      await adminAPI.addSubAdmin(data)
      // setSubAdmins((prev) => [...prev, { id: Date.now(), name: data.name, email: data.email, added: 'just now', permissions: [] }])
      await loadSubAdmins()
      toast.success('Sub-admin added!')
      reset()
      setShowModal(false)
    } catch {
      toast.error('Failed to add sub-admin')
    } finally {
      setAdding(false)
    }
  }

  const onDelete = async (id, email) => {
    try {
      await adminAPI.deleteSubAdmin(id)
      // setSubAdmins((prev) => prev.filter((s) => s.id !== id))
      await loadSubAdmins()
      toast.success('Sub-admin removed')
    } catch {
      toast.error('Failed to remove sub-admin')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Sub Admins</h1>
          <p className="text-sm text-[var(--text-muted)]">Manage administrator roles and permissions</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Sub Admin
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subAdmins.map((sub, i) => (
          <motion.div
            key={sub.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className="group relative">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-brand-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0 shadow-glow-sm">
                  {sub.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-[var(--text-primary)]">{sub.name}</p>
                    <Badge variant="violet"><ShieldCheck size={10} /> Sub Admin</Badge>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{sub.email}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">Added {sub.added}</p>
                  {sub.permissions.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {sub.permissions.map((p) => (
                        <span key={p} className="badge bg-[var(--surface-200)] text-[var(--text-secondary)] capitalize">{p}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onDelete(sub.id, sub.email)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-[var(--text-muted)]"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {subAdmins.length === 0 && (
        <Card className="text-center py-12">
          <UserCog size={36} className="text-[var(--text-muted)] mx-auto mb-3 opacity-30" />
          <p className="text-sm text-[var(--text-muted)]">No sub-admins yet. Add one to delegate tasks.</p>
        </Card>
      )}

      {/* Add Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Sub Admin">
        <form onSubmit={handleSubmit(onAdd)} className="space-y-4">
          <Input label="Full Name" placeholder="Sub admin name" icon={User}
            error={errors.name?.message}
            {...register('name', { required: 'Name is required' })} />
          <Input label="Email Address" type="email" placeholder="subadmin@quillmind.ai" icon={Mail}
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })} />
          <Input label="Temporary Password" type="password" placeholder="Set initial password" icon={Lock}
            error={errors.password?.message}
            {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1 justify-center">Cancel</Button>
            <Button type="submit" loading={adding} className="flex-1 justify-center">Add Sub Admin</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
