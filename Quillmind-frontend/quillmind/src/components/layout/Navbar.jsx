import { Link, useLocation } from 'react-router-dom'
import { Menu, Sun, Moon, Search, Bell, ChevronRight } from 'lucide-react'
import { useTheme, useSidebar, useAuth } from '@/hooks'

const BREADCRUMB_MAP = {
  '/dashboard':         ['Dashboard'],
  '/dashboard/chat':    ['Dashboard', 'General AI Chat'],
  '/dashboard/doc-qa':  ['Dashboard', 'Document Q&A'],
  '/dashboard/reading': ['Dashboard', 'Reading App'],
  '/dashboard/summary': ['Dashboard', 'Summary Maker'],
  '/dashboard/exam':    ['Dashboard', 'Exam Maker'],
  '/dashboard/history': ['Dashboard', 'History'],
  '/dashboard/settings':['Dashboard', 'Settings'],
  '/dashboard/profile': ['Dashboard', 'Profile'],
}

export default function Navbar() {
  const { isDark, toggle } = useTheme()
  const { toggle: toggleSidebar, toggleMobile } = useSidebar()
  const { user } = useAuth()
  const { pathname } = useLocation()

  const crumbs = BREADCRUMB_MAP[pathname] || ['Dashboard']

  return (
    <header
      className="fixed top-0 right-0 left-0 z-20 glass border-b border-[var(--border-color)] flex items-center px-4 gap-4"
      style={{ height: 'var(--navbar-h)', paddingLeft: '272px' }}
    >
      {/* Sidebar toggle */}
      <button onClick={toggleSidebar} className="btn-ghost p-2 hidden md:flex" aria-label="Toggle sidebar">
        <Menu size={18} />
      </button>
      <button onClick={toggleMobile} className="btn-ghost p-2 md:hidden">
        <Menu size={18} />
      </button>

      {/* Breadcrumb */}
      <nav className="hidden sm:flex items-center gap-1 text-sm flex-1">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={13} className="text-[var(--text-muted)]" />}
            <span className={i === crumbs.length - 1
              ? 'font-semibold text-[var(--text-primary)]'
              : 'text-[var(--text-muted)]'}>
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-2 ml-auto">
        {/* Search button */}
        <button className="btn-ghost p-2 hidden md:flex items-center gap-2 text-[var(--text-muted)] text-sm border border-[var(--border-color)] rounded-xl px-3">
          <Search size={15} />
          <span>Search...</span>
          <kbd className="text-[10px] bg-[var(--surface-200)] px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>

        {/* Notifications */}
        <button className="btn-ghost p-2 relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
        </button>

        {/* Theme toggle */}
        <button onClick={toggle} className="btn-ghost p-2" aria-label="Toggle theme">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Avatar */}
        <Link to="/dashboard/profile">
          {/* <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:shadow-glow-sm transition-shadow">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div> */}
          <div className="w-8 h-8 rounded-full overflow-hidden cursor-pointer">
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
        </Link>
      </div>
    </header>
  )
}
