import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Search, User, ArrowRight } from 'lucide-react'
import { useWalletStore } from '../stores/walletStore'
import { formatCurrency } from '../services/formatters'
import Button from '../components/ui/Button'
import PinInput from '../components/ui/PinInput'
import BottomSheet from '../components/ui/BottomSheet'
import api from '../services/api'

const TransferPage = () => {
  const navigate = useNavigate()
  const { transfer, isLoading } = useWalletStore()
  
  const [step, setStep] = useState('search') // search, amount, confirm
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedRecipient, setSelectedRecipient] = useState(null)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [showPinSheet, setShowPinSheet] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Debounced search
  const searchUsers = useCallback(async (query) => {
    if (query.length < 3) {
      setSearchResults([])
      return
    }
    
    setIsSearching(true)
    try {
      // This would be a real API endpoint
      // For now, simulating with a delay
      await new Promise(resolve => setTimeout(resolve, 300))
      setSearchResults([]) // Would be populated from API
    } catch (error) {
      console.error('Search failed:', error)
    }
    setIsSearching(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, searchUsers])

  const handleSelectRecipient = (recipient) => {
    setSelectedRecipient(recipient)
    setStep('amount')
  }

  const handleAmountConfirm = () => {
    const numAmount = parseInt(amount)
    if (!numAmount || numAmount < 1000) {
      setError('Minimum transfer is Rp 1.000')
      return
    }
    setStep('confirm')
    setError('')
  }

  const handleTransfer = async (pin) => {
    setError('')
    
    const result = await transfer(
      selectedRecipient?.username || selectedRecipient?.phone,
      parseInt(amount),
      pin,
      description
    )
    
    if (result.success) {
      setSuccess(true)
      setShowPinSheet(false)
      setTimeout(() => navigate('/home'), 2000)
    } else {
      setError(result.error || 'Transfer failed')
      setShowPinSheet(false)
    }
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => step === 'search' ? navigate(-1) : setStep('search')} 
          className="p-2 -ml-2"
        >
          <ChevronLeft size={28} className="text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Send Money</h1>
      </div>

      {success ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center justify-center h-[60vh]"
        >
          <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mb-4">
            <ArrowRight size={48} className="text-success" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Transfer Successful!</h2>
          <p className="text-white/60">Your money has been sent</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          {step === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <p className="text-white/60 mb-4">Search by username or phone number</p>
              
              {/* Search Input */}
              <div className="relative mb-6">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search recipient..."
                  className="w-full bg-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* Search Results */}
              {isSearching ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-primary rounded-full animate-spin" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectRecipient(user)}
                      className="w-full glass-card-hover p-4 flex items-center gap-4 text-left"
                    >
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <User size={24} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.fullName}</p>
                        <p className="text-sm text-white/50">@{user.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery.length >= 3 ? (
                <p className="text-center text-white/50 py-8">No users found</p>
              ) : null}
            </motion.div>
          )}

          {step === 'amount' && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Recipient Card */}
              <div className="glass-card p-4 mb-6">
                <p className="text-sm text-white/60 mb-1">Sending to</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <User size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{selectedRecipient?.fullName}</p>
                    <p className="text-sm text-white/50">@{selectedRecipient?.username}</p>
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <label className="block text-sm text-white/60 mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg">Rp</span>
                  <input
                    type="text"
                    value={amount ? formatCurrency(amount).replace('Rp ', '') : ''}
                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0"
                    className="w-full bg-white/10 rounded-xl pl-12 pr-4 py-5 text-3xl font-bold text-white placeholder-white/20 border border-white/10 focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm text-white/60 mb-2">Note (optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this for?"
                  maxLength={100}
                  className="w-full bg-white/10 rounded-xl px-4 py-4 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:border-primary/50"
                />
              </div>

              {error && <p className="text-error text-sm mb-4">{error}</p>}

              <Button onClick={handleAmountConfirm} disabled={!amount || parseInt(amount) < 1000}>
                Continue
              </Button>
            </motion.div>
          )}

          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <p className="text-white/60 mb-6">Review your transfer</p>

              <div className="glass-card p-6 mb-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-white/60">To</span>
                  <span className="text-white font-medium">{selectedRecipient?.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Amount</span>
                  <span className="text-white font-medium">{formatCurrency(amount)}</span>
                </div>
                {description && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Note</span>
                    <span className="text-white">{description}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-white/10">
                  <div className="flex justify-between">
                    <span className="text-white font-medium">Total</span>
                    <span className="text-white font-bold text-xl">{formatCurrency(amount)}</span>
                  </div>
                </div>
              </div>

              <Button onClick={() => setShowPinSheet(true)}>Confirm Transfer</Button>
              <Button variant="ghost" onClick={() => setStep('amount')} className="mt-2">
                Back
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* PIN Bottom Sheet */}
      <BottomSheet
        isOpen={showPinSheet}
        onClose={() => setShowPinSheet(false)}
        title="Enter Transaction PIN"
      >
        <p className="text-center text-white/60 mb-4">
          Confirm transfer of {formatCurrency(amount)}
        </p>
        <PinInput
          length={6}
          onComplete={handleTransfer}
          error={error}
          disabled={isLoading}
        />
      </BottomSheet>
    </div>
  )
}

export default TransferPage
