import React from 'react'

/**
 * Badge Component - Status indicators for transactions, notifications
 * Polymorphism: Can display different styles based on status type
 */
export const Badge = ({ 
  children, 
  variant = 'default', // default, success, error, warning, info, outline
  size = 'md', // sm, md, lg
  className = '',
  dot = false,
  ...props 
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }
  
  const variantClasses = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
    warning: 'bg-yellow-100 text-yellow-700',
    info: 'bg-blue-100 text-blue-700',
    primary: 'bg-primary-100 text-primary-700',
    outline: 'bg-transparent border border-current',
    ghost: 'bg-transparent text-current',
  }
  
  const dotColors = {
    default: 'bg-slate-500',
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
    primary: 'bg-primary',
  }
  
  const classes = `
    inline-flex items-center gap-1.5 font-medium rounded-full
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `.trim()
  
  return (
    <span className={classes} {...props}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  )
}

/**
 * Status Badge with icon support
 */
export const StatusBadge = ({ 
  status, // PENDING, COMPLETED, FAILED, CANCELLED, PROCESSING
  className = '' 
}) => {
  const statusConfig = {
    PENDING: { variant: 'warning', label: 'Pending', dot: true },
    COMPLETED: { variant: 'success', label: 'Completed', dot: true },
    FAILED: { variant: 'error', label: 'Failed', dot: true },
    CANCELLED: { variant: 'default', label: 'Cancelled', dot: true },
    PROCESSING: { variant: 'info', label: 'Processing', dot: true },
  }
  
  const config = statusConfig[status] || statusConfig.PENDING
  
  return (
    <Badge 
      variant={config.variant} 
      dot={config.dot}
      className={className}
    >
      {config.label}
    </Badge>
  )
}

export default Badge
