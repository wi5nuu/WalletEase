import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Send, ScanLine, User } from 'lucide-react'

const BottomNav = () => {
  const location = useLocation()

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/transfer', icon: Send, label: 'Transfer' },
    { path: '/qr', icon: ScanLine, label: 'Scan' },
    { path: '/profile', icon: User, label: 'Profile' },
  ]

  // Hide on certain routes
  const hiddenRoutes = ['/login', '/register', '/setup-pin', '/admin']
  if (hiddenRoutes.some(route => location.pathname.startsWith(route))) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className="w-full max-w-[430px] bg-white border-t border-border shadow-elevated safe-bottom">
        <nav className="flex items-center justify-around px-4 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center gap-1 py-1"
              >
                <motion.div
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary-50 text-primary' 
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                  whileTap={{ scale: 0.9 }}
                >
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <span
                  className={`text-xs font-medium transition-colors ${
                    isActive ? 'text-primary' : 'text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-0.5 w-1 h-1 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default BottomNav
