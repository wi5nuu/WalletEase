import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import { Zap, Shield } from 'lucide-react'
import PinInput from '../components/ui/PinInput'
import Button from '../components/ui/Button'

const SetupPinPage = () => {
  const navigate = useNavigate()
  const { setupPin, error, clearError } = useAuthStore()
  const [step, setStep] = useState(1) // 1: Set PIN, 2: Confirm PIN
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [localError, setLocalError] = useState('')

  const handlePinComplete = (value) => {
    clearError()
    setLocalError('')
    
    if (step === 1) {
      setPin(value)
      setStep(2)
    } else {
      setConfirmPin(value)
    }
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
      setPin('')
      setConfirmPin('')
      setLocalError('')
    }
  }

  const handleSubmit = async () => {
    if (pin !== confirmPin) {
      setLocalError("PINs don't match. Please try again.")
      setConfirmPin('')
      return
    }

    setIsLoading(true)
    const result = await setupPin(pin, confirmPin)
    
    if (result.success) {
      navigate('/home', { replace: true })
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8 flex flex-col overflow-y-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8 flex-shrink-0"
      >
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <Zap size={24} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-white">PayFlow</h1>
      </motion.div>

      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring' }}
        className="flex justify-center mb-6 flex-shrink-0"
      >
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
          <Shield size={40} className="text-primary" />
        </div>
      </motion.div>

      {/* Title & Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8 flex-shrink-0"
      >
        <h2 className="text-2xl font-bold text-white mb-2">
          {step === 1 ? 'Create Transaction PIN' : 'Confirm PIN'}
        </h2>
        <p className="text-white/60 text-sm px-4">
          {step === 1 
            ? 'Set a 6-digit PIN to secure your transactions. You\'ll need this every time you make a payment or transfer.'
            : 'Enter the same PIN again to confirm.'
          }
        </p>
      </motion.div>

      {/* PIN Input */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex-1 flex flex-col justify-center min-h-[300px]"
      >
        <PinInput
          key={step} // Reset when step changes
          length={6}
          onComplete={handlePinComplete}
          error={localError || error}
          disabled={isLoading}
        />
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        {step === 2 && (
          <>
            <Button onClick={handleSubmit} loading={isLoading}>
              Confirm PIN
            </Button>
            <Button variant="ghost" onClick={handleBack} disabled={isLoading}>
              Back
            </Button>
          </>
        )}
      </motion.div>

      {/* Security note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center text-xs text-white/40"
      >
        Your PIN is securely encrypted and never stored in plain text.
      </motion.p>
    </div>
  )
}

export default SetupPinPage
