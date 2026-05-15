import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuthStore } from './stores/authStore'
import ErrorBoundary from './components/ui/ErrorBoundary'
import { ToastProvider } from './components/ui/Toast'

// Pages
import SplashScreen from './pages/SplashScreen'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SetupPinPage from './pages/SetupPinPage'
import HomePage from './pages/HomePage'
import TopUpPage from './pages/TopUpPage'
import TransferPage from './pages/TransferPage'
import BillsPage from './pages/BillsPage'
import QrPage from './pages/QrPage'
import HistoryPage from './pages/HistoryPage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import AdminDashboard from './pages/AdminDashboard'
import VirtualAccountPage from './pages/VirtualAccountPage'
import TransactionDetailPage from './pages/TransactionDetailPage'

// Components
import BottomNav from './components/ui/BottomNav'

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <AppContent />
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  )
}

function AppContent() {
  const location = useLocation()
  const { isAuthenticated, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Routes that don't show bottom nav
  const hideNavRoutes = ['/', '/login', '/register', '/setup-pin', '/admin', '/virtual-account', '/transaction']
  const showNav = isAuthenticated && !hideNavRoutes.some(route => location.pathname.startsWith(route))

  return (
    <div className="min-h-screen bg-background max-w-[430px] mx-auto relative shadow-2xl">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<SplashScreen />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route path="/setup-pin" element={
            <ProtectedRoute><SetupPinPage /></ProtectedRoute>
          } />
          <Route path="/home" element={
            <ProtectedRoute><HomePage /></ProtectedRoute>
          } />
          <Route path="/topup" element={
            <ProtectedRoute><TopUpPage /></ProtectedRoute>
          } />
          <Route path="/transfer" element={
            <ProtectedRoute><TransferPage /></ProtectedRoute>
          } />
          <Route path="/bills" element={
            <ProtectedRoute><BillsPage /></ProtectedRoute>
          } />
          <Route path="/qr" element={
            <ProtectedRoute><QrPage /></ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute><HistoryPage /></ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute><NotificationsPage /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
          <Route path="/virtual-account" element={
            <ProtectedRoute><VirtualAccountPage /></ProtectedRoute>
          } />
          <Route path="/transaction/:id" element={
            <ProtectedRoute><TransactionDetailPage /></ProtectedRoute>
          } />
          
          {/* Admin Route */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>
          } />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AnimatePresence>
      
      {showNav && <BottomNav />}
    </div>
  )
}

function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, user } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (requireAdmin && user?.role !== 'ROLE_ADMIN') {
    return <Navigate to="/home" replace />
  }
  
  return children
}

export default App
