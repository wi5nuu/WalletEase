import React from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Receipt, 
  Wallet, 
  CreditCard,
  Smartphone,
  Zap,
  QrCode,
  User
} from 'lucide-react'
import { formatCurrency, formatDate, formatTime } from '../services/formatters'
import Badge from './Badge'

/**
 * TransactionItem Component - Professional transaction list item
 * Inheritance: Uses consistent styling patterns
 * Polymorphism: Displays different icons/colors based on transaction type
 */
const getTransactionConfig = (type, direction) => {
  const configs = {
    TOP_UP: {
      icon: Wallet,
      label: 'Top Up',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      amountPrefix: '+',
      amountColor: 'text-green-600',
    },
    TRANSFER: {
      icon: direction === 'IN' ? ArrowDownLeft : ArrowUpRight,
      label: direction === 'IN' ? 'Received' : 'Sent',
      bgColor: direction === 'IN' ? 'bg-green-50' : 'bg-blue-50',
      iconColor: direction === 'IN' ? 'text-green-600' : 'text-primary',
      amountPrefix: direction === 'IN' ? '+' : '-',
      amountColor: direction === 'IN' ? 'text-green-600' : 'text-slate-900',
    },
    BILL_PAYMENT: {
      icon: Receipt,
      label: 'Bill Payment',
      bgColor: 'bg-orange-50',
      iconColor: 'text-secondary',
      amountPrefix: '-',
      amountColor: 'text-slate-900',
    },
    QRIS: {
      icon: QrCode,
      label: 'QRIS Payment',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      amountPrefix: '-',
      amountColor: 'text-slate-900',
    },
    VIRTUAL_ACCOUNT: {
      icon: CreditCard,
      label: 'Virtual Account',
      bgColor: 'bg-blue-50',
      iconColor: 'text-primary',
      amountPrefix: '+',
      amountColor: 'text-green-600',
    },
    E_WALLET: {
      icon: Smartphone,
      label: 'E-Wallet',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      amountPrefix: '-',
      amountColor: 'text-slate-900',
    },
  }
  
  return configs[type] || {
    icon: Zap,
    label: 'Transaction',
    bgColor: 'bg-slate-50',
    iconColor: 'text-slate-600',
    amountPrefix: '',
    amountColor: 'text-slate-900',
  }
}

const TransactionItem = ({ 
  transaction, 
  onClick, 
  index = 0,
  showDate = true,
  compact = false,
}) => {
  const { 
    id, 
    type, 
    direction, 
    amount, 
    status, 
    createdAt, 
    description,
    sender,
    receiver,
    referenceCode
  } = transaction
  
  const config = getTransactionConfig(type, direction)
  const Icon = config.icon
  
  // Get display name
  let displayName = config.label
  if (type === 'TRANSFER') {
    if (direction === 'IN' && sender) {
      displayName = sender.fullName || sender.username
    } else if (direction === 'OUT' && receiver) {
      displayName = receiver.fullName || receiver.username
    }
  } else if (type === 'BILL_PAYMENT' && description) {
    displayName = description.split(' - ')[0] || config.label
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onClick?.(transaction)}
      className={`
        flex items-center gap-4 p-4 bg-white rounded-xl border border-border 
        hover:border-primary-200 hover:shadow-card transition-all cursor-pointer
        ${compact ? 'py-3' : ''}
      `}
    >
      {/* Icon */}
      <div className={`
        ${compact ? 'w-10 h-10' : 'w-12 h-12'} 
        ${config.bgColor} rounded-xl flex items-center justify-center flex-shrink-0
      `}>
        <Icon size={compact ? 20 : 24} className={config.iconColor} />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`font-semibold text-slate-900 truncate ${compact ? 'text-sm' : ''}`}>
            {displayName}
          </p>
          {status === 'PENDING' && (
            <Badge variant="warning" size="sm" dot className="flex-shrink-0">
              Pending
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {showDate && (
            <p className={`text-slate-500 ${compact ? 'text-xs' : 'text-sm'}`}>
              {formatDate(createdAt)}
            </p>
          )}
          {referenceCode && (
            <>
              <span className="text-slate-300">•</span>
              <p className={`text-slate-400 ${compact ? 'text-xs' : 'text-sm'}`}>
                {referenceCode}
              </p>
            </>
          )}
        </div>
      </div>
      
      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className={`font-bold ${compact ? 'text-sm' : ''} ${config.amountColor}`}>
          {config.amountPrefix}{formatCurrency(amount)}
        </p>
        <p className={`text-slate-400 ${compact ? 'text-xs' : 'text-sm'}`}>
          {formatTime(createdAt)}
        </p>
      </div>
    </motion.div>
  )
}

export default TransactionItem
