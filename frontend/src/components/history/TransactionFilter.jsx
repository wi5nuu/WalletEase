import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  Calendar, 
  Filter,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Wallet,
  QrCode
} from 'lucide-react'

/**
 * TransactionFilter - Filter transactions by type, date, amount
 * Similar to BRImo/myBCA transaction filter
 */
const FILTER_TYPES = [
  { id: 'ALL', label: 'All', icon: Filter },
  { id: 'TOP_UP', label: 'Top Up', icon: Wallet },
  { id: 'TRANSFER_IN', label: 'Received', icon: ArrowDownLeft },
  { id: 'TRANSFER_OUT', label: 'Sent', icon: ArrowUpRight },
  { id: 'BILL_PAYMENT', label: 'Bills', icon: Receipt },
  { id: 'QRIS', label: 'QRIS', icon: QrCode },
]

const DATE_RANGES = [
  { id: 'TODAY', label: 'Today' },
  { id: 'YESTERDAY', label: 'Yesterday' },
  { id: 'LAST_7_DAYS', label: 'Last 7 Days' },
  { id: 'LAST_30_DAYS', label: 'Last 30 Days' },
  { id: 'THIS_MONTH', label: 'This Month' },
  { id: 'CUSTOM', label: 'Custom Range' },
]

export const TransactionFilter = ({ 
  activeFilter, 
  onFilterChange,
  dateRange,
  onDateRangeChange
}) => {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="space-y-4">
      {/* Type Filter Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {FILTER_TYPES.map((type) => {
          const Icon = type.icon
          const isActive = activeFilter === type.id
          return (
            <button
              key={type.id}
              onClick={() => onFilterChange?.(type.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                transition-all
                ${isActive 
                  ? 'bg-primary text-white shadow-soft' 
                  : 'bg-white text-slate-600 border border-border hover:border-primary-300'
                }
              `}
            >
              <Icon size={16} />
              {type.label}
            </button>
          )
        })}
      </div>

      {/* Date Filter */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <Calendar size={18} />
          <span className="text-sm font-medium">
            {DATE_RANGES.find(d => d.id === dateRange)?.label || 'Select Date'}
          </span>
          <ChevronDown 
            size={16} 
            className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Clear Filters */}
        {(activeFilter !== 'ALL' || dateRange !== 'LAST_30_DAYS') && (
          <button
            onClick={() => {
              onFilterChange?.('ALL')
              onDateRangeChange?.('LAST_30_DAYS')
            }}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Date Range Dropdown */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-border rounded-xl p-3 space-y-1">
              {DATE_RANGES.map((range) => (
                <button
                  key={range.id}
                  onClick={() => {
                    onDateRangeChange?.(range.id)
                    setShowFilters(false)
                  }}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                    ${dateRange === range.id 
                      ? 'bg-primary-50 text-primary font-medium' 
                      : 'text-slate-600 hover:bg-slate-50'
                    }
                  `}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * TransactionSummary - Summary stats for filtered transactions
 */
export const TransactionSummary = ({ transactions }) => {
  const stats = transactions.reduce((acc, tx) => {
    if (tx.direction === 'IN' || tx.type === 'TOP_UP') {
      acc.in += tx.amount
    } else {
      acc.out += tx.amount
    }
    return acc
  }, { in: 0, out: 0 })

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-green-50 border border-green-100 rounded-xl p-3">
        <p className="text-green-600 text-xs font-medium mb-1">Money In</p>
        <p className="text-green-700 font-bold text-lg">{formatCurrency(stats.in)}</p>
      </div>
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
        <p className="text-slate-500 text-xs font-medium mb-1">Money Out</p>
        <p className="text-slate-700 font-bold text-lg">{formatCurrency(stats.out)}</p>
      </div>
    </div>
  )
}

export default TransactionFilter
