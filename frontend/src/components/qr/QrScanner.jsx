import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { X, Flashlight, Image as ImageIcon, Scan, AlertCircle } from 'lucide-react'

/**
 * QrScanner Component - QR code scanner interface
 * Similar to BRImo/myBCA QRIS scan
 */
const QrScanner = ({ onScan, onClose, onError }) => {
  const videoRef = useRef(null)
  const [hasPermission, setHasPermission] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [flashlightOn, setFlashlightOn] = useState(false)
  const [scanError, setScanError] = useState(null)

  useEffect(() => {
    // In a real app, this would use the camera API
    // For now, we'll simulate the scanner interface
    setHasPermission(true)
    setIsScanning(true)

    return () => {
      // Cleanup camera stream
    }
  }, [])

  const handleSimulateScan = () => {
    // Simulate a successful scan
    onScan?.({
      type: 'QRIS_PAYMENT',
      merchantName: 'Test Merchant',
      merchantId: 'TEST123',
      amount: 50000,
    })
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Process QR code from image
      handleSimulateScan()
    }
  }

  if (hasPermission === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (hasPermission === false) {
    return (
      <div className="text-center p-8">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <p className="text-slate-900 font-semibold mb-2">Camera Access Required</p>
        <p className="text-slate-500 text-sm mb-4">
          Please allow camera access to scan QR codes
        </p>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-primary text-white rounded-xl font-medium"
        >
          Close
        </button>
      </div>
    )
  }

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden">
      {/* Scanner Viewport */}
      <div className="relative aspect-[3/4] bg-slate-900">
        {/* Camera Preview (simulated) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/50 text-sm">Camera Preview</p>
        </div>

        {/* Scan Frame */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-64 h-64">
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-primary rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-primary rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-primary rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-primary rounded-br-lg" />

            {/* Scan Line Animation */}
            {isScanning && (
              <motion.div
                className="absolute left-0 right-0 h-0.5 bg-primary shadow-glow"
                animate={{
                  top: ['0%', '100%', '0%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            )}

            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white/70 text-xs text-center">
                Align QR code within frame
              </p>
            </div>
          </div>
        </div>

        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <button
            onClick={onClose}
            className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
          >
            <X size={20} />
          </button>
          <p className="text-white font-medium">Scan QR Code</p>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-8 left-4 right-4">
          <div className="flex items-center justify-center gap-6">
            {/* Flashlight */}
            <button
              onClick={() => setFlashlightOn(!flashlightOn)}
              className={`
                w-14 h-14 rounded-full flex items-center justify-center transition-colors
                ${flashlightOn ? 'bg-primary text-white' : 'bg-white/20 backdrop-blur-sm text-white'}
              `}
            >
              <Flashlight size={24} />
            </button>

            {/* Simulate Scan Button (for demo) */}
            <button
              onClick={handleSimulateScan}
              className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-glow"
            >
              <Scan size={32} className="text-white" />
            </button>

            {/* Gallery Upload */}
            <label className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer">
              <ImageIcon size={24} className="text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white p-4 rounded-t-2xl -mt-4 relative z-10">
        <p className="text-center text-slate-600 text-sm">
          Point your camera at a QRIS code to pay
        </p>
      </div>
    </div>
  )
}

export default QrScanner
