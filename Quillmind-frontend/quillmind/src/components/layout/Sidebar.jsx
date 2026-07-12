import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, LayoutDashboard, MessageSquare, FileSearch,
  BookOpen, FileText, GraduationCap, History, Archive,
  Settings, LogOut, ChevronRight, User, X,
} from 'lucide-react'
import { useAuth, useSidebar, useTheme } from '@/hooks'
import toast from 'react-hot-toast'
import logo from '@/assets/QuillMind_logo.png'

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard',         icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'AI Tools',
    items: [
      { to: '/dashboard/chat',    icon: MessageSquare, label: 'General AI Chat' },
      { to: '/dashboard/doc-qa',  icon: FileSearch,    label: 'Document Q&A' },
      { to: '/dashboard/reading', icon: BookOpen,      label: 'Reading App' },
      { to: '/dashboard/summary', icon: FileText,      label: 'Summary Maker' },
      { to: '/dashboard/exam',    icon: GraduationCap, label: 'Exam Maker' },
    ],
  },
  {
    label: 'Library',
    items: [
      { to: '/dashboard/history', icon: History,  label: 'Activity History' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/dashboard/profile',  icon: User,     label: 'Profile' },
      { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

export default function Sidebar() {
  const { isOpen, isMobileOpen, toggle, closeMobile } = useSidebar()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    signOut()
    toast.success('Signed out successfully')
    navigate('/login')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-20 border-b border-[var(--border-color)] flex-shrink-0">
        <NavLink to="/" className="flex items-center gap-1 group">
          {/* <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 via-violet-500 to-emerald-500 flex items-center justify-center shadow-glow">
            <Sparkles size={15} className="text-white" />
          </div> */}
          <img
            src={logo}
            alt="QuillMind"
            className="w-12 h-12 object-contain"
          />
          {/* <span className="font-bold text-base gradient-text">QuillMind</span> */}
          <div className="flex flex-col">
            <span className="font-black text-3xl gradient-text leading-none">
              QuillMind
            </span>
          </div>  
        </NavLink>
        <button onClick={() => { toggle(); closeMobile(); }}
          className="btn-ghost p-1.5 md:hidden">
          <X size={18} />
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-brand-400 px-3mb-2">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <NavLink to={to}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''}`
                    }
                    onClick={closeMobile}
                  >
                    <Icon size={17} />
                    <span className="flex-1">{label}</span>
                    <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="flex-shrink-0 p-3 border-t border-[var(--border-color)]">
        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl glass border border-[var(--border-color)] group">
          {/* <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div> */}
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            {user?.avatar ? (
              <img
                src={`http://localhost:8000/${user.avatar}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                {(user?.full_name || user?.username)?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{user?.full_name || user?.username || 'User'}</p>
            <p className="text-xs text-[var(--text-muted)] truncate">{user?.email || ''}</p>
          </div>
          <button onClick={handleSignOut}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400"
            title="Sign out">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="desktop-sidebar"
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            // className="hidden md:flex fixed left-0 top-0 bottom-0 z-30 flex-col bg-[var(--surface-0)] border-r border-[var(--border-color)]"
            className="hidden md:flex fixed left-0 top-0 bottom-0 z-30 flex-col bg-gradient-to-b from-[var(--surface-0)] to-[var(--surface-50)] border-r border-[var(--border-color)]"
            style={{ width: 'var(--sidebar-w)' }}
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            key="mobile-sidebar"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            // className="md:hidden fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-[var(--surface-0)] border-r border-[var(--border-color)]"
            className="md:hidden fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-gradient-to-b from-[var(--surface-0)] to-[var(--surface-50)] borer-r border-[var(--border-color)]"
            style={{ width: 'var(--sidebar-w)' }}
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
