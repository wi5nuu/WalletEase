import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'default',
  disabled = false,
  loading = false,
  className,
  ...props 
}) => {
  const baseStyles = 'w-full font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
  
  const variants = {
    primary: 'bg-primary hover:bg-primary-dark text-white',
    secondary: 'bg-white/10 hover:bg-white/20 text-white',
    outline: 'bg-transparent border-2 border-white/20 hover:bg-white/5 text-white',
    danger: 'bg-error hover:bg-red-600 text-white',
    ghost: 'bg-transparent hover:bg-white/5 text-white',
  }

  const sizes = {
    default: 'py-4 px-6 text-base',
    small: 'py-2 px-4 text-sm',
    large: 'py-5 px-8 text-lg',
  }

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : children}
    </motion.button>
  )
}

export default Button
