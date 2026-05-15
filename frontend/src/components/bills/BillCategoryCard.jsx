import React from 'react'
import { motion } from 'framer-motion'
import { 
  Zap, 
  Droplets, 
  Wifi, 
  Smartphone, 
  Tv, 
  CreditCard,
  Home,
  Plane,
  GraduationCap,
  HeartPulse
} from 'lucide-react'

/**
 * BillCategoryCard Component - Category selection for bill payments
 * Similar to BRImo/myBCA bill payment categories
 */
const BILL_CATEGORIES = [
  { id: 'electricity', name: 'Electricity', icon: Zap, color: 'bg-yellow-50 text-yellow-600' },
  { id: 'water', name: 'Water', icon: Droplets, color: 'bg-blue-50 text-blue-600' },
  { id: 'internet', name: 'Internet', icon: Wifi, color: 'bg-purple-50 text-purple-600' },
  { id: 'mobile', name: 'Mobile', icon: Smartphone, color: 'bg-green-50 text-green-600' },
  { id: 'tv', name: 'TV Cable', icon: Tv, color: 'bg-red-50 text-red-600' },
  { id: 'credit', name: 'Credit Card', icon: CreditCard, color: 'bg-indigo-50 text-indigo-600' },
  { id: 'bpjs', name: 'BPJS', icon: HeartPulse, color: 'bg-pink-50 text-pink-600' },
  { id: 'tax', name: 'Tax', icon: Home, color: 'bg-orange-50 text-orange-600' },
  { id: 'education', name: 'Education', icon: GraduationCap, color: 'bg-teal-50 text-teal-600' },
  { id: 'travel', name: 'Travel', icon: Plane, color: 'bg-cyan-50 text-cyan-600' },
]

export const BillCategoryGrid = ({ onSelectCategory }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {BILL_CATEGORIES.map((category, index) => {
        const Icon = category.icon
        return (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectCategory?.(category)}
            className="bg-white border border-border rounded-xl p-4 flex items-center gap-3 hover:border-primary-200 hover:shadow-card transition-all text-left"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.color}`}>
              <Icon size={20} />
            </div>
            <span className="font-medium text-slate-900 text-sm">{category.name}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

/**
 * BillProviderCard - Specific provider under a category
 */
export const BillProviderCard = ({ provider, onSelect, index = 0 }) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect?.(provider)}
      className="w-full bg-white border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary-200 hover:shadow-card transition-all text-left"
    >
      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
        {provider.logo ? (
          <img src={provider.logo} alt={provider.name} className="w-8 h-8 object-contain" />
        ) : (
          <span className="text-slate-400 font-bold">{provider.name[0]}</span>
        )}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-slate-900">{provider.name}</p>
        <p className="text-xs text-slate-500">{provider.code}</p>
      </div>
    </motion.button>
  )
}

/**
 * BillDetailsCard - Show bill details before payment
 */
export const BillDetailsCard = ({ bill }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="bg-white border border-border rounded-xl p-5 space-y-4">
      {/* Provider Info */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
          {bill.providerLogo ? (
            <img src={bill.providerLogo} alt={bill.providerName} className="w-8 h-8 object-contain" />
          ) : (
            <span className="text-slate-400 font-bold">{bill.providerName?.[0]}</span>
          )}
        </div>
        <div>
          <p className="font-semibold text-slate-900">{bill.providerName}</p>
          <p className="text-sm text-slate-500">{bill.customerId}</p>
        </div>
      </div>

      {/* Bill Details */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Customer Name</span>
          <span className="text-slate-900 font-medium">{bill.customerName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Bill Period</span>
          <span className="text-slate-900">{bill.period}</span>
        </div>
        {bill.dueDate && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Due Date</span>
            <span className={`font-medium ${bill.isOverdue ? 'text-red-500' : 'text-slate-900'}`}>
              {bill.dueDate}
            </span>
          </div>
        )}
      </div>

      {/* Amount */}
      <div className="border-t border-border pt-4">
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Total Amount</span>
          <span className="text-2xl font-bold text-slate-900">{formatCurrency(bill.amount)}</span>
        </div>
        {bill.adminFee > 0 && (
          <p className="text-xs text-slate-400 mt-1 text-right">
            Includes admin fee: {formatCurrency(bill.adminFee)}
          </p>
        )}
      </div>

      {/* Status Badge */}
      {bill.status && (
        <div className="flex justify-center">
          <span className={`
            px-3 py-1 rounded-full text-xs font-medium
            ${bill.status === 'PAID' ? 'bg-green-100 text-green-700' : ''}
            ${bill.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : ''}
            ${bill.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : ''}
          `}>
            {bill.status}
          </span>
        </div>
      )}
    </div>
  )
}

export default BillCategoryGrid
