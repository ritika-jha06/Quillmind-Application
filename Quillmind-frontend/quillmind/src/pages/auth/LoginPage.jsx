import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Sparkles, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { loginUser } from '@/store/slices/authSlice'
import { useAuth } from '@/hooks'
import { Button, Input } from '@/components/ui'
import toast from 'react-hot-toast'
import logo from '@/assets/QuillMind_logo.png'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, loading, error } = useAuth()
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
  }, [isAuthenticated, navigate])

  const onSubmit = async (data) => {
    const result = await dispatch(loginUser(data))
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Welcome back!')
      navigate('/dashboard')
    } else {
      toast.error(result.payload || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex bg-[var(--surface-0)] noise">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-gradient-to-br from-brand-950 via-violet-950 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-dark opacity-60" />
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-brand-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="QuillMind"
              className="w-12 h-12 object-contain"
            />

            <span className="text-white font-black text-3xl">
              QuillMind
            </span>
          </Link>
        </div>

        <div className="relative z-10">
          <blockquote className="text-2xl font-semibold text-white leading-snug mb-6">
            "The future of academic learning is intelligent, personal, and always available."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">Q</div>
            <div>
              <p className="text-white font-medium text-sm">QuillMind AI</p>
              <p className="text-white/50 text-xs">Your academic companion</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex gap-6">
          {[['10K+', 'Students'], ['50K+', 'Docs Processed'], ['99%', 'Uptime']].map(([num, label]) => (
            <div key={label}>
              <p className="text-2xl font-bold text-white">{num}</p>
              <p className="text-white/50 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
                <Sparkles size={15} className="text-white" />
              </div>
              <span className="font-bold gradient-text">QuillMind</span>
            </Link>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Welcome back</h1>
            <p className="text-[var(--text-muted)] mt-1">Sign in to your account</p>
          </div>

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

            <div className="relative">
              <Input
                label="Password"
                type={showPass ? 'text' : 'password'}
                placeholder="Enter your password"
                icon={Lock}
                error={errors.password?.message}
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-9 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
                <input type="checkbox" className="rounded border-[var(--border-color)]" />
                Remember me
              </label>
              <Link to="/forgot" className="text-sm text-brand-500 hover:text-brand-400 font-medium">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={loading} className="w-full justify-center" size="lg">
              Sign In
            </Button>
          </form>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-[var(--border-color)]" />
            <span className="text-xs text-[var(--text-muted)]">or</span>
            <div className="flex-1 h-px bg-[var(--border-color)]" />
          </div>

          <p className="text-center text-sm text-[var(--text-muted)] mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-500 hover:text-brand-400 font-semibold">
              Create one
            </Link>
          </p>
          <p className="text-center text-xs text-[var(--text-muted)] mt-6">
            Are you an admin?{' '}
            <Link to="/admin/login" className="text-violet-400 hover:text-violet-300">
              Admin Login →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}



// export default function LoginPage() {
//   return (
//     <div style={{ color: "white", padding: "50px" }}>
//       Login Page Working
//     </div>
//   );
// }