import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useSelector } from 'react-redux'


// Layouts
import AppLayout   from '@/components/layout/AppLayout'
import AdminLayout from '@/components/layout/AdminLayout'
import PublicLayout from '@/components/layout/PublicLayout'

// Public pages
import LandingPage  from '@/pages/landing/LandingPage'
import FeaturesPage from '@/pages/landing/FeaturesPage'
import AboutPage    from '@/pages/landing/AboutPage'
import ContactPage  from '@/pages/landing/ContactPage'

// Auth pages
import LoginPage    from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPage   from '@/pages/auth/ForgotPage'
import AdminLoginPage from '@/pages/auth/AdminLoginPage'

// User Dashboard pages
import DashboardHome    from '@/pages/dashboard/DashboardHome'
import GeneralChatPage  from '@/pages/dashboard/GeneralChatPage'
import DocumentQAPage   from '@/pages/dashboard/DocumentQAPage'
import ReadingPage      from '@/pages/reading/ReadingPage'
import SummaryPage      from '@/pages/summary/SummaryPage'
import ExamPage         from '@/pages/exam/ExamPage'
import HistoryPage      from '@/pages/dashboard/HistoryPage'
import SettingsPage     from '@/pages/dashboard/SettingsPage'
import ProfilePage      from '@/pages/dashboard/ProfilePage'

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminUsers     from '@/pages/admin/AdminUsers'
import AdminSubAdmins from '@/pages/admin/AdminSubAdmins'
import AdminDocs      from '@/pages/admin/AdminDocs'
import AdminFiles     from '@/pages/admin/AdminFiles'
import AdminSettings  from '@/pages/admin/AdminSettings'

// Guards
import ProtectedRoute from '@/routes/ProtectedRoute'
import AdminRoute     from '@/routes/AdminRoute'

export default function App() {
  const theme = useSelector((s) => s.theme.mode)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: theme === 'dark' ? '#13131f' : '#fff',
            color:      theme === 'dark' ? '#f1f5f9' : '#0f172a',
            border:     '1px solid rgba(99,102,241,0.2)',
            borderRadius: '12px',
            fontFamily: 'Sora, sans-serif',
            fontSize:   '14px',
          },
        }}
      />
      <Routes>
        {/* ── Public ── */}
        <Route element={<PublicLayout />}>
          <Route path="/"         element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/about"    element={<AboutPage />} />
          <Route path="/contact"  element={<ContactPage />} />
        </Route>

        {/* ── Auth ── */}
        <Route path="/login"        element={<LoginPage />} />
        <Route path="/register"     element={<RegisterPage />} />
        <Route path="/forgot"       element={<ForgotPage />} />
        <Route path="/admin/login"  element={<AdminLoginPage />} />
        {/* <Route
          path="/reset-password/:token"
          element={<ResetPasswordPage />}
        /> */}

        {/* ── User Dashboard ── */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard"          element={<DashboardHome />} />
          <Route path="/dashboard/chat"     element={<GeneralChatPage />} />
          <Route path="/dashboard/doc-qa"   element={<DocumentQAPage />} />
          <Route path="/dashboard/reading"  element={<ReadingPage />} />
          <Route path="/dashboard/summary"  element={<SummaryPage />} />
          <Route path="/dashboard/exam"     element={<ExamPage />} />
          <Route path="/dashboard/history"  element={<HistoryPage />} />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
          <Route path="/dashboard/profile"  element={<ProfilePage />} />
        </Route>

        {/* ── Admin Dashboard ── */}
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/admin"               element={<AdminDashboard />} />
          <Route path="/admin/users"         element={<AdminUsers />} />
          <Route path="/admin/sub-admins"    element={<AdminSubAdmins />} />
          <Route path="/admin/documents"     element={<AdminDocs />} />
          <Route path="/admin/files"         element={<AdminFiles />} />
          <Route path="/admin/settings"      element={<AdminSettings />} />
        </Route>

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
