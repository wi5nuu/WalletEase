import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Receipt, 
  QrCode, 
  Bell, 
  User,
  Wallet,
  Smartphone,
  CreditCard,
  ChevronRight,
  Sparkles,
  Gift,
  TrendingUp
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useWalletStore } from '../stores/walletStore'
import { useNotificationStore } from '../stores/notificationStore'
import { formatCurrency, getGreeting } from '../services/formatters'
import BalanceCard from '../components/ui/BalanceCard'
import QuickAction, { QuickActionGroup } from '../components/ui/QuickAction'
import TransactionItem from '../components/ui/TransactionItem'
import Banner, { BannerCarousel } from '../components/ui/Banner'
import Card, { CardContent, CardHeader } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { SkeletonList } from '../components/ui/Skeleton'

/**
 * HomePage - Professional Banking Dashboard
 * Similar to myBCA, BRImo, Livin' by Mandiri
 * Features: Balance card, quick actions, banners, recent transactions
 */
const HomePage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { 
    balance, 
    fetchWalletDetails, 
    fetchRecentTransactions, 
    recentTransactions,
    isLoading 
  } = useWalletStore()
  const { unreadCount, fetchUnreadCount } = useNotificationStore()
  
  const [banners] = useState([
    {
      id: 1,
      title: 'Cashback 10%',
      subtitle: 'Top up Rp 100.000+ get cashback',
      color: 'orange',
    },
    {
      id: 2,
      title: 'Free Transfer',
      subtitle: 'No admin fee for first 5 transfers',
      color: 'blue',
    },
    {
      id: 3,
      title: 'QRIS Promo',
      subtitle: 'Discount up to 30% at selected merchants',
      color: 'green',
    },
  ])

  useEffect(() => {
    fetchWalletDetails()
    fetchRecentTransactions(5)
    fetchUnreadCount()
  }, [])

  const handleTransactionClick = (transaction) => {
    navigate(`/transaction/${transaction.id}`, { state: { transaction } })
  }

  return (
    <div className="min-h-full bg-background bg-pattern pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-[430px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <p className="text-slate-500 text-xs">{getGreeting()}</p>
              <p className="text-slate-900 font-semibold text-sm">
                {user?.fullName?.split(' ')[0] || 'User'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/notifications')}
            className="relative p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Bell size={20} className="text-slate-700" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-[430px] mx-auto px-4 py-6 space-y-6">
        {/* Balance Card */}
        <BalanceCard
          balance={balance}
          accountNumber={user?.id?.slice(-8) || '12345678'}
          accountName={user?.fullName}
          onTopUp={() => navigate('/topup')}
          onTransfer={() => navigate('/transfer')}
          isLoading={isLoading}
        />

        {/* Quick Actions */}
        <section>
          <h2 className="text-slate-900 font-bold text-base mb-4">Quick Actions</h2>
          <QuickActionGroup>
            <QuickAction
              icon={ArrowUpRight}
              label="Top Up"
              to="/topup"
              variant="default"
              color="green"
            />
            <QuickAction
              icon={ArrowDownLeft}
              label="Transfer"
              to="/transfer"
              variant="default"
              color="blue"
            />
            <QuickAction
              icon={QrCode}
              label="QRIS"
              to="/qr"
              variant="default"
              color="purple"
            />
            <QuickAction
              icon={Receipt}
              label="Bills"
              to="/bills"
              variant="default"
              color="orange"
            />
          </QuickActionGroup>
        </section>

        {/* More Actions */}
        <Card variant="default">
          <CardContent padding="small">
            <div className="grid grid-cols-4 gap-2">
              <QuickAction
                icon={CreditCard}
                label="Virtual Account"
                to="/virtual-account"
                variant="ghost"
                size="sm"
              />
              <QuickAction
                icon={Smartphone}
                label="E-Wallet"
                to="/ewallet"
                variant="ghost"
                size="sm"
              />
              <QuickAction
                icon={Gift}
                label="Rewards"
                to="/rewards"
                variant="ghost"
                size="sm"
              />
              <QuickAction
                icon={TrendingUp}
                label="Invest"
                to="/invest"
                variant="ghost"
                size="sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Promotional Banners */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-slate-900 font-bold text-base">Promotions</h2>
            <button 
              onClick={() => navigate('/promotions')}
              className="text-primary text-sm font-medium flex items-center gap-0.5"
            >
              See all <ChevronRight size={16} />
            </button>
          </div>
          <BannerCarousel autoPlay={true} interval={4000}>
            {banners.map((banner) => (
              <Banner
                key={banner.id}
                title={banner.title}
                subtitle={banner.subtitle}
                color={banner.color}
                onPress={() => navigate('/promotions')}
              />
            ))}
          </BannerCarousel>
        </section>

        {/* Recent Transactions */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-slate-900 font-bold text-base">Recent Transactions</h2>
            <button 
              onClick={() => navigate('/history')}
              className="text-primary text-sm font-medium flex items-center gap-0.5"
            >
              See all <ChevronRight size={16} />
            </button>
          </div>

          {isLoading ? (
            <SkeletonList count={3} />
          ) : recentTransactions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Wallet size={28} className="text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm">No transactions yet</p>
                <p className="text-slate-400 text-xs mt-1">Start by making your first top-up!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentTransactions.slice(0, 5).map((tx, index) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  onClick={handleTransactionClick}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>

        {/* Upgrade Banner */}
        <Card variant="gradient-orange" className="overflow-hidden">
          <CardContent className="relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold">Upgrade to Premium</p>
                <p className="text-white/80 text-sm">Get higher limits & cashback</p>
              </div>
              <button className="px-3 py-1.5 bg-white text-secondary text-sm font-semibold rounded-lg hover:bg-white/90 transition-colors">
                Upgrade
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default HomePage
