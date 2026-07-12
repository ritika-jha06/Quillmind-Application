import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserCog, FolderOpen, FileStack,
  Settings, LogOut, Sparkles, ShieldCheck, Activity,
} from 'lucide-react'
import { useAuth, useTheme } from '@/hooks'
import { Moon, Sun } from 'lucide-react'
import toast from 'react-hot-toast'
import logo from '@/assets/QuillMind_logo.png'

const ADMIN_NAV = [
  { to: '/admin',            icon: LayoutDashboard, label: 'Overview',    end: true },
  { to: '/admin/users',      icon: Users,           label: 'Users' },
  { to: '/admin/sub-admins', icon: UserCog,         label: 'Sub Admins' },
  { to: '/admin/documents',  icon: FileStack,       label: 'Documents' },
  { to: '/admin/files',      icon: FolderOpen,      label: 'File Manager' },
  { to: '/admin/settings',   icon: Settings,        label: 'Settings' },
]

export default function AdminLayout() {
  const { user, signOut } = useAuth()
  const role = user?.role
  const { isDark, toggle } = useTheme()
  const navigate = useNavigate()

  const handleSignOut = () => {
    signOut()
    toast.success('Signed out')
    navigate('/admin/login')
  }

  return (
    <div className="flex h-screen bg-[var(--surface-50)]">
      {/* Admin Sidebar */}
      <aside className="w-60 flex flex-col bg-[var(--surface-0)] border-r border-[var(--border-color)] flex-shrink-0">
        {/* Logo */}
        <div className="h-20 flex items-center gap-3 px-4 border-b border-[var(--border-color)]">
          <img
            src={logo}
            alt="QuillMind"
            className="w-12 h-12 object-contain"
          />

          <div>
            <h2 className="font-black text-2xl gradient-text leading-none">
              QuillMind
            </h2>

            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-1">
              Admin Panel
            </p>
          </div>
        </div>

        {/* <nav className="flex-1 p-3 space-y-0.5">
          {ADMIN_NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav> */}

        <nav className="flex-1 p-3 space-y-0.5">

          {ADMIN_NAV
            .filter(item => {

              if (
                role === 'sub_admin' &&
                (
                  item.to === '/admin/sub-admins' ||
                  item.to === '/admin/settings'
                )
              ) {
                return false
              }

              return true
            })
            .map(({ to, icon: Icon, label, end }) => (

              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>

          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--border-color)] space-y-1">
          <button onClick={toggle} className="sidebar-link w-full">
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={handleSignOut} className="sidebar-link w-full text-red-400 hover:text-red-400 hover:bg-red-500/10">
            <LogOut size={17} />
            Sign Out
          </button>
          <div className="flex items-center gap-2.5 px-3 py-2 mt-2 rounded-xl bg-[var(--surface-100)]">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{user?.username || 'User'}</p>
              <p className="text-[10px] text-[var(--text-muted)] truncate capitalize">{user?.role === 'sub_admin'
                ? 'Sub Admin'
                : 'Admin'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Admin Navbar */}
        <header className="h-16 glass border-b border-[var(--border-color)] flex items-center px-6 gap-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-emerald-500" />
            <span className="text-sm font-medium text-[var(--text-secondary)]">System Operational</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="badge bg-brand-600/10 text-brand-500">
              <ShieldCheck size={11} /> {user?.role || 'Admin'}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
