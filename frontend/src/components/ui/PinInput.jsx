import React, { useState, useRef, useEffect } from 'react'

const PinInput = ({ length = 6, onComplete, error, disabled = false }) => {
  const [pin, setPin] = useState(Array(length).fill(''))
  const inputRefs = useRef([])
  const containerRef = useRef(null)

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  // Scroll into view when keyboard appears on mobile
  const handleFocus = (index) => {
    setTimeout(() => {
      const input = inputRefs.current[index]
      if (input && containerRef.current) {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }

  const handleChange = (index, value) => {
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)

    // Move to next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Check if complete
    const pinString = newPin.join('')
    if (pinString.length === length) {
      onComplete?.(pinString)
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4 pb-64">
      <div className="flex gap-3">
        {pin.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => handleFocus(index)}
            className={`
              w-12 h-14 text-center text-xl font-bold rounded-xl
              bg-white/10 border-2 text-white
              focus:outline-none focus:border-primary transition-all
              ${error ? 'border-error' : 'border-white/10'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
        ))}
      </div>
      {error && <p className="text-error text-sm">{error}</p>}
    </div>
  )
}

export default PinInput
