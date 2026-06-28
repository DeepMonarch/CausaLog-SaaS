import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { ProtectedRoute } from './ProtectedRoute'
import AppLayout from '../layouts/AppLayout'
import LoginPage from '../pages/Login'
import SignupPage from '../pages/Signup'
import DashboardPage from '../pages/Dashboard'
import AnalysisPage from '../pages/Analysis'
import ReportsPage from '../pages/Reports'
import HistoryPage from '../pages/History'
import ProfilePage from '../pages/Profile'
import SettingsPage from '../pages/Settings'

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected — all wrapped in AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}