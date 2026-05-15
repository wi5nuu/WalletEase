import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

/**
 * QuickAction Component - Professional quick action button
 * Similar to BCA/BRI mobile app home screen actions
 */
export const QuickAction = ({ 
  icon: Icon, 
  label, 
  to, 
  onClick,
  variant = 'default', // default, primary, secondary, outline
  size = 'md', // sm, md, lg
  color = 'blue', // blue, orange, green, purple, red
  badge,
  disabled = false,
}) => {
  const navigate = useNavigate()
  
  const sizeClasses = {
    sm: { container: 'w-10 h-10', icon: 18, text: 'text-xs' },
    md: { container: 'w-12 h-12', icon: 22, text: 'text-xs' },
    lg: { container: 'w-14 h-14', icon: 26, text: 'text-sm' },
  }
  
  const colorClasses = {
    blue: 'bg-primary-50 text-primary hover:bg-primary-100',
    orange: 'bg-orange-50 text-secondary hover:bg-orange-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    red: 'bg-red-50 text-red-600 hover:bg-red-100',
    slate: 'bg-slate-50 text-slate-600 hover:bg-slate-100',
  }
  
  const variantClasses = {
    default: colorClasses[color],
    primary: 'bg-primary text-white hover:bg-primary-600',
    secondary: 'bg-secondary text-white hover:bg-secondary-600',
    outline: 'bg-white border-2 border-slate-200 text-slate-700 hover:border-primary hover:text-primary',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-50',
  }
  
  const s = sizeClasses[size]
  
  const handleClick = () => {
    if (disabled) return
    if (onClick) onClick()
    else if (to) navigate(to)
  }
  
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      disabled={disabled}
      className="flex flex-col items-center gap-2 group"
    >
      <div className={`
        ${s.container} rounded-2xl flex items-center justify-center
        transition-all duration-200
        ${variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-sm'}
      `}>
        <Icon size={s.icon} strokeWidth={2} />
        {badge && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>
      <span className={`${s.text} font-medium text-slate-700 text-center leading-tight max-w-[70px]`}>
        {label}
      </span>
    </motion.button>
  )
}

/**
 * QuickActionGroup - Grid of quick actions
 */
export const QuickActionGroup = ({ children, className = '' }) => (
  <div className={`grid grid-cols-4 gap-4 ${className}`}>
    {children}
  </div>
)

export default QuickAction
