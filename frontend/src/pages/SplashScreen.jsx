import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Zap } from 'lucide-react'

const SplashScreen = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        if (user?.hasPin) {
          navigate('/home', { replace: true })
        } else {
          navigate('/setup-pin', { replace: true })
        }
      } else {
        navigate('/login', { replace: true })
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [isAuthenticated, user, navigate])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center"
      >
        {/* Logo */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center shadow-lg shadow-primary/30"
        >
          <Zap size={48} className="text-white" strokeWidth={2.5} />
        </motion.div>
        
        {/* Brand Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-6 text-3xl font-bold text-white tracking-tight"
        >
          PayFlow
        </motion.h1>
        
        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-2 text-white/50 text-sm"
        >
          Digital Payment Solution
        </motion.p>
      </motion.div>
      
      {/* Loading dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-12 flex gap-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            className="w-2 h-2 bg-primary rounded-full"
          />
        ))}
      </motion.div>
    </div>
  )
}

export default SplashScreen
