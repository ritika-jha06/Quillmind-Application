import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { ShieldCheck, Mail, Lock } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { adminLogin } from '@/store/slices/authSlice'
import { useAuth } from '@/hooks'
import { Button, Input } from '@/components/ui'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm()

  useEffect(() => {
    if (isAuthenticated && isAdmin) navigate('/admin')
  }, [isAuthenticated, isAdmin, navigate])

  const onSubmit = async (data) => {
    const result = await dispatch(adminLogin(data))
    if (result.meta.requestStatus === 'fulfilled') {

      const username =
        result.payload?.user?.username

      toast.success(
        `Welcome, ${username}!`
      )

      navigate('/admin')
    }else {
      toast.error(result.payload || 'Admin login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-0)] p-6 noise">
      <div className="absolute inset-0 bg-mesh-dark opacity-30 pointer-events-none" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-glow">
              <ShieldCheck size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin Portal</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Restricted access · QuillMind Admin</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Admin Username" type="text" placeholder="admin" icon={Mail}
              error={errors.username?.message}
              {...register('username', { required: 'Username is required' })} />
            <Input label="Password" type="password" placeholder="Admin password" icon={Lock}
              error={errors.password?.message}
              {...register('password', { required: 'Password is required' })} />
            <Button type="submit" loading={loading} className="w-full justify-center" size="lg">
              <ShieldCheck size={16} />
              Access Admin Panel
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-6">
            <Link to="/login" className="text-brand-500 hover:text-brand-400">← User Login</Link>
          </p>
        </div>

        <p className="text-center text-xs text-[var(--text-muted)] mt-4">
          This area is restricted to authorized administrators only.
        </p>
      </motion.div>
    </div>
  )
}
