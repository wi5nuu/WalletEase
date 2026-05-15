import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../stores/authStore'
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Button from '../components/ui/Button'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    clearError()
    setIsLoading(true)
    
    const result = await login(data)
    
    if (result.success) {
      if (result.hasPin) {
        navigate('/home', { replace: true })
      } else {
        navigate('/setup-pin', { replace: true })
      }
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8 flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <Zap size={24} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-white">PayFlow</h1>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
        <p className="text-white/60">Sign in to your account</p>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 flex-1"
      >
        {/* Username/Email */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Username or Email
          </label>
          <div className="relative">
            <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              {...register('username')}
              type="text"
              placeholder="Enter your username"
              className="w-full bg-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
          {errors.username && (
            <p className="mt-1 text-sm text-error">{errors.username.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="w-full bg-white/10 rounded-xl pl-12 pr-12 py-4 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:border-primary/50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-error">{errors.password.message}</p>
          )}
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-error/10 border border-error/20 rounded-xl"
          >
            <p className="text-sm text-error">{error}</p>
          </motion.div>
        )}

        {/* Forgot PIN link */}
        <div className="text-right">
          <Link to="/forgot-pin" className="text-sm text-primary hover:underline">
            Forgot PIN?
          </Link>
        </div>

        {/* Submit */}
        <Button type="submit" loading={isLoading}>
          Sign In
        </Button>
      </motion.form>

      {/* Register link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-center"
      >
        <p className="text-white/60">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default LoginPage
