import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../stores/authStore'
import { Zap, User, Mail, Phone, Lock, Eye, EyeOff, Check, X } from 'lucide-react'
import Button from '../components/ui/Button'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[0-9]{10,15}$/, 'Phone must be 10-15 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

const RegisterPage = () => {
  const navigate = useNavigate()
  const { register: registerUser, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  })

  const watchedPassword = watch('password')

  const getPasswordStrength = (pass) => {
    let strength = 0
    if (pass.length >= 8) strength++
    if (/[A-Z]/.test(pass)) strength++
    if (/[a-z]/.test(pass)) strength++
    if (/\d/.test(pass)) strength++
    if (/[@$!%*?&]/.test(pass)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(watchedPassword || '')
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  const strengthColors = ['bg-error', 'bg-warning', 'bg-yellow-400', 'bg-success', 'bg-emerald-500']

  const onSubmit = async (data) => {
    clearError()
    setIsLoading(true)
    
    const result = await registerUser({
      fullName: data.fullName,
      username: data.username,
      email: data.email,
      phone: data.phone,
      password: data.password,
    })
    
    if (result.success) {
      navigate('/setup-pin', { replace: true })
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8 flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
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
        className="mb-6"
      >
        <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-white/60">Sign up to get started</p>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 flex-1 overflow-y-auto"
      >
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Full Name
          </label>
          <div className="relative">
            <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              {...register('fullName')}
              type="text"
              placeholder="Enter your full name"
              className="w-full bg-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-sm text-error">{errors.fullName.message}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Username
          </label>
          <div className="relative">
            <Zap size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              {...register('username')}
              type="text"
              placeholder="Choose a username"
              className="w-full bg-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
          {errors.username && (
            <p className="mt-1 text-sm text-error">{errors.username.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              {...register('email')}
              type="email"
              placeholder="Enter your email"
              className="w-full bg-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-error">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              {...register('phone')}
              type="tel"
              placeholder="081234567890"
              className="w-full bg-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-error">{errors.phone.message}</p>
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
              placeholder="Create a password"
              onChange={(e) => setPassword(e.target.value)}
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
          
          {/* Password strength indicator */}
          {watchedPassword && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs ${
                passwordStrength <= 2 ? 'text-error' : passwordStrength <= 3 ? 'text-warning' : 'text-success'
              }`}>
                {strengthLabels[passwordStrength - 1]}
              </p>
            </div>
          )}
          
          {errors.password && (
            <p className="mt-1 text-sm text-error">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              {...register('confirmPassword')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              className="w-full bg-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-error">{errors.confirmPassword.message}</p>
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

        {/* Submit */}
        <div className="pt-2">
          <Button type="submit" loading={isLoading}>
            Create Account
          </Button>
        </div>
      </motion.form>

      {/* Login link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-center"
      >
        <p className="text-white/60">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default RegisterPage
