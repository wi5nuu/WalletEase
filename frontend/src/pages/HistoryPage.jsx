import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, Receipt, Filter, Calendar } from 'lucide-react'
import { useWalletStore } from '../stores/walletStore'
import { formatCurrency, formatDate, formatDateTime } from '../services/formatters'
import { SkeletonList } from '../components/ui/Skeleton'

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'IN', label: 'In' },
  { value: 'OUT', label: 'Out' },
  { value: 'BILL_PAYMENT', label: 'Bills' },
]

const HistoryPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { transactions, fetchTransactionHistory, isLoading } = useWalletStore()
  
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const observerRef = useRef()

  const loadTransactions = useCallback(async (pageNum, reset = false) => {
    const filters = {}
    if (filter && filter !== 'IN' && filter !== 'OUT') {
      filters.type = filter
    }
    if (dateRange.start && dateRange.end) {
      filters.startDate = dateRange.start
      filters.endDate = dateRange.end
    }
    
    const result = await fetchTransactionHistory(pageNum, 10, filters)
    if (result) {
      setHasMore(!result.last)
    }
  }, [filter, dateRange])

  useEffect(() => {
    loadTransactions(0, true)
  }, [filter, dateRange])

  // Infinite scroll
  const lastElementRef = useCallback((node) => {
    if (isLoading) return
    if (observerRef.current) observerRef.current.disconnect()
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1)
        loadTransactions(page + 1)
      }
    })
    
    if (node) observerRef.current.observe(node)
  }, [isLoading, hasMore, page])

  const getTransactionIcon = (type, direction) => {
    if (type === 'TOP_UP') return <ArrowUpRight size={20} className="text-success" />
    if (type === 'BILL_PAYMENT') return <Receipt size={20} className="text-warning" />
    if (direction === 'IN') return <ArrowDownLeft size={20} className="text-success" />
    return <ArrowUpRight size={20} className="text-error" />
  }

  const getTransactionColor = (type, direction) => {
    if (type === 'TOP_UP' || direction === 'IN') return 'text-success'
    if (type === 'BILL_PAYMENT') return 'text-white'
    return 'text-white'
  }

  const getTransactionSign = (type, direction) => {
    if (type === 'TOP_UP' || direction === 'IN') return '+'
    return '-'
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft size={28} className="text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Transaction History</h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.value
                ? 'bg-primary text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      {isLoading && transactions.length === 0 ? (
        <SkeletonList count={5} />
      ) : (
        <div className="space-y-3">
          {transactions
            .filter(tx => !filter || filter === 'IN' || filter === 'OUT' ? true : tx.type === filter)
            .filter(tx => {
              if (filter === 'IN') return tx.direction === 'IN' || tx.type === 'TOP_UP'
              if (filter === 'OUT') return tx.direction === 'OUT' && tx.type !== 'TOP_UP'
              return true
            })
            .map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedTransaction(tx)}
              ref={index === transactions.length - 1 ? lastElementRef : null}
              className="glass-card-hover p-4 flex items-center gap-4 cursor-pointer"
            >
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                {getTransactionIcon(tx.type, tx.direction)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">
                  {tx.type === 'TOP_UP' ? 'Top Up' : 
                   tx.type === 'BILL_PAYMENT' ? tx.description?.split(' - ')[0] || 'Bill Payment' :
                   tx.direction === 'IN' ? (tx.sender?.fullName || 'Received') : (tx.receiver?.fullName || 'Sent')}
                </p>
                <p className="text-sm text-white/50">{formatDate(tx.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${getTransactionColor(tx.type, tx.direction)}`}>
                  {getTransactionSign(tx.type, tx.direction)}{formatCurrency(tx.amount)}
                </p>
                <p className="text-xs text-white/40">{tx.status}</p>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <div className="flex justify-center py-4">
              <div className="w-8 h-8 border-2 border-white/20 border-t-primary rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end"
          onClick={() => setSelectedTransaction(null)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            onClick={e => e.stopPropagation()}
            className="bg-background w-full max-w-[430px] mx-auto rounded-t-3xl p-6"
          >
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
            
            <div className="text-center mb-6">
              <div className={`text-3xl font-bold mb-1 ${getTransactionColor(selectedTransaction.type, selectedTransaction.direction)}`}>
                {getTransactionSign(selectedTransaction.type, selectedTransaction.direction)}{formatCurrency(selectedTransaction.amount)}
              </div>
              <p className="text-white/60">{selectedTransaction.status}</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/60">Transaction Type</span>
                <span className="text-white">{selectedTransaction.type}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/60">Reference Code</span>
                <span className="text-white font-mono text-sm">{selectedTransaction.referenceCode}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/60">Date & Time</span>
                <span className="text-white">{formatDateTime(selectedTransaction.createdAt)}</span>
              </div>
              {selectedTransaction.description && (
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60">Description</span>
                  <span className="text-white text-right max-w-[60%]">{selectedTransaction.description}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedTransaction(null)}
              className="w-full mt-6 py-4 bg-white/10 rounded-xl text-white font-medium"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default HistoryPage
