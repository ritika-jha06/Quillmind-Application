import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Sparkles, Mail, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Button, Input } from '@/components/ui'
import toast from 'react-hot-toast'

export default function ForgotPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email }) => {
    setLoading(true)
    // TODO: connect to your forgot password endpoint
    await new Promise((r) => setTimeout(r, 1500))
    setLoading(false)
    setSent(true)
    toast.success('Reset link sent!')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-0)] p-6 noise">
      <div className="absolute inset-0 bg-mesh-light dark:bg-mesh-dark opacity-40 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md glass-card p-8"
      >
        <Link to="/login" className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 transition-colors">
          <ArrowLeft size={15} />
          Back to login
        </Link>

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-4">
            <Mail size={26} className="text-brand-400" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Reset Password</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {sent
              ? 'Check your email for the reset link'
              : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/, message: 'Enter a valid email' },
              })}
            />
            <Button type="submit" loading={loading} className="w-full justify-center" size="lg">
              Send Reset Link
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <Mail size={22} className="text-emerald-400" />
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              We've sent a password reset link to your email. Check your inbox and follow the instructions.
            </p>
            <Button variant="secondary" onClick={() => setSent(false)} className="w-full justify-center">
              Try a different email
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
