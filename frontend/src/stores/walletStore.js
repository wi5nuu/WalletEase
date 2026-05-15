import { create } from 'zustand'
import api from '../services/api'

export const useWalletStore = create((set, get) => ({
  // State
  wallet: null,
  balance: 0,
  transactions: [],
  recentTransactions: [],
  isLoading: false,
  error: null,
  qrCode: null,

  // Actions
  clearError: () => set({ error: null }),

  fetchWalletDetails: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get('/wallet/details')
      const walletData = response.data.data
      set({
        wallet: walletData,
        balance: walletData.balance,
        isLoading: false,
      })
      return walletData
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch wallet',
        isLoading: false,
      })
      return null
    }
  },

  fetchBalance: async () => {
    try {
      const response = await api.get('/wallet/balance')
      set({ balance: response.data.data })
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch balance:', error)
      return null
    }
  },

  generateQrCode: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get('/wallet/qr-code')
      set({
        qrCode: response.data.data,
        isLoading: false,
      })
      return response.data.data
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to generate QR code',
        isLoading: false,
      })
      return null
    }
  },

  fetchTransactionHistory: async (page = 0, size = 10, filters = {}) => {
    set({ isLoading: true, error: null })
    try {
      const params = { page, size, ...filters }
      const response = await api.get('/transactions', { params })
      const pageData = response.data.data
      
      if (page === 0) {
        set({ transactions: pageData.content })
      } else {
        set((state) => ({
          transactions: [...state.transactions, ...pageData.content],
        }))
      }
      
      set({ isLoading: false })
      return pageData
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch transactions',
        isLoading: false,
      })
      return null
    }
  },

  fetchRecentTransactions: async (limit = 5) => {
    try {
      const response = await api.get('/transactions/recent', { params: { limit } })
      set({ recentTransactions: response.data.data })
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch recent transactions:', error)
      return []
    }
  },

  topUp: async (amount, pin) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.post('/transactions/topup', { amount, pin })
      set({ isLoading: false })
      return { success: true, data: response.data.data }
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Top-up failed',
        isLoading: false,
      })
      return { success: false }
    }
  },

  transfer: async (recipient, amount, pin, description = '') => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.post('/transactions/transfer', {
        recipient,
        amount,
        pin,
        description,
      })
      set({ isLoading: false })
      return { success: true, data: response.data.data }
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Transfer failed',
        isLoading: false,
      })
      return { success: false }
    }
  },

  payBill: async (billId, customerId, amount, pin) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.post('/transactions/pay-bill', {
        billId,
        customerId,
        amount,
        pin,
      })
      set({ isLoading: false })
      return { success: true, data: response.data.data }
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Bill payment failed',
        isLoading: false,
      })
      return { success: false }
    }
  },

  scanQrPayment: async (recipientWalletId, amount, pin, description = '') => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.post('/transactions/scan-qr', {
        recipientWalletId,
        amount,
        pin,
        description,
      })
      set({ isLoading: false })
      return { success: true, data: response.data.data }
    } catch (error) {
      set({
        error: error.response?.data?.message || 'QR payment failed',
        isLoading: false,
      })
      return { success: false }
    }
  },

  updateBalance: (newBalance) => {
    set({ balance: newBalance })
  },
}))
