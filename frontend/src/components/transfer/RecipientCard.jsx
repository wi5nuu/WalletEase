import React from 'react'
import { motion } from 'framer-motion'
import { User, Star, MoreVertical, Clock } from 'lucide-react'

/**
 * RecipientCard Component - Display saved or recent recipient
 * Similar to BRImo/myBCA transfer recipient list
 */
const RecipientCard = ({ 
  recipient, 
  onSelect, 
  isFavorite = false,
  isRecent = false,
  index = 0 
}) => {
  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect?.(recipient)}
      className="w-full bg-white border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary-200 hover:shadow-card transition-all text-left"
    >
      {/* Avatar */}
      <div className="relative">
        <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
          {recipient.avatarUrl ? (
            <img 
              src={recipient.avatarUrl} 
              alt={recipient.fullName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-primary font-semibold">{getInitials(recipient.fullName)}</span>
          )}
        </div>
        {isFavorite && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
            <Star size={10} className="text-white fill-white" />
          </div>
        )}
        {isRecent && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center border border-white">
            <Clock size={10} className="text-slate-500" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-slate-900 truncate">{recipient.fullName}</p>
          {recipient.isVerified && (
            <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 truncate">@{recipient.username}</p>
        {recipient.phone && (
          <p className="text-xs text-slate-400">{recipient.phone}</p>
        )}
      </div>

      {/* More Actions */}
      <button 
        onClick={(e) => {
          e.stopPropagation()
          // Show more options
        }}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <MoreVertical size={18} className="text-slate-400" />
      </button>
    </motion.button>
  )
}

/**
 * EmptyRecipients - When no recipients found
 */
export const EmptyRecipients = ({ onAddNew }) => (
  <div className="text-center py-12">
    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <User size={32} className="text-slate-400" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Recipients Yet</h3>
    <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
      Add your first recipient to start making transfers
    </p>
    <button
      onClick={onAddNew}
      className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-600 transition-colors"
    >
      Add Recipient
    </button>
  </div>
)

/**
 * RecentTransferItem - Quick access to recent transfers
 */
export const RecentTransferItem = ({ transfer, onPress, index = 0 }) => {
  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  }

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onPress?.(transfer)}
      className="flex flex-col items-center gap-2 min-w-[80px]"
    >
      <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center hover:bg-primary-100 transition-colors">
        {transfer.recipient?.avatarUrl ? (
          <img 
            src={transfer.recipient.avatarUrl} 
            alt={transfer.recipient.fullName}
            className="w-full h-full rounded-2xl object-cover"
          />
        ) : (
          <span className="text-primary font-semibold text-lg">{getInitials(transfer.recipient?.fullName)}</span>
        )}
      </div>
      <p className="text-xs font-medium text-slate-700 text-center max-w-[70px] truncate">
        {transfer.recipient?.fullName?.split(' ')[0]}
      </p>
    </motion.button>
  )
}

export default RecipientCard
