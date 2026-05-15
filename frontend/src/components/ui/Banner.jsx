import React from 'react'
import { motion } from 'framer-motion'
import { X, ChevronRight } from 'lucide-react'

/**
 * Banner Component - Promotional banner like BCA/BRI apps
 */
export const Banner = ({ 
  title, 
  subtitle, 
  image,
  onPress,
  onClose,
  variant = 'default', // default, promotional, info
  color = 'blue', // blue, orange, green, purple
}) => {
  const colorClasses = {
    blue: 'from-primary to-primary-600',
    orange: 'from-secondary to-secondary-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onPress}
      className={`
        relative overflow-hidden rounded-2xl p-4 
        bg-gradient-to-r ${colorClasses[color]} text-white
        cursor-pointer shadow-soft
      `}
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      {/* Close Button */}
      {onClose && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="absolute top-2 right-2 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors z-10"
        >
          <X size={14} />
        </button>
      )}
      
      {/* Content */}
      <div className="relative flex items-center gap-4">
        {image && (
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            {image}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white leading-tight">{title}</h3>
          {subtitle && (
            <p className="text-white/80 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        <ChevronRight size={24} className="text-white/60 flex-shrink-0" />
      </div>
    </motion.div>
  )
}

/**
 * BannerCarousel - Swipeable banner carousel
 */
export const BannerCarousel = ({ children, autoPlay = true, interval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  
  React.useEffect(() => {
    if (!autoPlay) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % React.Children.count(children))
    }, interval)
    return () => clearInterval(timer)
  }, [autoPlay, interval, children])
  
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl">
        <motion.div
          animate={{ x: `-${currentIndex * 100}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="flex"
        >
          {React.Children.map(children, (child, index) => (
            <div key={index} className="w-full flex-shrink-0 px-1">
              {child}
            </div>
          ))}
        </motion.div>
      </div>
      
      {/* Indicators */}
      {React.Children.count(children) > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {React.Children.map(children, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`
                w-2 h-2 rounded-full transition-all
                ${index === currentIndex ? 'bg-primary w-6' : 'bg-slate-300'}
              `}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Banner
