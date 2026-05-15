import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Users, ArrowUpRight, ArrowDownRight, DollarSign, Activity } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { formatCurrency, formatNumber } from '../services/formatters'
import api from '../services/api'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalVolume: 0,
    todayVolume: 0,
  })
  const [dailyVolume, setDailyVolume] = useState([])
  const [users, setUsers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // Fetch analytics
      const summaryRes = await api.get('/admin/analytics/summary')
      setStats(summaryRes.data.data)

      // Fetch daily volume
      const dailyRes = await api.get('/admin/analytics/daily-volume?days=30')
      setDailyVolume(dailyRes.data.data.map(d => ({
        date: d.date.slice(5), // MM-DD
        volume: d.volume / 1000000, // Convert to millions
      })))

      // Fetch users
      const usersRes = await api.get('/admin/users?page=0&size=10')
      setUsers(usersRes.data.data.content)

      // Fetch transactions
      const txRes = await api.get('/admin/transactions?page=0&size=10')
      setTransactions(txRes.data.data.content)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
    setIsLoading(false)
  }

  const statCards = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers, 
      icon: Users, 
      color: 'bg-blue-500/20 text-blue-400',
      change: '+12%'
    },
    { 
      title: 'Transactions', 
      value: stats.totalTransactions, 
      icon: Activity, 
      color: 'bg-success/20 text-success',
      change: '+8%'
    },
    { 
      title: 'Total Volume', 
      value: formatCurrency(stats.totalVolume), 
      icon: DollarSign, 
      color: 'bg-warning/20 text-warning',
      change: '+15%'
    },
    { 
      title: "Today's Volume", 
      value: formatCurrency(stats.todayVolume), 
      icon: ArrowUpRight, 
      color: 'bg-purple-500/20 text-purple-400',
      change: '+5%'
    },
  ]

  return (
    <div className="page-container pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/home')} className="p-2 -ml-2">
          <ChevronLeft size={28} className="text-white" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm text-white/50">Welcome, {user?.fullName}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-4"
          >
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-white/60">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-4 mb-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Daily Transaction Volume (Millions IDR)</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a2e', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
                itemStyle={{ color: '#2563EB' }}
              />
              <Bar dataKey="volume" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex bg-white/5 rounded-xl p-1 mb-4">
        {['overview', 'users', 'transactions'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-primary text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Users Table */}
      {activeTab === 'users' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card overflow-hidden"
        >
          <div className="p-4 border-b border-white/10">
            <h3 className="font-semibold text-white">Recent Users</h3>
          </div>
          <div className="divide-y divide-white/10">
            {users.map((user) => (
              <div key={user.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{user.fullName}</p>
                  <p className="text-sm text-white/50">@{user.username}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  user.role === 'ROLE_ADMIN' 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-white/10 text-white/60'
                }`}>
                  {user.role.replace('ROLE_', '')}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Transactions Table */}
      {activeTab === 'transactions' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card overflow-hidden"
        >
          <div className="p-4 border-b border-white/10">
            <h3 className="font-semibold text-white">Recent Transactions</h3>
          </div>
          <div className="divide-y divide-white/10">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{tx.type}</p>
                    <p className="text-sm text-white/50">{tx.referenceCode}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{formatCurrency(tx.amount)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      tx.status === 'COMPLETED' 
                        ? 'bg-success/20 text-success' 
                        : tx.status === 'PENDING'
                        ? 'bg-warning/20 text-warning'
                        : 'bg-error/20 text-error'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default AdminDashboard
