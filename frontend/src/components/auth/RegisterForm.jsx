import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, User, Mail, Phone, Lock, Check } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import Button from '../ui/Button'

/**
 * RegisterForm Component - Professional registration form with validation
 */
const RegisterForm = ({ onSuccess }) => {
  const { register, isLoading, error, clearError } = useAuthStore()
  const [step, setStep] = useState(1) // Step 1: Basic info, Step 2: Password & PIN
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    pin: '',
    agreeTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const validateStep1 = () => {
    const errors = {}
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required'
    if (!formData.username.trim()) errors.username = 'Username is required'
    else if (formData.username.length < 3) errors.username = 'Username must be at least 3 characters'
    
    if (!formData.email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format'
    
    if (!formData.phone.trim()) errors.phone = 'Phone number is required'
    else if (!/^\d{10,13}$/.test(formData.phone.replace(/\D/g, ''))) errors.phone = 'Invalid phone number'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep2 = () => {
    const errors = {}
    if (!formData.password) errors.password = 'Password is required'
    else if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters'
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number'
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    
    if (!formData.pin) errors.pin = 'PIN is required'
    else if (!/^\d{6}$/.test(formData.pin)) errors.pin = 'PIN must be 6 digits'
    
    if (!formData.agreeTerms) errors.agreeTerms = 'You must agree to the terms'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2)
      clearError()
    }
  }

  const handleBack = () => {
    setStep(1)
    clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    
    if (!validateStep2()) return
    
    const result = await register({
      fullName: formData.fullName,
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      pin: formData.pin,
    })
    
    if (result.success) {
      onSuccess?.()
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }))
    }
    clearError()
  }

  const renderStep1 = () => (
    <>
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="w-full bg-slate-50 rounded-xl pl-12 pr-4 py-4 border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all text-slate-900"
          />
        </div>
        {formErrors.fullName && <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>}
      </div>

      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Username
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">@</span>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Choose a username"
            className="w-full bg-slate-50 rounded-xl pl-12 pr-4 py-4 border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all text-slate-900"
          />
        </div>
        {formErrors.username && <p className="text-red-500 text-sm mt-1">{formErrors.username}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full bg-slate-50 rounded-xl pl-12 pr-4 py-4 border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all text-slate-900"
          />
        </div>
        {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Phone Number
        </label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="081234567890"
            className="w-full bg-slate-50 rounded-xl pl-12 pr-4 py-4 border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all text-slate-900"
          />
        </div>
        {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
      </div>

      <Button onClick={handleNext} type="button">
        Continue
      </Button>
    </>
  )

  const renderStep2 = () => (
    <>
      {/* Password */}
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
            placeholder="Create a strong password"
            className="w-full bg-slate-50 rounded-xl pl-12 pr-12 py-4 border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all text-slate-900"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
        <p className="text-slate-400 text-xs mt-1">Min 8 chars with uppercase, lowercase, number</p>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            className="w-full bg-slate-50 rounded-xl pl-12 pr-4 py-4 border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all text-slate-900"
          />
        </div>
        {formErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>}
      </div>

      {/* Transaction PIN */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Create Transaction PIN (6 digits)
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="password"
            name="pin"
            value={formData.pin}
            onChange={handleChange}
            placeholder="123456"
            maxLength={6}
            inputMode="numeric"
            className="w-full bg-slate-50 rounded-xl pl-12 pr-4 py-4 border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all text-slate-900 tracking-widest"
          />
        </div>
        {formErrors.pin && <p className="text-red-500 text-sm mt-1">{formErrors.pin}</p>}
      </div>

      {/* Terms Checkbox */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          name="agreeTerms"
          checked={formData.agreeTerms}
          onChange={handleChange}
          className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary"
        />
        <label className="text-sm text-slate-600">
          I agree to the{' '}
          <button type="button" className="text-primary font-medium hover:underline">Terms of Service</button>
          {' '}and{' '}
          <button type="button" className="text-primary font-medium hover:underline">Privacy Policy</button>
        </label>
      </div>
      {formErrors.agreeTerms && <p className="text-red-500 text-sm">{formErrors.agreeTerms}</p>}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-red-600 text-sm text-center">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={handleBack} type="button">
          Back
        </Button>
        <Button loading={isLoading} disabled={isLoading}>
          Create Account
        </Button>
      </div>
    </>
  )

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Progress Indicator */}
      <div className="flex items-center gap-2 mb-6">
        <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-slate-200'}`} />
        <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-slate-200'}`} />
      </div>

      <p className="text-center text-slate-500 text-sm mb-4">
        Step {step} of 2
      </p>

      {step === 1 ? renderStep1() : renderStep2()}
    </motion.form>
  )
}

export default RegisterForm
