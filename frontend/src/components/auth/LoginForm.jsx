import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import Button from '../ui/Button'

/**
 * LoginForm Component - Professional login form
 */
const LoginForm = ({ onSuccess }) => {
  const { login, isLoading, error, clearError } = useAuthStore()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const validate = () => {
    const errors = {}
    if (!formData.username.trim()) {
      errors.username = 'Username is required'
    }
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    
    if (!validate()) return
    
    const result = await login(formData.username, formData.password)
    if (result.success) {
      onSuccess?.()
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }))
    }
    clearError()
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Username Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Username or Email
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            className={`
              w-full bg-slate-50 rounded-xl pl-12 pr-4 py-4 
              border ${formErrors.username ? 'border-red-500' : 'border-border'}
              focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100
              transition-all text-slate-900 placeholder-slate-400
            `}
          />
        </div>
        {formErrors.username && (
          <p className="text-red-500 text-sm mt-1">{formErrors.username}</p>
        )}
      </div>

      {/* Password Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className={`
              w-full bg-slate-50 rounded-xl pl-12 pr-12 py-4 
              border ${formErrors.password ? 'border-red-500' : 'border-border'}
              focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100
              transition-all text-slate-900 placeholder-slate-400
            `}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {formErrors.password && (
          <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
        )}
      </div>

      {/* Forgot Password */}
      <div className="flex justify-end">
        <button
          type="button"
          className="text-primary text-sm font-medium hover:underline"
        >
          Forgot Password?
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-3"
        >
          <p className="text-red-600 text-sm text-center">{error}</p>
        </motion.div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        loading={isLoading}
        disabled={isLoading}
      >
        Sign In
      </Button>
    </motion.form>
  )
}

export default LoginForm
