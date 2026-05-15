import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Wallet, ArrowUpRight, ChevronRight } from 'lucide-react'
import { formatCurrency } from '../services/formatters'

/**
 * BalanceCard Component - Professional balance display card
 * Similar to BCA myBCA or BRI BRImo balance card
 */
export const BalanceCard = ({ 
  balance = 0,
  accountNumber,
  accountName,
  onTopUp,
  onTransfer,
  onViewDetails,
  isLoading = false,
}) => {
  const [showBalance, setShowBalance] = useState(true)
  
  const toggleBalance = () => setShowBalance(!showBalance)
  
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-primary to-primary-800 rounded-2xl p-5 text-white shadow-soft animate-pulse">
        <div className="h-4 bg-white/20 rounded w-24 mb-3" />
        <div className="h-8 bg-white/20 rounded w-40 mb-4" />
        <div className="h-10 bg-white/20 rounded w-full" />
      </div>
    )
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      {/* Main Card */}
      <div className="bg-gradient-to-br from-primary to-primary-800 rounded-2xl p-5 text-white shadow-soft">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        {/* Header */}
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Wallet size={18} />
            </div>
            <div>
              <p className="text-white/70 text-xs font-medium">Total Balance</p>
              <p className="text-white/50 text-xs">{accountName || 'PayFlow Account'}</p>
            </div>
          </div>
          <button
            onClick={toggleBalance}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        
        {/* Balance Amount */}
        <div className="relative mb-5">
          <p className="text-3xl font-bold tracking-tight">
            {showBalance ? formatCurrency(balance) : 'Rp ••••••••'}
          </p>
          {accountNumber && (
            <p className="text-white/60 text-sm mt-1 font-mono">
              {accountNumber.replace(/(\d{4})/g, '$1 ').trim()}
            </p>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="relative flex gap-3">
          <button
            onClick={onTopUp}
            className="flex-1 bg-white/15 hover:bg-white/25 rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowUpRight size={18} />
            <span className="font-semibold text-sm">Top Up</span>
          </button>
          <button
            onClick={onTransfer}
            className="flex-1 bg-white hover:bg-white/90 text-primary rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-colors font-semibold"
          >
            <span className="text-sm">Transfer</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      {/* Shadow Effect */}
      <div className="absolute -bottom-2 left-4 right-4 h-4 bg-primary/20 rounded-full blur-xl -z-10" />
    </motion.div>
  )
}

/**
 * MiniBalanceCard - Compact balance display for smaller spaces
 */
export const MiniBalanceCard = ({ balance, onPress }) => {
  const [showBalance, setShowBalance] = useState(true)
  
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onPress}
      className="w-full bg-gradient-to-r from-primary to-primary-600 rounded-xl p-4 text-white flex items-center justify-between"
    >
      <div>
        <p className="text-white/70 text-xs">Total Balance</p>
        <p className="text-xl font-bold">
          {showBalance ? formatCurrency(balance) : 'Rp ••••••'}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setShowBalance(!showBalance)
        }}
        className="p-2 bg-white/10 rounded-lg"
      >
        {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </motion.button>
  )
}

export default BalanceCard
