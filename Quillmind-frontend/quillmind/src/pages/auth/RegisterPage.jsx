import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Sparkles, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { registerUser } from '@/store/slices/authSlice'
import { useAuth } from '@/hooks'
import { Button, Input } from '@/components/ui'
import toast from 'react-hot-toast'
import logo from '@/assets/QuillMind_logo.png'

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useAuth()
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  // const onSubmit = async (data) => {
  //   const result = await dispatch(registerUser(data))
  //   if (result.meta.requestStatus === 'fulfilled') {
  //     toast.success('Account created! Please sign in.')
  //     navigate('/login')
  //   } else {
  //     toast.error(result.payload || 'Registration failed')
  //   }
  // }


  const onSubmit = async (data) => {
    const payload = {
      username: data.username,
      email: data.email,
      password: data.password,
    }

    const result = await dispatch(registerUser(payload))

    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } else {
      toast.error(result.payload || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-0)] p-6 noise">
      <div className="absolute inset-0 bg-mesh-light dark:bg-mesh-dark opacity-40 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md glass-card p-8"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            {/* <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-glow-sm">
              <Sparkles size={18} className="text-white" />
            </div> */}
            <img
              src={logo}
              alt="QuillMind"
              className="w-12 h-12 object-contain"
            />
            <span className="font-bold text-xl gradient-text">QuillMind</span>
          </Link>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create your account</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Join thousands of students using QuillMind</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            icon={User}
            error={errors.username?.message}
            {...register('username', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
          />
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
              placeholder="Create a password"
              icon={Lock}
              error={errors.password?.message}
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-9 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="relative">
            <Input
              label="Confirm Password"
              type={showConfirmPass ? 'text' : 'password'}
              placeholder="Confirm your password"
              icon={Lock}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (v) => v === password || 'Passwords do not match',
              })}
            />

            <button
              type="button"
              onClick={() => setShowConfirmPass(!showConfirmPass)}
              className="absolute right-3 top-9 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              {showConfirmPass ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}
            </button>
          </div>

          <label className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] cursor-pointer pt-1">
            <input type="checkbox" className="mt-0.5 rounded border-[var(--border-color)]"
              {...register('terms', { required: 'You must agree to the terms' })} />
            <span>
              I agree to the{' '}
              <Link to="#" className="text-brand-500 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="#" className="text-brand-500 hover:underline">Privacy Policy</Link>
            </span>
          </label>
          {errors.terms && <p className="text-xs text-red-400">{errors.terms.message}</p>}

          <Button type="submit" loading={loading} className="w-full justify-center" size="lg">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-500 hover:text-brand-400 font-semibold">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
