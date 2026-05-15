import React from 'react'
import { motion } from 'framer-motion'

/**
 * Card Component - Professional Banking Card
 * Encapsulation: Encapsulates card styling logic
 */
export const Card = ({ 
  children, 
  className = '', 
  variant = 'default', // default, elevated, gradient-blue, gradient-orange, outline
  hover = false,
  onClick,
  ...props 
}) => {
  const baseClasses = 'rounded-2xl overflow-hidden transition-all duration-300'
  
  const variantClasses = {
    default: 'bg-white shadow-card border border-border',
    elevated: 'bg-white shadow-elevated border border-border',
    'gradient-blue': 'bg-gradient-to-br from-primary to-primary-700 text-white shadow-soft',
    'gradient-orange': 'bg-gradient-to-br from-secondary to-secondary-600 text-white',
    outline: 'bg-white border-2 border-border',
    glass: 'bg-white/80 backdrop-blur-md border border-white/20',
  }
  
  const hoverClasses = hover 
    ? 'cursor-pointer hover:shadow-card-hover hover:border-primary-200 transform hover:-translate-y-0.5' 
    : ''
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`
  
  if (onClick) {
    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        className={classes}
        onClick={onClick}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
  
  return <div className={classes} {...props}>{children}</div>
}

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-5 py-4 border-b border-border/50 ${className}`}>{children}</div>
)

export const CardContent = ({ children, className = '', padding = 'normal' }) => {
  const paddingClasses = {
    none: '',
    small: 'p-3',
    normal: 'p-5',
    large: 'p-6',
  }
  return <div className={`${paddingClasses[padding]} ${className}`}>{children}</div>
}

export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-5 py-4 border-t border-border/50 bg-slate-50/50 ${className}`}>{children}</div>
)

export default Card
