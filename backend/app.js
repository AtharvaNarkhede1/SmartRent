require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/tenants', require('./routes/tenantRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.get('/api/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SmartRent Backend API',
    message: 'Backend is running successfully. To access the web app, open your Render static site URL.',
    health: '/api/health'
  });
});

app.use((err, req, res, next) => {
  console.error(err.message);
  const status = err.status || (err.name === 'ValidationError' || err.name === 'CastError' ? 400 : 500);
  res.status(status).json({ success: false, message: status < 500 ? err.message : 'An unexpected server error occurred.' });
});

module.exports = app;
