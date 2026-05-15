import React, { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import clsx from 'clsx'

const Input = forwardRef(({ 
  label, 
  error, 
  type = 'text', 
  icon: Icon, 
  className,
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-white/70 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
            <Icon size={20} />
          </div>
        )}
        <input
          ref={ref}
          type={inputType}
          className={clsx(
            'w-full bg-white/10 rounded-xl px-4 py-4 text-white placeholder-white/40',
            'border border-white/10 focus:outline-none transition-all',
            Icon && 'pl-12',
            isPassword && 'pr-12',
            isFocused && 'border-primary/50 bg-white/15',
            error && 'border-error'
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
