import React from 'react'
import { motion } from 'framer-motion'
import { formatCurrency } from '../../services/formatters'

/**
 * TransferAmountInput - Amount input with quick presets
 * Similar to BRImo transfer amount input
 */
const PRESET_AMOUNTS = [50000, 100000, 250000, 500000, 1000000]

const TransferAmountInput = ({ 
  amount, 
  onChange, 
  error,
  availableBalance,
  maxAmount = 50000000,
  minAmount = 1000
}) => {
  const handlePresetClick = (preset) => {
    onChange?.(preset.toString())
  }

  const handleChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    onChange?.(value)
  }

  const numAmount = parseInt(amount) || 0
  const isOverBalance = availableBalance && numAmount > availableBalance
  const isUnderMin = numAmount > 0 && numAmount < minAmount
  const isOverMax = numAmount > maxAmount

  return (
    <div className="space-y-4">
      {/* Amount Display */}
      <div className="text-center py-6">
        <p className="text-slate-500 text-sm mb-2">Transfer Amount</p>
        <div className="relative inline-block">
          <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 text-2xl font-bold">
            Rp
          </span>
          <input
            type="text"
            value={amount ? formatCurrency(amount).replace('Rp ', '') : ''}
            onChange={handleChange}
            placeholder="0"
            className={`
              text-4xl md:text-5xl font-bold text-center bg-transparent
              focus:outline-none min-w-[200px] ml-12
              ${isOverBalance || isOverMax ? 'text-red-500' : 'text-slate-900'}
              placeholder:text-slate-300
            `}
          />
        </div>
        
        {/* Balance Info */}
        {availableBalance && (
          <p className="text-sm text-slate-500 mt-2">
            Available: <span className={isOverBalance ? 'text-red-500 font-medium' : 'text-slate-700'}>
              {formatCurrency(availableBalance)}
            </span>
          </p>
        )}
        
        {/* Error Messages */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm mt-2"
          >
            {error}
          </motion.p>
        )}
        {isOverBalance && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm mt-2"
          >
            Insufficient balance
          </motion.p>
        )}
        {isUnderMin && (
          <p className="text-amber-500 text-sm mt-2">
            Minimum transfer: {formatCurrency(minAmount)}
          </p>
        )}
        {isOverMax && (
          <p className="text-amber-500 text-sm mt-2">
            Maximum transfer: {formatCurrency(maxAmount)}
          </p>
        )}
      </div>

      {/* Quick Presets */}
      <div className="grid grid-cols-5 gap-2">
        {PRESET_AMOUNTS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => handlePresetClick(preset)}
            className={`
              py-2.5 px-1 rounded-xl text-xs font-medium border transition-all
              ${numAmount === preset
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-slate-600 border-border hover:border-primary-300'
              }
            `}
          >
            {preset >= 1000000 
              ? `${preset / 1000000}jt` 
              : preset >= 1000 
                ? `${preset / 1000}k` 
                : preset}
          </button>
        ))}
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-slate-400 text-xs">
        Tap to enter amount manually or select preset above
      </p>
    </div>
  )
}

export default TransferAmountInput
