import React from 'react'

/**
 * Logo Component - PayFlow branding
 * Polymorphism: Can display in different sizes
 */
export const Logo = ({ 
  size = 'md', // sm, md, lg, xl
  variant = 'default', // default, white, compact
  className = '' 
}) => {
  const sizeClasses = {
    sm: { container: 'w-8 h-8', text: 'text-sm', icon: 16 },
    md: { container: 'w-10 h-10', text: 'text-base', icon: 20 },
    lg: { container: 'w-12 h-12', text: 'text-lg', icon: 24 },
    xl: { container: 'w-16 h-16', text: 'text-xl', icon: 32 },
  }

  const s = sizeClasses[size]

  if (variant === 'compact') {
    return (
      <div className={`${s.container} bg-primary rounded-xl flex items-center justify-center ${className}`}>
        <span className={`text-white font-bold ${s.text}`}>P</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${s.container} bg-primary rounded-xl flex items-center justify-center`}>
        <svg 
          width={s.icon} 
          height={s.icon} 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M12 2L2 7L12 12L22 7L12 2Z" 
            fill="white"
          />
          <path 
            d="M2 17L12 22L22 17" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M2 12L12 17L22 12" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {variant !== 'icon' && (
        <span className={`font-bold ${s.text} ${variant === 'white' ? 'text-white' : 'text-slate-900'}`}>
          PayFlow
        </span>
      )}
    </div>
  )
}

export default Logo
