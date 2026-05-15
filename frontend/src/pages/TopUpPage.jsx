import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Zap } from 'lucide-react'
import { useWalletStore } from '../stores/walletStore'
import { useAuthStore } from '../stores/authStore'
import { formatCurrency } from '../services/formatters'
import Button from '../components/ui/Button'
import PinInput from '../components/ui/PinInput'
import BottomSheet from '../components/ui/BottomSheet'

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000, 1000000]

const TopUpPage = () => {
  const navigate = useNavigate()
  const { topUp, isLoading } = useWalletStore()
  const { verifyPin } = useAuthStore()
  
  const [amount, setAmount] = useState('')
  const [showPinSheet, setShowPinSheet] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    setAmount(value)
    setError('')
  }

  const handlePresetClick = (preset) => {
    setAmount(preset.toString())
    setError('')
  }

  const handleConfirm = () => {
    const numAmount = parseInt(amount)
    if (!numAmount || numAmount < 10000) {
      setError('Minimum top-up is Rp 10.000')
      return
    }
    if (numAmount > 50000000) {
      setError('Maximum top-up is Rp 50.000.000')
      return
    }
    setShowPinSheet(true)
  }

  const handlePinComplete = async (pinValue) => {
    setPin(pinValue)
    setError('')
    
    const numAmount = parseInt(amount)
    const result = await topUp(numAmount, pinValue)
    
    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        navigate('/home')
      }, 2000)
    } else {
      setError(result.error || 'Top-up failed')
    }
    
    setShowPinSheet(false)
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft size={28} className="text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Top Up</h1>
      </div>

      {success ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center justify-center h-[60vh]"
        >
          <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mb-4">
            <Zap size={48} className="text-success" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Top Up Successful!</h2>
          <p className="text-white/60">Your balance has been updated</p>
        </motion.div>
      ) : (
        <>
          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm text-white/60 mb-2">Enter Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg">Rp</span>
              <input
                type="text"
                value={amount ? formatCurrency(amount).replace('Rp ', '') : ''}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full bg-white/10 rounded-xl pl-12 pr-4 py-5 text-3xl font-bold text-white placeholder-white/20 border border-white/10 focus:outline-none focus:border-primary/50"
              />
            </div>
            {error && <p className="mt-2 text-error text-sm">{error}</p>}
          </div>

          {/* Preset Amounts */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetClick(preset)}
                className={`p-4 rounded-xl border transition-all ${
                  parseInt(amount) === preset
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                }`}
              >
                {formatCurrency(preset)}
              </button>
            ))}
          </div>

          {/* Payment Method Info */}
          <div className="glass-card p-4 mb-6">
            <p className="text-sm text-white/60 mb-2">Payment Method</p>
            <p className="text-white font-medium">Virtual Account Transfer</p>
            <p className="text-sm text-white/40 mt-1">
              You will receive payment instructions after confirmation
            </p>
          </div>

          {/* Submit */}
          <Button 
            onClick={handleConfirm}
            disabled={!amount || parseInt(amount) < 10000}
          >
            Continue
          </Button>
        </>
      )}

      {/* PIN Bottom Sheet */}
      <BottomSheet
        isOpen={showPinSheet}
        onClose={() => setShowPinSheet(false)}
        title="Enter Transaction PIN"
      >
        <div className="text-center mb-6">
          <p className="text-2xl font-bold text-white">{formatCurrency(amount)}</p>
          <p className="text-white/60 text-sm">Confirm top-up amount</p>
        </div>
        <div className="pb-20">
          <PinInput
            length={6}
            onComplete={handlePinComplete}
            error={error}
            disabled={isLoading}
          />
        </div>
      </BottomSheet>
    </div>
  )
}

export default TopUpPage
