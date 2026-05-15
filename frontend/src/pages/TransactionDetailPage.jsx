import React, { useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ChevronLeft, 
  Share2, 
  Download, 
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Wallet,
  QrCode,
  User,
  Building2,
  Copy,
  Check
} from 'lucide-react'
import { formatCurrency, formatDateTime, formatDate } from '../services/formatters'
import Card, { CardContent, CardHeader } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Logo from '../components/ui/Logo'

/**
 * TransactionDetailPage - Transaction receipt and details
 * Similar to BRImo/myBCA transaction receipt
 * Features: Share, download, print receipt
 */
const TransactionDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const receiptRef = useRef(null)
  
  // Get transaction from location state or fetch by ID
  const transaction = location.state?.transaction || {
    id: id || 'TX123456',
    type: 'TRANSFER',
    direction: 'OUT',
    amount: 150000,
    status: 'COMPLETED',
    createdAt: new Date().toISOString(),
    description: 'Dinner payment',
    referenceCode: 'REF20240115001',
    sender: { fullName: 'John Doe', username: 'johndoe' },
    receiver: { fullName: 'Jane Smith', username: 'janesmith' },
    fee: 0,
  }

  const [copied, setCopied] = React.useState(false)

  const handleCopyRef = () => {
    navigator.clipboard.writeText(transaction.referenceCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    const shareData = {
      title: 'Transaction Receipt',
      text: `${transaction.type} - ${formatCurrency(transaction.amount)}\nRef: ${transaction.referenceCode}`,
    }
    
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.text)
      alert('Receipt copied to clipboard!')
    }
  }

  const handleDownload = () => {
    // In real app, would generate PDF
    alert('Downloading receipt as PDF...')
  }

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'COMPLETED':
        return <CheckCircle2 size={48} className="text-green-500" />
      case 'FAILED':
        return <XCircle size={48} className="text-red-500" />
      case 'PENDING':
        return <Clock size={48} className="text-amber-500" />
      default:
        return <CheckCircle2 size={48} className="text-green-500" />
    }
  }

  const getTypeIcon = () => {
    const iconProps = { size: 20, className: 'text-white' }
    switch (transaction.type) {
      case 'TOP_UP':
        return <Wallet {...iconProps} />
      case 'TRANSFER':
        return transaction.direction === 'IN' ? <ArrowDownLeft {...iconProps} /> : <ArrowUpRight {...iconProps} />
      case 'BILL_PAYMENT':
        return <Receipt {...iconProps} />
      case 'QRIS':
        return <QrCode {...iconProps} />
      default:
        return <Receipt {...iconProps} />
    }
  }

  const getTypeColor = () => {
    switch (transaction.type) {
      case 'TOP_UP':
        return 'bg-green-500'
      case 'TRANSFER':
        return transaction.direction === 'IN' ? 'bg-green-500' : 'bg-primary'
      case 'BILL_PAYMENT':
        return 'bg-secondary'
      case 'QRIS':
        return 'bg-purple-500'
      default:
        return 'bg-slate-500'
    }
  }

  return (
    <div className="min-h-full bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="max-w-[430px] mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ChevronLeft size={24} className="text-slate-700" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">Transaction Details</h1>
          <button 
            onClick={handleShare}
            className="p-2 -mr-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Share2 size={20} className="text-slate-700" />
          </button>
        </div>
      </header>

      <div className="max-w-[430px] mx-auto px-4 py-6">
        {/* Receipt Card */}
        <div ref={receiptRef} className="bg-white rounded-2xl shadow-card overflow-hidden">
          {/* Receipt Header */}
          <div className="bg-slate-50 border-b border-border p-6 text-center">
            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3">
              {getStatusIcon()}
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              {transaction.status === 'COMPLETED' ? 'Transaction Successful' : 
               transaction.status === 'FAILED' ? 'Transaction Failed' : 'Processing'}
            </h2>
            <p className="text-slate-500 text-sm">
              {formatDateTime(transaction.createdAt)}
            </p>
          </div>

          {/* Receipt Body */}
          <div className="p-6">
            {/* Amount */}
            <div className="text-center mb-6">
              <p className="text-slate-500 text-sm mb-1">
                {transaction.type === 'TOP_UP' ? 'Top Up Amount' :
                 transaction.type === 'TRANSFER' && transaction.direction === 'IN' ? 'Amount Received' :
                 transaction.type === 'TRANSFER' ? 'Amount Sent' :
                 transaction.type === 'BILL_PAYMENT' ? 'Bill Payment' : 'Amount'}
              </p>
              <p className={`text-3xl font-bold ${
                transaction.direction === 'IN' || transaction.type === 'TOP_UP' ? 'text-green-600' : 'text-slate-900'
              }`}>
                {transaction.direction === 'IN' || transaction.type === 'TOP_UP' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-border my-6 relative">
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-4 h-4 bg-background rounded-full" />
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-4 h-4 bg-background rounded-full" />
            </div>

            {/* Transaction Details */}
            <div className="space-y-4">
              {/* Reference Number */}
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Reference Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-slate-900">{transaction.referenceCode}</span>
                  <button
                    onClick={handleCopyRef}
                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                  >
                    {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-slate-400" />}
                  </button>
                </div>
              </div>

              {/* Transaction ID */}
              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">Transaction ID</span>
                <span className="font-mono text-sm text-slate-900">{transaction.id}</span>
              </div>

              {/* Type */}
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Transaction Type</span>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 ${getTypeColor()} rounded-lg flex items-center justify-center`}>
                    {getTypeIcon()}
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {transaction.type.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Status</span>
                <Badge 
                  variant={transaction.status === 'COMPLETED' ? 'success' : 
                          transaction.status === 'FAILED' ? 'error' : 'warning'}
                  size="sm"
                  dot
                >
                  {transaction.status}
                </Badge>
              </div>

              {/* Sender/Receiver Info */}
              {transaction.type === 'TRANSFER' && (
                <>
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-sm">
                        {transaction.direction === 'IN' ? 'From' : 'To'}
                      </span>
                      <div className="text-right">
                        <p className="font-medium text-slate-900 text-sm">
                          {transaction.direction === 'IN' 
                            ? transaction.sender?.fullName 
                            : transaction.receiver?.fullName}
                        </p>
                        <p className="text-slate-400 text-xs">
                          @{transaction.direction === 'IN' 
                            ? transaction.sender?.username 
                            : transaction.receiver?.username}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Description */}
              {transaction.description && (
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Description</span>
                    <span className="text-sm text-slate-900 text-right max-w-[60%]">
                      {transaction.description}
                    </span>
                  </div>
                </div>
              )}

              {/* Fee */}
              <div className="border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Admin Fee</span>
                  <span className="text-sm text-slate-900">
                    {transaction.fee ? formatCurrency(transaction.fee) : 'FREE'}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t-2 border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="font-bold text-lg text-slate-900">
                    {formatCurrency(transaction.amount + (transaction.fee || 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t border-border p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-slate-900">PayFlow</span>
            </div>
            <p className="text-slate-400 text-xs">
              This is an official receipt from PayFlow
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <Button 
            variant="secondary" 
            onClick={handleDownload}
            className="flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Download
          </Button>
          <Button 
            onClick={handleShare}
            className="flex items-center justify-center gap-2"
          >
            <Share2 size={18} />
            Share
          </Button>
        </div>

        {/* Help Section */}
        <Card variant="default" className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Need Help?</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  If you have any issues with this transaction, please contact our support team.
                </p>
                <button 
                  onClick={() => navigate('/help')}
                  className="text-primary text-sm font-medium mt-2 hover:underline"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TransactionDetailPage
