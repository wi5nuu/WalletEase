import React from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

/**
 * ProfileMenuItem Component - Menu item for profile page
 * Similar to BRImo/myBCA settings menu
 */
const ProfileMenuItem = ({ 
  icon: Icon, 
  label, 
  sublabel,
  onClick, 
  index = 0,
  danger = false,
  badge,
  toggle,
  toggleValue,
  onToggle,
  disabled = false
}) => {
  const handleClick = () => {
    if (!disabled) {
      if (toggle && onToggle) {
        onToggle(!toggleValue)
      } else {
        onClick?.()
      }
    }
  }

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      disabled={disabled}
      className={`
        w-full bg-white border border-border rounded-xl p-4 
        flex items-center justify-between
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-200 hover:shadow-card cursor-pointer'}
        ${danger ? 'hover:border-red-200' : ''}
        transition-all
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center
          ${danger ? 'bg-red-50' : 'bg-slate-50'}
        `}>
          <Icon size={20} className={danger ? 'text-red-500' : 'text-slate-600'} />
        </div>
        <div className="text-left">
          <p className={`font-medium ${danger ? 'text-red-600' : 'text-slate-900'}`}>
            {label}
          </p>
          {sublabel && (
            <p className="text-xs text-slate-500">{sublabel}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Badge */}
        {badge && (
          <span className="px-2 py-0.5 bg-primary text-white text-xs font-medium rounded-full">
            {badge}
          </span>
        )}

        {/* Toggle Switch */}
        {toggle ? (
          <div className={`
            w-12 h-6 rounded-full p-1 transition-colors
            ${toggleValue ? 'bg-primary' : 'bg-slate-200'}
          `}>
            <div className={`
              w-4 h-4 bg-white rounded-full shadow transition-transform
              ${toggleValue ? 'translate-x-6' : 'translate-x-0'}
            `} />
          </div>
        ) : (
          <ChevronRight size={20} className={danger ? 'text-red-400' : 'text-slate-400'} />
        )}
      </div>
    </motion.button>
  )
}

/**
 * ProfileSection - Group related menu items
 */
export const ProfileSection = ({ title, children, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {title && (
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1 mb-3">
        {title}
      </h4>
    )}
    <div className="space-y-2">
      {children}
    </div>
  </div>
)

/**
 * ProfileHeader - User profile card
 */
export const ProfileHeader = ({ user, onEdit }) => {
  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
  }

  return (
    <div className="bg-white border border-border rounded-2xl p-5">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center overflow-hidden">
            {user?.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-primary text-2xl font-bold">{getInitials(user?.fullName)}</span>
            )}
          </div>
          <button
            onClick={onEdit}
            className="absolute bottom-0 right-0 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900">{user?.fullName}</h2>
          <p className="text-slate-500 text-sm">@{user?.username}</p>
          <div className="flex items-center gap-3 mt-2 text-sm">
            <span className="text-slate-600">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-border">
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">Verified</p>
          <p className="text-xs text-slate-500">Account Status</p>
        </div>
        <div className="text-center border-x border-border">
          <p className="text-lg font-bold text-slate-900">PayFlow</p>
          <p className="text-xs text-slate-500">Member Since</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">Standard</p>
          <p className="text-xs text-slate-500">Account Type</p>
        </div>
      </div>
    </div>
  )
}

export default ProfileMenuItem
