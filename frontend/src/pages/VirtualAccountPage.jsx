import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  Copy, 
  Check, 
  Building2, 
  Wallet,
  Clock,
  AlertCircle
} from 'lucide-react'
import { useWalletStore } from '../stores/walletStore'
import { formatCurrency, formatDateTime } from '../services/formatters'
import Card, { CardContent, CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import BottomSheet from '../components/ui/BottomSheet'
import PinInput from '../components/ui/PinInput'

/**
 * VirtualAccountPage - Top up via Virtual Account
 * Supports multiple banks: BCA, BRI, Mandiri, BNI
 * Similar to BRImo/myBCA VA top-up feature
 */
const BANKS = [
  {
    id: 'bca',
    name: 'BCA',
    code: '014',
    color: '#0056B3',
    logo: 'BCA',
    prefix: '88',
  },
  {
    id: 'bri',
    name: 'BRI',
    code: '002',
    color: '#005490',
    logo: 'BRI',
    prefix: '77',
  },
  {
    id: 'mandiri',
    name: 'Mandiri',
    code: '008',
    color: '#FFD200',
    textColor: '#003366',
    logo: 'Mandiri',
    prefix: '66',
  },
  {
    id: 'bni',
    name: 'BNI',
    code: '009',
    color: '#006600',
    logo: 'BNI',
    prefix: '55',
  },
]

const PRESET_AMOUNTS = [50000, 100000, 250000, 500000, 1000000, 2500000]

const VirtualAccountPage = () => {
  const navigate = useNavigate()
  const { topUp, isLoading, balance } = useWalletStore()
  
  const [step, setStep] = useState('select') // select, amount, confirm, success
  const [selectedBank, setSelectedBank] = useState(null)
  const [amount, setAmount] = useState('')
  const [showPinSheet, setShowPinSheet] = useState(false)
  const [error, setError] = useState('')
  const [vaNumber, setVaNumber] = useState('')
  const [copied, setCopied] = useState(false)
  const [expiresAt, setExpiresAt] = useState(null)

  const handleBankSelect = (bank) => {
    setSelectedBank(bank)
    setStep('amount')
  }

  const handleAmountSelect = (preset) => {
    setAmount(preset.toString())
  }

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    setAmount(value)
    setError('')
  }

  const generateVA = () => {
    const numAmount = parseInt(amount)
    if (!numAmount || numAmount < 10000) {
      setError('Minimum top-up is Rp 10.000')
      return
    }
    if (numAmount > 10000000) {
      setError('Maximum top-up is Rp 10.000.000')
      return
    }
    
    // Generate VA number: BANK_PREFIX + USER_ID + TIMESTAMP
    const timestamp = Date.now().toString().slice(-6)
    const generated = `${selectedBank.prefix}1234${timestamp}`
    setVaNumber(generated)
    
    // Set expiry time (24 hours from now)
    const expiry = new Date()
    expiry.setHours(expiry.getHours() + 24)
    setExpiresAt(expiry)
    
    setStep('confirm')
  }

  const handleCopyVA = () => {
    navigator.clipboard.writeText(vaNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConfirmPayment = async (pin) => {
    setError('')
    
    const result = await topUp(parseInt(amount), pin)
    
    if (result.success) {
      setShowPinSheet(false)
      setStep('success')
    } else {
      setError(result.error || 'Payment confirmation failed')
      setShowPinSheet(false)
    }
  }

  const renderBankSelection = () => (
    <div className="space-y-4">
      <p className="text-slate-500 text-sm">Select your bank to generate a virtual account number</p>
      
      <div className="grid grid-cols-2 gap-3">
        {BANKS.map((bank) => (
          <motion.button
            key={bank.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleBankSelect(bank)}
            className="bg-white border border-border rounded-xl p-4 text-left hover:border-primary-200 hover:shadow-card transition-all"
          >
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
              style={{ backgroundColor: bank.color + '15' }}
            >
              <span 
                className="font-bold text-lg"
                style={{ color: bank.color }}
              >
                {bank.logo}
              </span>
            </div>
            <p className="font-semibold text-slate-900">{bank.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">Kode: {bank.code}</p>
          </motion.button>
        ))}
      </div>
    </div>
  )

  const renderAmountSelection = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Enter Amount
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-semibold">
            Rp
          </span>
          <input
            type="text"
            value={amount ? formatCurrency(amount).replace('Rp ', '') : ''}
            onChange={handleAmountChange}
            placeholder="0"
            className="w-full bg-slate-50 rounded-xl pl-14 pr-4 py-4 text-2xl font-bold text-slate-900 placeholder-slate-300 border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"
          />
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-500 mb-3">
          Quick Select
        </label>
        <div className="grid grid-cols-3 gap-3">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              onClick={() => handleAmountSelect(preset)}
              className={`
                py-3 px-2 rounded-xl text-sm font-medium border transition-all
                ${parseInt(amount) === preset
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-slate-700 border-border hover:border-primary-300'
                }
              `}
            >
              {formatCurrency(preset)}
            </button>
          ))}
        </div>
      </div>

      <Button 
        onClick={generateVA}
        disabled={!amount || parseInt(amount) < 10000}
        loading={isLoading}
      >
        Generate Virtual Account
      </Button>
    </div>
  )

  const renderConfirm = () => (
    <div className="space-y-6">
      {/* VA Card */}
      <Card variant="default">
        <CardContent className="text-center">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: selectedBank.color + '15' }}
          >
            <span 
              className="font-bold text-2xl"
              style={{ color: selectedBank.color }}
            >
              {selectedBank.logo}
            </span>
          </div>
          
          <p className="text-slate-500 text-sm mb-1">Virtual Account Number</p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <p className="text-2xl font-bold text-slate-900 font-mono tracking-wider">
              {vaNumber.replace(/(\d{4})/g, '$1 ').trim()}
            </p>
            <button
              onClick={handleCopyVA}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="text-slate-500" />}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 rounded-lg py-2 px-4">
            <Clock size={16} />
            <p className="text-sm font-medium">
              Expires: {expiresAt ? formatDateTime(expiresAt) : '-'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card variant="default">
        <CardHeader>
          <p className="font-semibold text-slate-900">How to Pay</p>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-primary-100 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                1
              </span>
              <span>Open {selectedBank.name} mobile banking or ATM</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-primary-100 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                2
              </span>
              <span>Select "Transfer" or "Payment" menu</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-primary-100 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                3
              </span>
              <span>Enter Virtual Account number above</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-primary-100 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                4
              </span>
              <span>Confirm payment of {formatCurrency(amount)}</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-primary-100 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                5
              </span>
              <span>Return here and tap "I've Paid" below</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Amount Summary */}
      <div className="bg-slate-50 rounded-xl p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-500">Amount</span>
          <span className="font-medium text-slate-900">{formatCurrency(amount)}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-500">Admin Fee</span>
          <Badge variant="success" size="sm">FREE</Badge>
        </div>
        <div className="border-t border-border pt-2 mt-2">
          <div className="flex justify-between">
            <span className="font-semibold text-slate-900">Total</span>
            <span className="font-bold text-lg text-primary">{formatCurrency(amount)}</span>
          </div>
        </div>
      </div>

      <Button onClick={() => setShowPinSheet(true)}>
        I've Paid - Confirm
      </Button>
      
      <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
        <AlertCircle size={12} />
        Don't close this page until payment is confirmed
      </p>
    </div>
  )

  const renderSuccess = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check size={48} className="text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        Top Up Successful!
      </h2>
      <p className="text-slate-500 mb-6">
        {formatCurrency(amount)} has been added to your wallet
      </p>
      <div className="bg-slate-50 rounded-xl p-4 mx-4 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">New Balance</span>
          <span className="font-bold text-slate-900">{formatCurrency(balance)}</span>
        </div>
      </div>
      <Button onClick={() => navigate('/home')}>
        Back to Home
      </Button>
    </motion.div>
  )

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <button 
          onClick={() => step === 'select' ? navigate(-1) : setStep('select')}
          className="p-2 -ml-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ChevronLeft size={28} className="text-slate-700" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">
          {step === 'confirm' ? 'Virtual Account' : 'Top Up via VA'}
        </h1>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {step === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {renderBankSelection()}
          </motion.div>
        )}
        
        {step === 'amount' && (
          <motion.div
            key="amount"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {renderAmountSelection()}
          </motion.div>
        )}
        
        {step === 'confirm' && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {renderConfirm()}
          </motion.div>
        )}
        
        {step === 'success' && renderSuccess()}
      </AnimatePresence>

      {/* PIN Bottom Sheet */}
      <BottomSheet
        isOpen={showPinSheet}
        onClose={() => setShowPinSheet(false)}
        title="Enter PIN to Confirm"
      >
        <div className="text-center mb-4">
          <p className="text-slate-500 text-sm">Confirm payment of</p>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(amount)}</p>
        </div>
        <div className="pb-20">
          <PinInput
            length={6}
            onComplete={handleConfirmPayment}
            error={error}
            disabled={isLoading}
          />
        </div>
      </BottomSheet>
    </div>
  )
}

export default VirtualAccountPage
