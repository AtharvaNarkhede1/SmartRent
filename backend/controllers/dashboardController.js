const Room = require('../models/Room');
const Tenant = require('../models/Tenant');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const Property = require('../models/Property');

exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const [totalProperties, rooms, tenants, monthPayments, recentActivity, recentPayments] = await Promise.all([
      Property.countDocuments(), Room.find().select('status tenantAssigned'), Tenant.find({ isActive: { $ne: false } }).select('rent paymentStatus'),
      Payment.find({ $or: [{ billingPeriod: period }, { billingPeriod: { $exists: false }, paymentDate: { $gte: start, $lt: end } }] }),
      Notification.find().sort({ createdAt: -1 }).limit(5),
      Payment.find().populate('tenant', 'name').populate('room', 'roomNumber').sort({ paymentDate: -1, createdAt: -1 }).limit(5)
    ]);
    const totalRentExpected = tenants.reduce((sum, tenant) => sum + Number(tenant.rent || 0), 0);
    const totalPaid = monthPayments.filter((payment) => payment.status !== 'Pending').reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const occupiedRooms = rooms.filter((room) => room.tenantAssigned || room.status === 'Occupied' || room.status === 'Partial').length;
    res.json({ success: true, data: {
      period, totalProperties, totalRooms: rooms.length, occupiedRooms,
      vacantRooms: rooms.filter((room) => room.status === 'Vacant' && !room.tenantAssigned).length,
      totalPeople: tenants.length,
      pendingPayments: tenants.filter((tenant) => tenant.paymentStatus !== 'Paid').length,
      recentActivity, recentPayments,
      payments: { totalPaid, totalPending: Math.max(0, totalRentExpected - totalPaid), totalRentExpected }
    } });
  } catch (error) { res.status(500).json({ success: false, message: 'Unable to load dashboard statistics.' }); }
};
