import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

/**
 * StatCard Component - Admin dashboard statistics card
 * For admin dashboard analytics
 */
const StatCard = ({ 
  title, 
  value, 
  change,
  changeType = 'neutral', // positive, negative, neutral
  icon: Icon,
  color = 'blue',
  index = 0
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  const changeIcons = {
    positive: <ArrowUpRight size={16} className="text-green-600" />,
    negative: <ArrowDownRight size={16} className="text-red-600" />,
    neutral: <Minus size={16} className="text-slate-400" />,
  }

  const changeColors = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-slate-600 bg-slate-100',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white border border-border rounded-xl p-5 hover:shadow-card transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          {Icon && <Icon size={20} />}
        </div>
      </div>

      {change && (
        <div className="flex items-center gap-2 mt-3">
          <div className={`flex items-center gap-0.5 px-2 py-1 rounded-full ${changeColors[changeType]}`}>
            {changeIcons[changeType]}
            <span className="text-xs font-medium">{change}</span>
          </div>
          <span className="text-slate-400 text-xs">vs last month</span>
        </div>
      )}
    </motion.div>
  )
}

/**
 * MiniStatCard - Compact stat for smaller spaces
 */
export const MiniStatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="bg-white border border-border rounded-xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
        {Icon && <Icon size={20} />}
      </div>
      <div>
        <p className="text-xs text-slate-500">{title}</p>
        <p className="text-lg font-bold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

export default StatCard
