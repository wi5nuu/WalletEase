import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, QrCode, Camera, Download, X } from 'lucide-react'
import { useWalletStore } from '../stores/walletStore'
import { QRCodeSVG } from 'qrcode.react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import Button from '../components/ui/Button'
import BottomSheet from '../components/ui/BottomSheet'
import PinInput from '../components/ui/PinInput'
import { formatCurrency } from '../services/formatters'

const QrPage = () => {
  const navigate = useNavigate()
  const { generateQrCode, scanQrPayment, wallet, fetchWalletDetails } = useWalletStore()
  
  const [activeTab, setActiveTab] = useState('myqr') // 'myqr' | 'scan'
  const [qrData, setQrData] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const [scanError, setScanError] = useState('')
  const [amount, setAmount] = useState('')
  const [showPaymentSheet, setShowPaymentSheet] = useState(false)
  const [showPinSheet, setShowPinSheet] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const scannerRef = useRef(null)

  useEffect(() => {
    fetchWalletDetails()
    generateQrCode().then(data => setQrData(data))
  }, [])

  useEffect(() => {
    if (activeTab === 'scan' && !scanResult) {
      const scanner = new Html5QrcodeScanner('reader', {
        qrbox: { width: 250, height: 250 },
        fps: 10,
      }, false)

      scanner.render(
        (decodedText) => {
          handleScan(decodedText)
          scanner.clear()
        },
        (errorMessage) => {
          // Silent error - scanning continuously
        }
      )

      return () => {
        scanner.clear().catch(console.error)
      }
    }
  }, [activeTab, scanResult])

  const handleScan = (data) => {
    try {
      // Parse QR data - should contain wallet ID
      setScanResult({ walletId: data, name: 'Scanned User' })
      setShowPaymentSheet(true)
    } catch (error) {
      setScanError('Invalid QR code')
    }
  }

  const handlePayment = () => {
    const numAmount = parseInt(amount)
    if (!numAmount || numAmount < 1000) {
      setError('Minimum amount is Rp 1.000')
      return
    }
    setShowPaymentSheet(false)
    setTimeout(() => setShowPinSheet(true), 300)
  }

  const handlePinComplete = async (pin) => {
    const result = await scanQrPayment(scanResult.walletId, parseInt(amount), pin, 'QR Payment')
    
    if (result.success) {
      setSuccess(true)
      setShowPinSheet(false)
      setTimeout(() => {
        setSuccess(false)
        setScanResult(null)
        setAmount('')
        setActiveTab('myqr')
      }, 2000)
    } else {
      setError(result.error || 'Payment failed')
      setShowPinSheet(false)
    }
  }

  const handleDownloadQR = () => {
    const svg = document.querySelector('#my-qr-code svg')
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        const pngFile = canvas.toDataURL('image/png')
        const downloadLink = document.createElement('a')
        downloadLink.download = 'payflow-qr-code.png'
        downloadLink.href = pngFile
        downloadLink.click()
      }
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    }
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft size={28} className="text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">QR Payment</h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/5 rounded-xl p-1 mb-6">
        {['myqr', 'scan'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab)
              setScanResult(null)
              setError('')
            }}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-primary text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {tab === 'myqr' ? 'My QR' : 'Scan QR'}
          </button>
        ))}
      </div>

      {success ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center justify-center h-[60vh]"
        >
          <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mb-4">
            <QrCode size={48} className="text-success" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
          <p className="text-white/60">Your QR payment is complete</p>
        </motion.div>
      ) : activeTab === 'myqr' ? (
        <div className="flex flex-col items-center">
          <p className="text-white/60 text-center mb-6">
            Show this QR code to receive payments
          </p>
          
          {qrData && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-6 rounded-2xl mb-6"
              id="my-qr-code"
            >
              <QRCodeSVG value={qrData} size={200} level="H" />
            </motion.div>
          )}

          <Button variant="secondary" onClick={handleDownloadQR} className="w-auto px-6">
            <Download size={20} className="mr-2" />
            Save to Gallery
          </Button>

          <p className="mt-6 text-sm text-white/40 text-center">
            Wallet ID: {wallet?.id?.slice(0, 8)}...{wallet?.id?.slice(-8)}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {!scanResult ? (
            <>
              <p className="text-white/60 text-center mb-4">
                Point your camera at a PayFlow QR code
              </p>
              <div id="reader" className="w-full max-w-sm overflow-hidden rounded-xl" />
              {scanError && (
                <p className="mt-4 text-error text-sm">{scanError}</p>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* Payment Sheet */}
      <BottomSheet
        isOpen={showPaymentSheet}
        onClose={() => {
          setShowPaymentSheet(false)
          setScanResult(null)
        }}
        title="Send Money"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <QrCode size={32} className="text-primary" />
          </div>
          <p className="text-white font-medium">Pay to QR</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-white/60 mb-2">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg">Rp</span>
            <input
              type="text"
              value={amount ? formatCurrency(amount).replace('Rp ', '') : ''}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="0"
              className="w-full bg-white/10 rounded-xl pl-12 pr-4 py-5 text-3xl font-bold text-white placeholder-white/20 border border-white/10 focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>

        {error && <p className="text-error text-sm mb-4">{error}</p>}

        <Button onClick={handlePayment} disabled={!amount || parseInt(amount) < 1000}>
          Continue
        </Button>
      </BottomSheet>

      {/* PIN Sheet */}
      <BottomSheet
        isOpen={showPinSheet}
        onClose={() => setShowPinSheet(false)}
        title="Enter Transaction PIN"
      >
        <p className="text-center text-white/60 mb-4">
          Confirm payment of {formatCurrency(amount)}
        </p>
        <PinInput length={6} onComplete={handlePinComplete} error={error} />
      </BottomSheet>
    </div>
  )
}

export default QrPage
