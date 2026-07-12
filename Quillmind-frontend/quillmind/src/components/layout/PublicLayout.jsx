import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Moon, Sun, Sparkles, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useTheme, useAuth } from '@/hooks'

const NAV_LINKS = [
  { to: '/features', label: 'Features' },
  { to: '/about',    label: 'About' },
  { to: '/contact',  label: 'Contact' },
]

export default function PublicLayout() {
  const { isDark, toggle } = useTheme()
  const { isAuthenticated } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-[var(--surface-0)] noise">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-[var(--border-color)]" style={{ height: 'var(--navbar-h)' }}>
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">QuillMind</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                  pathname === to
                    ? 'bg-brand-600/10 text-brand-500'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-100)]'
                }`}>
                {label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="btn-ghost p-2 rounded-xl" aria-label="Toggle theme">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary">Dashboard</Link>
            ) : (
              <>
                <Link to="/login"    className="btn-ghost hidden md:flex">Sign In</Link>
                <Link to="/register" className="btn-primary hidden md:flex">Get Started</Link>
              </>
            )}
            <button className="md:hidden btn-ghost p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden glass border-t border-[var(--border-color)] px-4 py-4 flex flex-col gap-2"
          >
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                className="sidebar-link">{label}</Link>
            ))}
            <div className="flex gap-2 pt-2 border-t border-[var(--border-color)]">
              <Link to="/login"    onClick={() => setMenuOpen(false)} className="btn-ghost flex-1 justify-center">Sign In</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary flex-1 justify-center">Get Started</Link>
            </div>
          </motion.div>
        )}
      </nav>

      <main style={{ paddingTop: 'var(--navbar-h)' }}>
        <Outlet />
      </main>
    </div>
  )
}
