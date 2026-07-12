import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import Navbar   from './Navbar'
import { useSidebar } from '@/hooks'

export default function AppLayout() {
  const { isOpen, isMobileOpen, closeMobile } = useSidebar()

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--surface-50)]">
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobile}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={{ marginLeft: isOpen ? 'var(--sidebar-w)' : '0' }}
      >
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 page-enter"
          style={{ paddingTop: `calc(var(--navbar-h) + 1.5rem)` }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
