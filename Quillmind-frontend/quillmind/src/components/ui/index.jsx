import { motion } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { forwardRef } from 'react'

/* ─── Button ─────────────────────────────────────────────────── */
export function Button({
  children, variant = 'primary', size = 'md', loading = false,
  disabled, className = '', ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary:  'bg-gradient-to-r from-brand-600 to-violet-600 text-white hover:from-brand-500 hover:to-violet-500 shadow-glow-sm hover:shadow-glow',
    secondary:'bg-[var(--surface-100)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-brand-500/50',
    ghost:    'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-100)]',
    danger:   'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
    emerald:  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20',
  }
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-6 py-3 text-base' }

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  )
}

/* ─── Input ──────────────────────────────────────────────────── */
export const Input = forwardRef(({ label, error, icon: Icon, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>}
    <div className="relative">
      {Icon && <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />}
      <input
        ref={ref}
        className={`input-field ${Icon ? 'pl-10' : ''} ${error ? 'border-red-500 focus:ring-red-500/20' : ''} ${className}`}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
  </div>
))
Input.displayName = 'Input'

/* ─── Textarea ───────────────────────────────────────────────── */
export const Textarea = forwardRef(({ label, error, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>}
    <textarea
      ref={ref}
      className={`input-field resize-none ${error ? 'border-red-500' : ''} ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
  </div>
))
Textarea.displayName = 'Textarea'

/* ─── Card ───────────────────────────────────────────────────── */
export function Card({ children, className = '', hover = false, gradient = false, ...props }) {
  return (
    <div
      className={`card ${hover ? 'hover:shadow-md hover:border-brand-500/30 transition-all duration-200 cursor-pointer' : ''} ${gradient ? 'gradient-border' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

/* ─── Badge ──────────────────────────────────────────────────── */
const BADGE_VARIANTS = {
  default:  'bg-[var(--surface-200)] text-[var(--text-secondary)]',
  brand:    'bg-brand-600/10 text-brand-500',
  violet:   'bg-violet-500/10 text-violet-400',
  emerald:  'bg-emerald-500/10 text-emerald-400',
  red:      'bg-red-500/10 text-red-400',
  yellow:   'bg-yellow-500/10 text-yellow-400',
}

export function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`badge ${BADGE_VARIANTS[variant]} ${className}`}>{children}</span>
  )
}

/* ─── Skeleton ───────────────────────────────────────────────── */
export function Skeleton({ className = '', lines = 1 }) {
  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={`skeleton h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'} ${className}`} />
        ))}
      </div>
    )
  }
  return <div className={`skeleton h-4 ${className}`} />
}

/* ─── Modal ──────────────────────────────────────────────────── */
export function Modal({ open, onClose, title, children, size = 'md' }) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`glass-card relative w-full ${sizes[size]} z-10 p-6`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X size={18} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  )
}

/* ─── Empty State ────────────────────────────────────────────── */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-8">
      <div className="w-16 h-16 rounded-2xl bg-[var(--surface-100)] flex items-center justify-center mb-4">
        {Icon && <Icon size={28} className="text-[var(--text-muted)]" />}
      </div>
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
      {description && <p className="text-sm text-[var(--text-muted)] max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* ─── Loading Spinner ────────────────────────────────────────── */
export function Spinner({ size = 20, className = '' }) {
  return <Loader2 size={size} className={`animate-spin text-brand-500 ${className}`} />
}

/* ─── Progress Bar ───────────────────────────────────────────── */
export function ProgressBar({ value = 0, max = 100, className = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={`w-full h-2 bg-[var(--surface-200)] rounded-full overflow-hidden ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="h-full bg-gradient-to-r from-brand-500 to-violet-500 rounded-full"
      />
    </div>
  )
}

/* ─── Stat Card ──────────────────────────────────────────────── */
export function StatCard({ label, value, icon: Icon, change, color = 'brand' }) {
  const colors = {
    brand:   'from-brand-500/10 to-brand-600/10 text-brand-500',
    violet:  'from-violet-500/10 to-violet-600/10 text-violet-400',
    emerald: 'from-emerald-500/10 to-emerald-600/10 text-emerald-400',
    yellow:  'from-yellow-500/10 to-yellow-600/10 text-yellow-400',
  }
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {change > 0 ? '↑' : '↓'} {Math.abs(change)}% from last week
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </Card>
  )
}


