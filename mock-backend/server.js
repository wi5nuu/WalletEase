/**
 * PayFlow Mock Backend Server
 * Mimics the Spring Boot API for frontend testing
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 8081;
const JWT_SECRET = 'mock-secret-key-for-development-only';

// In-memory data stores
const users = new Map();
const wallets = new Map();
const transactions = new Map();
const refreshTokens = new Set();
const notifications = new Map();

// Seed admin user
const adminId = uuidv4();
users.set('admin', {
  id: adminId,
  username: 'admin',
  email: 'admin@payflow.com',
  phone: '081234567890',
  fullName: 'Admin User',
  passwordHash: bcrypt.hashSync('Admin123!', 10),
  role: 'ROLE_ADMIN',
  isActive: true,
  createdAt: new Date()
});
wallets.set(adminId, {
  id: uuidv4(),
  userId: adminId,
  balance: 10000000,
  currency: 'IDR'
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Access token required',
      timestamp: new Date().toISOString()
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        status: 'error',
        message: 'Invalid or expired token',
        timestamp: new Date().toISOString()
      });
    }
    req.user = user;
    next();
  });
};

// Generate JWT tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { userId: user.id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  refreshTokens.add(refreshToken);
  return { accessToken, refreshToken };
};

// ===== AUTH ROUTES =====

// Register
app.post('/api/auth/register', async (req, res) => {
  const { username, email, phone, fullName, password } = req.body;

  if (users.has(username)) {
    return res.status(409).json({
      status: 'error',
      message: 'Username already exists',
      timestamp: new Date().toISOString()
    });
  }

  const userId = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);

  users.set(username, {
    id: userId,
    username,
    email,
    phone,
    fullName,
    passwordHash,
    role: 'ROLE_USER',
    isActive: true,
    createdAt: new Date()
  });

  wallets.set(userId, {
    id: uuidv4(),
    userId,
    balance: 500000,
    currency: 'IDR'
  });

  const tokens = generateTokens(users.get(username));

  res.json({
    status: 'success',
    data: {
      user: {
        id: userId,
        username,
        email,
        phone,
        fullName,
        role: 'ROLE_USER'
      },
      ...tokens
    },
    message: 'Registration successful',
    timestamp: new Date().toISOString()
  });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  const user = users.get(username);
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid username or password',
      timestamp: new Date().toISOString()
    });
  }

  const tokens = generateTokens(user);

  res.json({
    status: 'success',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role
      },
      ...tokens
    },
    message: 'Login successful',
    timestamp: new Date().toISOString()
  });
});

// Refresh Token
app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    return res.status(403).json({
      status: 'error',
      message: 'Invalid refresh token',
      timestamp: new Date().toISOString()
    });
  }

  jwt.verify(refreshToken, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        status: 'error',
        message: 'Expired refresh token',
        timestamp: new Date().toISOString()
      });
    }

    const user = Array.from(users.values()).find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    refreshTokens.delete(refreshToken);
    const tokens = generateTokens(user);

    res.json({
      status: 'success',
      data: tokens,
      message: 'Token refreshed',
      timestamp: new Date().toISOString()
    });
  });
});

// Logout
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({
    status: 'success',
    data: null,
    message: 'Logout successful',
    timestamp: new Date().toISOString()
  });
});

// Setup PIN
app.post('/api/auth/setup-pin', authenticateToken, async (req, res) => {
  const { pin } = req.body;
  const user = users.get(req.user.username);

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found',
      timestamp: new Date().toISOString()
    });
  }

  user.pinHash = await bcrypt.hash(pin, 10);

  res.json({
    status: 'success',
    data: null,
    message: 'PIN setup successful',
    timestamp: new Date().toISOString()
  });
});

// ===== USER ROUTES =====

// Get current user
app.get('/api/users/me', authenticateToken, (req, res) => {
  const user = users.get(req.user.username);
  res.json({
    status: 'success',
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl
    },
    message: 'User profile retrieved',
    timestamp: new Date().toISOString()
  });
});

// Update profile
app.put('/api/users/me', authenticateToken, (req, res) => {
  const { fullName, email, phone } = req.body;
  const user = users.get(req.user.username);

  if (fullName) user.fullName = fullName;
  if (email) user.email = email;
  if (phone) user.phone = phone;

  res.json({
    status: 'success',
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      role: user.role
    },
    message: 'Profile updated',
    timestamp: new Date().toISOString()
  });
});

// Update avatar
app.put('/api/users/me/avatar', authenticateToken, (req, res) => {
  const { avatarUrl } = req.body;
  const user = users.get(req.user.username);
  user.avatarUrl = avatarUrl;

  res.json({
    status: 'success',
    data: null,
    message: 'Avatar updated',
    timestamp: new Date().toISOString()
  });
});

// ===== WALLET ROUTES =====

// Get balance
app.get('/api/wallet/balance', authenticateToken, (req, res) => {
  const wallet = wallets.get(req.user.userId);
  res.json({
    status: 'success',
    data: wallet.balance,
    message: 'Balance retrieved',
    timestamp: new Date().toISOString()
  });
});

// Get wallet details
app.get('/api/wallet/details', authenticateToken, (req, res) => {
  const wallet = wallets.get(req.user.userId);
  const user = users.get(req.user.username);

  res.json({
    status: 'success',
    data: {
      id: wallet.id,
      balance: wallet.balance,
      currency: wallet.currency,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName
      }
    },
    message: 'Wallet details retrieved',
    timestamp: new Date().toISOString()
  });
});

// Get QR code
app.get('/api/wallet/qr-code', authenticateToken, (req, res) => {
  const wallet = wallets.get(req.user.userId);
  const qrData = JSON.stringify({
    walletId: wallet.id,
    userId: req.user.userId,
    timestamp: Date.now()
  });
  const qrCode = Buffer.from(qrData).toString('base64');

  res.json({
    status: 'success',
    data: qrCode,
    message: 'QR code generated',
    timestamp: new Date().toISOString()
  });
});

// ===== TRANSACTION ROUTES =====

// Top up
app.post('/api/transactions/topup', authenticateToken, async (req, res) => {
  const { amount, pin } = req.body;
  const user = users.get(req.user.username);

  if (user.pinHash && !await bcrypt.compare(pin, user.pinHash)) {
    return res.status(403).json({
      status: 'error',
      message: 'Invalid PIN',
      timestamp: new Date().toISOString()
    });
  }

  const wallet = wallets.get(req.user.userId);
  wallet.balance += parseFloat(amount);

  const transaction = {
    id: uuidv4(),
    senderWalletId: null,
    receiverWalletId: wallet.id,
    amount: parseFloat(amount),
    fee: 0,
    type: 'TOPUP',
    status: 'COMPLETED',
    referenceCode: `PAY-${Date.now()}`,
    description: 'Top up',
    createdAt: new Date(),
    userId: req.user.userId
  };
  transactions.set(transaction.id, transaction);

  // Add notification
  const notification = {
    id: uuidv4(),
    userId: req.user.userId,
    title: 'Top Up Successful',
    message: `Rp ${amount} has been added to your wallet`,
    type: 'TRANSACTION',
    isRead: false,
    createdAt: new Date()
  };
  notifications.set(notification.id, notification);

  res.json({
    status: 'success',
    data: {
      transactionId: transaction.id,
      newBalance: wallet.balance,
      amount: parseFloat(amount),
      status: 'COMPLETED'
    },
    message: 'Top up successful',
    timestamp: new Date().toISOString()
  });
});

// Transfer
app.post('/api/transactions/transfer', authenticateToken, async (req, res) => {
  const { recipientUsername, amount, pin, description } = req.body;
  const user = users.get(req.user.username);
  const recipient = users.get(recipientUsername);

  if (!recipient) {
    return res.status(404).json({
      status: 'error',
      message: 'Recipient not found',
      timestamp: new Date().toISOString()
    });
  }

  if (user.pinHash && !await bcrypt.compare(pin, user.pinHash)) {
    return res.status(403).json({
      status: 'error',
      message: 'Invalid PIN',
      timestamp: new Date().toISOString()
    });
  }

  const senderWallet = wallets.get(req.user.userId);
  const recipientWallet = wallets.get(recipient.id);

  if (senderWallet.balance < parseFloat(amount)) {
    return res.status(400).json({
      status: 'error',
      message: 'Insufficient balance',
      timestamp: new Date().toISOString()
    });
  }

  senderWallet.balance -= parseFloat(amount);
  recipientWallet.balance += parseFloat(amount);

  const transaction = {
    id: uuidv4(),
    senderWalletId: senderWallet.id,
    receiverWalletId: recipientWallet.id,
    amount: parseFloat(amount),
    fee: 0,
    type: 'TRANSFER',
    status: 'COMPLETED',
    referenceCode: `PAY-${Date.now()}`,
    description: description || 'Transfer',
    createdAt: new Date(),
    userId: req.user.userId
  };
  transactions.set(transaction.id, transaction);

  res.json({
    status: 'success',
    data: {
      transactionId: transaction.id,
      newBalance: senderWallet.balance,
      amount: parseFloat(amount),
      recipient: recipient.fullName,
      status: 'COMPLETED'
    },
    message: 'Transfer successful',
    timestamp: new Date().toISOString()
  });
});

// Get transaction history
app.get('/api/transactions', authenticateToken, (req, res) => {
  const { page = 0, size = 10 } = req.query;
  const userTransactions = Array.from(transactions.values())
    .filter(t => t.userId === req.user.userId)
    .sort((a, b) => b.createdAt - a.createdAt);

  const start = page * size;
  const end = start + parseInt(size);
  const paginated = userTransactions.slice(start, end);

  res.json({
    status: 'success',
    data: {
      content: paginated.map(t => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        status: t.status,
        referenceCode: t.referenceCode,
        description: t.description,
        createdAt: t.createdAt
      })),
      page: parseInt(page),
      size: parseInt(size),
      totalElements: userTransactions.length,
      totalPages: Math.ceil(userTransactions.length / size)
    },
    message: 'Transaction history retrieved',
    timestamp: new Date().toISOString()
  });
});

// Get recent transactions
app.get('/api/transactions/recent', authenticateToken, (req, res) => {
  const { limit = 5 } = req.query;
  const userTransactions = Array.from(transactions.values())
    .filter(t => t.userId === req.user.userId)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, parseInt(limit));

  res.json({
    status: 'success',
    data: userTransactions.map(t => ({
      id: t.id,
      amount: t.amount,
      type: t.type,
      status: t.status,
      description: t.description,
      createdAt: t.createdAt
    })),
    message: 'Recent transactions retrieved',
    timestamp: new Date().toISOString()
  });
});

// ===== BILL ROUTES =====

const bills = [
  { id: uuidv4(), name: 'PLN Electricity', category: 'ELECTRICITY', iconCode: 'bolt', fixedAmount: null },
  { id: uuidv4(), name: 'PDAM Water', category: 'WATER', iconCode: 'water_drop', fixedAmount: null },
  { id: uuidv4(), name: 'Indihome Internet', category: 'INTERNET', iconCode: 'wifi', fixedAmount: 150000 },
  { id: uuidv4(), name: 'BPJS Kesehatan', category: 'INSURANCE', iconCode: 'health_and_safety', fixedAmount: 150000 },
  { id: uuidv4(), name: 'Telkomsel Pulsa', category: 'MOBILE', iconCode: 'smartphone', fixedAmount: null }
];

app.get('/api/bills', (req, res) => {
  res.json({
    status: 'success',
    data: bills,
    message: 'Bills retrieved',
    timestamp: new Date().toISOString()
  });
});

// ===== NOTIFICATION ROUTES =====

app.get('/api/notifications', authenticateToken, (req, res) => {
  const { page = 0, size = 20 } = req.query;
  const userNotifications = Array.from(notifications.values())
    .filter(n => n.userId === req.user.userId)
    .sort((a, b) => b.createdAt - a.createdAt);

  const start = page * size;
  const end = start + parseInt(size);
  const paginated = userNotifications.slice(start, end);

  res.json({
    status: 'success',
    data: {
      content: paginated,
      page: parseInt(page),
      size: parseInt(size),
      totalElements: userNotifications.length
    },
    message: 'Notifications retrieved',
    timestamp: new Date().toISOString()
  });
});

app.patch('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const notification = notifications.get(req.params.id);
  if (notification && notification.userId === req.user.userId) {
    notification.isRead = true;
  }

  res.json({
    status: 'success',
    data: null,
    message: 'Notification marked as read',
    timestamp: new Date().toISOString()
  });
});

app.patch('/api/notifications/read-all', authenticateToken, (req, res) => {
  Array.from(notifications.values())
    .filter(n => n.userId === req.user.userId)
    .forEach(n => n.isRead = true);

  res.json({
    status: 'success',
    data: null,
    message: 'All notifications marked as read',
    timestamp: new Date().toISOString()
  });
});

// ===== ADMIN ROUTES =====

app.get('/api/admin/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'ROLE_ADMIN') {
    return res.status(403).json({
      status: 'error',
      message: 'Admin access required',
      timestamp: new Date().toISOString()
    });
  }

  const allUsers = Array.from(users.values()).map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    phone: u.phone,
    fullName: u.fullName,
    role: u.role,
    isActive: u.isActive
  }));

  res.json({
    status: 'success',
    data: {
      content: allUsers,
      page: 0,
      size: 20,
      totalElements: allUsers.length
    },
    message: 'Users retrieved',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/admin/analytics/summary', authenticateToken, (req, res) => {
  if (req.user.role !== 'ROLE_ADMIN') {
    return res.status(403).json({
      status: 'error',
      message: 'Admin access required',
      timestamp: new Date().toISOString()
    });
  }

  const totalVolume = Array.from(transactions.values())
    .reduce((sum, t) => sum + t.amount, 0);

  res.json({
    status: 'success',
    data: {
      totalUsers: users.size,
      totalTransactions: transactions.size,
      totalVolume,
      todayVolume: totalVolume // Simplified
    },
    message: 'Analytics retrieved',
    timestamp: new Date().toISOString()
  });
});

// ===== HEALTH CHECK =====

app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    data: { status: 'UP' },
    message: 'Service is running',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 PayFlow Mock Server running on http://localhost:${PORT}`);
  console.log(`📋 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔑 Test Login: username="admin", password="Admin123!"`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  POST /api/auth/register');
  console.log('  POST /api/auth/login');
  console.log('  POST /api/auth/refresh');
  console.log('  GET  /api/users/me');
  console.log('  GET  /api/wallet/balance');
  console.log('  POST /api/transactions/topup');
  console.log('  POST /api/transactions/transfer');
  console.log('  GET  /api/transactions');
  console.log('  GET  /api/bills');
  console.log('  GET  /api/notifications');
  console.log('  GET  /api/admin/analytics/summary (admin only)');
  console.log('');
  console.log('⚠️  Frontend must use API URL: http://localhost:8081');
});
