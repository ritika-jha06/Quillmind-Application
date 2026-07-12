import { useSelector, useDispatch } from 'react-redux'
import { logout }       from '@/store/slices/authSlice'
import { toggleTheme }  from '@/store/slices/themeSlice'
import {
  toggleSidebar,
  toggleMobileSidebar,
  closeMobileSidebar,
} from '@/store/slices/uiSlice'

export function useAuth() {
  const dispatch = useDispatch()
  const { user, token, isAdmin, loading, error } = useSelector((s) => s.auth)
  return {
    user, token, isAdmin, loading, error,
    isAuthenticated: !!token,
    signOut: () => dispatch(logout()),
  }
}

export function useTheme() {
  const dispatch = useDispatch()
  const { mode } = useSelector((s) => s.theme)
  return { mode, isDark: mode === 'dark', toggle: () => dispatch(toggleTheme()) }
}

export function useSidebar() {
  const dispatch = useDispatch()
  const { sidebarOpen, sidebarMobile } = useSelector((s) => s.ui)
  return {
    isOpen:      sidebarOpen,
    isMobileOpen: sidebarMobile,
    toggle:      () => dispatch(toggleSidebar()),
    toggleMobile: () => dispatch(toggleMobileSidebar()),
    closeMobile:  () => dispatch(closeMobileSidebar()),
  }
}
