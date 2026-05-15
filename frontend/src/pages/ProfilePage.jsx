import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ChevronLeft, User, Mail, Phone, Lock, Shield, 
  HelpCircle, LogOut, ChevronRight, Edit3, Camera 
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import Button from '../components/ui/Button'
import BottomSheet from '../components/ui/BottomSheet'
import Input from '../components/ui/Input'

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user, logout, updateUser } = useAuthStore()
  
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const handleSaveProfile = async () => {
    // Would call API to update profile
    updateUser({
      fullName: editForm.fullName,
      email: editForm.email,
      phone: editForm.phone,
    })
    setShowEditSheet(false)
  }

  const menuItems = [
    { icon: Edit3, label: 'Edit Profile', action: () => setShowEditSheet(true) },
    { icon: Lock, label: 'Change Password', action: () => navigate('/change-password') },
    { icon: Shield, label: 'Change PIN', action: () => navigate('/change-pin') },
    { icon: HelpCircle, label: 'Help & Support', action: () => navigate('/help') },
    { icon: LogOut, label: 'Logout', action: () => setShowLogoutConfirm(true), danger: true },
  ]

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft size={28} className="text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Profile</h1>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 mb-6"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary">{getInitials(user?.fullName)}</span>
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Camera size={14} className="text-white" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.fullName}</h2>
            <p className="text-white/60">@{user?.username}</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3 text-white/80">
            <Mail size={18} className="text-white/40" />
            <span>{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <Phone size={18} className="text-white/40" />
            <span>{user?.phone}</span>
          </div>
        </div>
      </motion.div>

      {/* Menu Items */}
      <div className="space-y-2">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={item.action}
            className={`w-full glass-card-hover p-4 flex items-center justify-between ${
              item.danger ? 'hover:bg-error/10' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <item.icon size={20} className={item.danger ? 'text-error' : 'text-white/60'} />
              <span className={item.danger ? 'text-error' : 'text-white'}>{item.label}</span>
            </div>
            <ChevronRight size={20} className="text-white/40" />
          </motion.button>
        ))}
      </div>

      {/* Version */}
      <p className="text-center text-white/30 text-sm mt-8">PayFlow v1.0.0</p>

      {/* Edit Profile Sheet */}
      <BottomSheet
        isOpen={showEditSheet}
        onClose={() => setShowEditSheet(false)}
        title="Edit Profile"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">Full Name</label>
            <input
              type="text"
              value={editForm.fullName}
              onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
              className="w-full bg-white/10 rounded-xl px-4 py-4 text-white border border-white/10 focus:outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">Email</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full bg-white/10 rounded-xl px-4 py-4 text-white border border-white/10 focus:outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">Phone</label>
            <input
              type="tel"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="w-full bg-white/10 rounded-xl px-4 py-4 text-white border border-white/10 focus:outline-none focus:border-primary/50"
            />
          </div>
          <Button onClick={handleSaveProfile}>Save Changes</Button>
        </div>
      </BottomSheet>

      {/* Logout Confirmation Sheet */}
      <BottomSheet
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Logout"
      >
        <p className="text-white/60 text-center mb-6">
          Are you sure you want to logout?
        </p>
        <Button variant="danger" onClick={handleLogout}>
          Yes, Logout
        </Button>
        <Button variant="ghost" onClick={() => setShowLogoutConfirm(false)} className="mt-2">
          Cancel
        </Button>
      </BottomSheet>
    </div>
  )
}

export default ProfilePage
