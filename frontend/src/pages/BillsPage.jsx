import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Zap, Droplets, Wifi, Smartphone, Heart, Tv, Music } from 'lucide-react'
import { useWalletStore } from '../stores/walletStore'
import { formatCurrency } from '../services/formatters'
import Button from '../components/ui/Button'
import PinInput from '../components/ui/PinInput'
import BottomSheet from '../components/ui/BottomSheet'
import api from '../services/api'

const BILL_CATEGORIES = {
  ELECTRICITY: { icon: Zap, color: 'bg-yellow-500/20 text-yellow-400' },
  WATER: { icon: Droplets, color: 'bg-blue-500/20 text-blue-400' },
  INTERNET: { icon: Wifi, color: 'bg-purple-500/20 text-purple-400' },
  MOBILE: { icon: Smartphone, color: 'bg-green-500/20 text-green-400' },
  INSURANCE: { icon: Heart, color: 'bg-red-500/20 text-red-400' },
  TV: { icon: Tv, color: 'bg-orange-500/20 text-orange-400' },
  MUSIC: { icon: Music, color: 'bg-pink-500/20 text-pink-400' },
}

const BillsPage = () => {
  const navigate = useNavigate()
  const { payBill, isLoading } = useWalletStore()
  
  const [bills, setBills] = useState([])
  const [selectedBill, setSelectedBill] = useState(null)
  const [customerId, setCustomerId] = useState('')
  const [amount, setAmount] = useState('')
  const [showPinSheet, setShowPinSheet] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    try {
      const response = await api.get('/bills')
      setBills(response.data.data)
    } catch (error) {
      console.error('Failed to fetch bills:', error)
    }
  }

  const handleBillSelect = (bill) => {
    setSelectedBill(bill)
    if (bill.fixedAmount) {
      setAmount(bill.fixedAmount.toString())
    }
  }

  const handlePay = () => {
    if (!customerId) {
      setError('Please enter customer ID')
      return
    }
    if (!amount || parseInt(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    setShowPinSheet(true)
    setError('')
  }

  const handlePinComplete = async (pin) => {
    const result = await payBill(selectedBill.id, customerId, parseInt(amount), pin)
    
    if (result.success) {
      setSuccess(true)
      setShowPinSheet(false)
      setTimeout(() => {
        setSuccess(false)
        setSelectedBill(null)
        setCustomerId('')
        setAmount('')
      }, 2000)
    } else {
      setError(result.error || 'Payment failed')
      setShowPinSheet(false)
    }
  }

  const getIcon = (category) => {
    const config = BILL_CATEGORIES[category] || BILL_CATEGORIES.ELECTRICITY
    return <config.icon size={24} className={config.color.split(' ')[1]} />
  }

  const getBgColor = (category) => {
    const config = BILL_CATEGORIES[category] || BILL_CATEGORIES.ELECTRICITY
    return config.color.split(' ')[0]
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => selectedBill ? setSelectedBill(null) : navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft size={28} className="text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Pay Bills</h1>
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
          <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
          <p className="text-white/60">Your bill has been paid</p>
        </motion.div>
      ) : selectedBill ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Selected Bill Card */}
          <div className="glass-card p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 ${getBgColor(selectedBill.category)} rounded-xl flex items-center justify-center`}>
                {getIcon(selectedBill.category)}
              </div>
              <div>
                <h3 className="font-semibold text-white">{selectedBill.name}</h3>
                <p className="text-sm text-white/50">{selectedBill.category}</p>
              </div>
            </div>
          </div>

          {/* Customer ID */}
          <div className="mb-4">
            <label className="block text-sm text-white/60 mb-2">Customer ID / Phone Number</label>
            <input
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="Enter customer ID"
              className="w-full bg-white/10 rounded-xl px-4 py-4 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:border-primary/50"
            />
          </div>

          {/* Amount */}
          <div className="mb-6">
            <label className="block text-sm text-white/60 mb-2">
              Amount {selectedBill.fixedAmount && '(Fixed)'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg">Rp</span>
              <input
                type="text"
                value={amount ? formatCurrency(amount).replace('Rp ', '') : ''}
                onChange={(e) => !selectedBill.fixedAmount && setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="0"
                readOnly={selectedBill.fixedAmount}
                className="w-full bg-white/10 rounded-xl pl-12 pr-4 py-4 text-2xl font-bold text-white placeholder-white/20 border border-white/10 focus:outline-none focus:border-primary/50 disabled:opacity-50"
              />
            </div>
          </div>

          {error && <p className="text-error text-sm mb-4">{error}</p>}

          <Button onClick={handlePay} disabled={!customerId || !amount}>
            Pay {formatCurrency(amount)}
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {bills.map((bill, index) => (
            <motion.button
              key={bill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleBillSelect(bill)}
              className="glass-card-hover p-4 flex flex-col items-center text-center gap-3"
            >
              <div className={`w-14 h-14 ${getBgColor(bill.category)} rounded-xl flex items-center justify-center`}>
                {getIcon(bill.category)}
              </div>
              <div>
                <p className="font-medium text-white text-sm">{bill.name}</p>
                {bill.fixedAmount && (
                  <p className="text-xs text-white/50">{formatCurrency(bill.fixedAmount)}</p>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* PIN Bottom Sheet */}
      <BottomSheet
        isOpen={showPinSheet}
        onClose={() => setShowPinSheet(false)}
        title="Enter Transaction PIN"
      >
        <div className="text-center mb-4">
          <p className="text-2xl font-bold text-white">{formatCurrency(amount)}</p>
          <p className="text-white/60 text-sm">{selectedBill?.name}</p>
        </div>
        <PinInput
          length={6}
          onComplete={handlePinComplete}
          error={error}
          disabled={isLoading}
        />
      </BottomSheet>
    </div>
  )
}

export default BillsPage
