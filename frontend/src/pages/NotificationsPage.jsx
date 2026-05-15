import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Bell, Check, CheckCheck } from 'lucide-react'
import { useNotificationStore } from '../stores/notificationStore'
import { formatDate } from '../services/formatters'
import { SkeletonList } from '../components/ui/Skeleton'

const NotificationsPage = () => {
  const navigate = useNavigate()
  const { notifications, fetchNotifications, markAsRead, markAllAsRead, isLoading } = useNotificationStore()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'TRANSACTION':
        return 'bg-success/20 text-success'
      case 'SECURITY':
        return 'bg-error/20 text-error'
      case 'PROMOTION':
        return 'bg-warning/20 text-warning'
      case 'BILL_REMINDER':
        return 'bg-primary/20 text-primary'
      default:
        return 'bg-white/10 text-white'
    }
  }

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(notification)
    return groups
  }, {})

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft size={28} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Notifications</h1>
        </div>
        
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-sm text-white/80 hover:bg-white/15"
          >
            <CheckCheck size={16} />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <SkeletonList count={5} />
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <Bell size={32} className="text-white/40" />
          </div>
          <p className="text-white/60">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNotifications).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-white/40 mb-3 sticky top-0 bg-background py-2">
                {date}
              </h3>
              <div className="space-y-3">
                {items.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                    className={`glass-card-hover p-4 flex items-start gap-4 cursor-pointer ${
                      !notification.isRead ? 'border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationIcon(notification.type)}`}>
                      <Bell size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`font-medium text-white ${!notification.isRead ? '' : 'opacity-80'}`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-sm text-white/60 mt-1">{notification.message}</p>
                      <p className="text-xs text-white/40 mt-2">{formatDate(notification.createdAt)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
