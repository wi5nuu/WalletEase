import React from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  X
} from 'lucide-react'
import { formatDate } from '../../services/formatters'
import Badge from '../ui/Badge'

/**
 * NotificationItem Component - Single notification display
 * Similar to BRImo/myBCA notification list
 */
const NotificationItem = ({ 
  notification, 
  onPress, 
  onDismiss,
  onMarkRead,
  index = 0 
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'TRANSACTION':
        if (notification.data?.direction === 'IN') return ArrowDownLeft
        if (notification.data?.direction === 'OUT') return ArrowUpRight
        return Wallet
      case 'SUCCESS':
        return CheckCircle
      case 'WARNING':
        return AlertCircle
      case 'INFO':
      default:
        return Info
    }
  }

  const getIconColor = () => {
    switch (notification.type) {
      case 'TRANSACTION':
        if (notification.data?.direction === 'IN') return 'bg-green-50 text-green-600'
        return 'bg-blue-50 text-primary'
      case 'SUCCESS':
        return 'bg-green-50 text-green-600'
      case 'WARNING':
        return 'bg-yellow-50 text-yellow-600'
      case 'INFO':
      default:
        return 'bg-blue-50 text-primary'
    }
  }

  const Icon = getIcon()

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        relative bg-white border rounded-xl p-4 
        ${notification.isRead ? 'border-border' : 'border-primary-200 bg-primary-50/30'}
        hover:shadow-card transition-all cursor-pointer
      `}
      onClick={() => onPress?.(notification)}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColor()}`}>
          <Icon size={20} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={`font-semibold text-sm ${notification.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                {notification.title}
              </p>
              <p className="text-slate-500 text-sm mt-0.5 line-clamp-2">
                {notification.message}
              </p>
            </div>
            {!notification.isRead && (
              <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
            )}
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-slate-400">
              {formatDate(notification.createdAt)}
            </p>
            
            {/* Actions */}
            <div className="flex items-center gap-1">
              {!notification.isRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onMarkRead?.(notification.id)
                  }}
                  className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors"
                  title="Mark as read"
                >
                  <CheckCircle size={14} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDismiss?.(notification.id)
                }}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * EmptyNotifications - When no notifications
 */
export const EmptyNotifications = () => (
  <div className="text-center py-16">
    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Bell size={32} className="text-slate-400" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Notifications</h3>
    <p className="text-slate-500 text-sm">
      You don't have any notifications yet
    </p>
  </div>
)

/**
 * NotificationGroup - Group notifications by date
 */
export const NotificationGroup = ({ title, notifications, ...props }) => {
  if (notifications.length === 0) return null

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
        {title}
      </h4>
      <div className="space-y-2">
        {notifications.map((notification, index) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            index={index}
            {...props}
          />
        ))}
      </div>
    </div>
  )
}

export default NotificationItem
