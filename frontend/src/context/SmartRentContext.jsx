import React, { createContext, useContext, useState, useEffect } from 'react';
import { defaultSettings, initialOwnerProfile } from '../data/mockData';
import { buildRentReminderMessage, buildWhatsAppUrl } from '../utils/rentReminder';

const SmartRentContext = createContext();

const API_BASE = import.meta.env?.VITE_API_BASE_URL || 'http://127.0.0.1:5001/api';
const API_ORIGIN = new URL(API_BASE).origin;
const currentPeriod = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};
const getPaymentPeriod = (payment) => {
  if (payment.billingPeriod) return payment.billingPeriod;
  const date = new Date(payment.paymentDate);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const SmartRentProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('sr_token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [rentLedger, setRentLedger] = useState([]); // Maps to payments
  const [reminderHistory, setReminderHistory] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activities, setActivities] = useState([]); // Maps to notifications
  
  const [settings, setSettings] = useState(defaultSettings);
  const [ownerProfile, setOwnerProfile] = useState(initialOwnerProfile);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState('');

  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // --- API Helpers ---
  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const fetchProperties = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/properties`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        const mappedProps = data.data.map(p => ({
          id: p._id,
          name: p.name,
          address: p.address,
          type: p.type,
          image: p.image,
          description: p.description,
          floors: p.floors,
          monthlyRevenue: p.monthlyRevenue,
          // Calculate occupiedRooms/totalRooms on frontend using rooms array if needed,
          // or just default to 0 for now until rooms are fetched.
          totalRooms: rooms.filter(r => r.propertyId === p._id).length || 0,
          occupiedRooms: rooms.filter(r => r.propertyId === p._id && (r.status === 'Occupied' || r.status === 'Partial')).length || 0
        }));
        setProperties(mappedProps);
      }
    } catch (e) { console.error('Error fetching properties:', e); }
  };

  const fetchRooms = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/rooms`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        // Map backend schema to frontend expectations
        const mappedRooms = data.data.map(r => ({
          id: r._id,
          roomNumber: r.roomNumber,
          type: r.type,
          rent: r.rent,
          status: r.status,
          tenantName: r.tenantAssigned?.name || '',
          tenantId: r.tenantAssigned?._id || null,
          propertyName: r.property?.name || 'Unassigned',
          propertyId: r.property?._id || null,
          floor: r.floor || 1,
          beds: r.beds || 1
        }));
        setRooms(mappedRooms);
      }
    } catch (e) { console.error('Error fetching rooms:', e); }
  };

  const fetchTenants = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/tenants`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        const mappedTenants = data.data.map(t => ({
          id: t._id,
          name: t.name,
          email: t.email,
          phone: t.phone,
          roomId: t.room?._id,
          roomNumber: t.room?.roomNumber || 'Unassigned',
          monthlyRent: t.rent,
          currentBalance: Number.isFinite(Number(t.currentBalance)) ? Number(t.currentBalance) : undefined,
          paymentStatus: t.paymentStatus,
          documentsStatus: t.idProof ? 'Submitted' : 'Not Submitted',
          idProof: t.idProof,
          propertyName: t.room?.property?.name || 'Unassigned',
          propertyId: t.room?.property?._id || null,
          avatar: t.avatar,
          address: t.address,
          emergencyContact: t.emergencyContact,
          joiningDate: t.joiningDate,
          moveInDate: t.joiningDate ? new Date(t.joiningDate).toISOString().slice(0, 10) : '',
          leaseEndDate: t.leaseEndDate,
          dueDay: t.dueDay || 1,
          dueDate: `${currentPeriod()}-${String(t.dueDay || 1).padStart(2, '0')}`,
          isActive: t.isActive !== false
        }));
        setTenants(mappedTenants);
      }
    } catch (e) { console.error('Error fetching tenants:', e); }
  };

  const fetchPayments = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/payments`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        const mapped = data.data.map(p => ({
          id: p._id,
          receiptNumber: p.receiptNumber || p._id.slice(-6).toUpperCase(),
          tenantName: p.tenant?.name,
          tenantId: p.tenant?._id,
          property: p.property?.name || p.room?.property?.name || 'Unassigned',
          propertyId: p.property?._id || p.room?.property?._id || null,
          room: p.room?.roomNumber || 'Unassigned',
          roomId: p.room?._id || null,
          rentAmount: p.tenant?.rent || p.amount,
          paidAmount: p.amount,
          billingPeriod: getPaymentPeriod(p),
          notes: p.notes || '',
          dueDate: p.dueDate ? new Date(p.dueDate).toISOString().split('T')[0] : '',
          paymentDate: new Date(p.paymentDate).toISOString().split('T')[0],
          paymentMethod: p.paymentMethod,
          transactionRef: p.transactionId,
          paymentStatus: p.status,
          date: p.paymentDate
        }));
        setRentLedger(mapped);
        setReceipts(mapped); // same data for receipts
      }
    } catch (e) { console.error('Error fetching payments:', e); }
  };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/notifications`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        const mapped = data.data.map(n => ({
          id: n._id,
          desc: n.message,
          time: new Date(n.createdAt).toLocaleString(),
          isRead: n.isRead,
          icon: 'BellRing',
          type: 'notification',
          title: 'System Notification'
        }));
        setActivities(mapped);
      }
    } catch (e) { console.error('Error fetching notifications:', e); }
  };

  const markNotificationRead = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT', headers: authHeaders });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Unable to update notification.');
      setActivities((items) => items.map((item) => item.id === id ? { ...item, isRead: true } : item));
      return true;
    } catch (error) {
      addToast(error.message || 'Unable to mark notification as read.', 'error');
      return false;
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const response = await fetch(`${API_BASE}/notifications/read-all`, { method: 'PUT', headers: authHeaders });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Unable to update notifications.');
      setActivities((items) => items.map((item) => ({ ...item, isRead: true })));
      return true;
    } catch (error) {
      addToast(error.message || 'Unable to mark notifications as read.', 'error');
      return false;
    }
  };

  const fetchReminders = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/reminders`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        setReminderHistory(data.data);
      }
    } catch (e) { console.error('Error fetching reminders:', e); }
  };

  const fetchDashboard = async () => {
    if (!token) return;
    setDashboardLoading(true);
    setDashboardError('');
    try {
      const res = await fetch(`${API_BASE}/dashboard`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        setDashboardStats(data.data);
      } else setDashboardError(data.message || 'Unable to load dashboard data.');
    } catch (e) { console.error('Error fetching dashboard:', e); setDashboardError('Unable to load dashboard data. Check your connection and try again.'); }
    finally { setDashboardLoading(false); }
  };

  const fetchBookings = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE}/bookings`, { headers: authHeaders });
      const result = await response.json();
      if (result.success) setBookings(result.data.map((booking) => ({ id: booking._id, guestName: booking.guestName, guestPhone: booking.guestPhone, property: booking.property?.name || 'Unknown property', propertyName: booking.property?.name || 'Unknown property', propertyId: booking.property?._id, room: booking.room?.roomNumber || 'Unknown room', roomNumber: booking.room?.roomNumber || 'Unknown room', roomId: booking.room?._id, checkIn: new Date(booking.checkIn).toISOString().slice(0, 10), checkOut: new Date(booking.checkOut).toISOString().slice(0, 10), amount: booking.amount, type: booking.type, status: booking.status })));
    } catch (error) { console.error('Error loading bookings:', error); }
  };

  const fetchMaintenance = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE}/maintenance`, { headers: authHeaders });
      const result = await response.json();
      if (result.success) setMaintenance(result.data.map((ticket) => ({ id: ticket._id, category: ticket.category, property: ticket.property?.name || 'Unknown property', propertyName: ticket.property?.name || 'Unknown property', propertyId: ticket.property?._id, room: ticket.room?.roomNumber || 'Unassigned', roomId: ticket.room?._id, priority: ticket.priority, description: ticket.description, assignedPerson: ticket.assignedPerson || '', estimatedCost: ticket.estimatedCost || 0, status: ticket.status, createdAt: ticket.createdAt })));
    } catch (error) { console.error('Error loading maintenance tickets:', error); }
  };

  const fetchTransactions = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE}/transactions`, { headers: authHeaders });
      const result = await response.json();
      if (result.success) setTransactions(result.data.map((transaction) => ({ id: transaction._id, description: transaction.description, category: transaction.category, amount: transaction.amount, type: transaction.type, date: new Date(transaction.date).toISOString().slice(0, 10), property: transaction.property?.name || 'Unassigned', propertyId: transaction.property?._id, notes: transaction.notes || '' })));
    } catch (error) { console.error('Error loading transactions:', error); }
  };

  const fetchAdminProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        setOwnerProfile(prev => ({ ...prev, ...data.data.settings?.ownerProfile, fullName: data.data.name, email: data.data.email }));
        if (data.data.settings) {
          setSettings(prev => ({ ...prev, ...data.data.settings }));
        }
      }
    } catch (e) { console.error('Error fetching admin profile:', e); }
  };

  const fetchAllData = () => {
    if (token) {
      fetchAdminProfile();
      fetchProperties();
      fetchRooms();
      fetchTenants();
      fetchPayments();
      fetchNotifications();
      fetchReminders();
      fetchDashboard();
      fetchBookings();
      fetchMaintenance();
      fetchTransactions();
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [token]);

  useEffect(() => {
    setProperties((current) => {
      let changed = false;
      const next = current.map((property) => {
        const propertyRooms = rooms.filter((room) => room.propertyId === property.id);
        const totalRooms = propertyRooms.length;
        const occupiedRooms = propertyRooms.filter((room) => room.status === 'Occupied' || room.status === 'Partial').length;
        if (property.totalRooms === totalRooms && property.occupiedRooms === occupiedRooms) return property;
        changed = true;
        return { ...property, totalRooms, occupiedRooms };
      });
      return changed ? next : current;
    });
  }, [rooms]);

  // --- Auth Actions ---
  const loginOwner = async ({ email, password }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        localStorage.setItem('sr_token', data.token);
        setIsAuthenticated(true);
        setOwnerProfile(prev => ({ ...prev, fullName: data.data.name, email: data.data.email }));
        addToast(`Welcome back, ${data.data.name}!`);
      } else {
        addToast(data.message || 'Login failed', 'error');
      }
    } catch (e) {
      console.error('Login fetch error:', e);
      addToast('Network error during login', 'error');
    }
  };

  const signupOwner = async (initialData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: initialData.fullName, email: initialData.email, password: initialData.password })
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        localStorage.setItem('sr_token', data.token);
        setIsAuthenticated(true);
        setOwnerProfile(prev => ({ ...prev, fullName: data.data.name, email: data.data.email }));
        addToast(`Account created! Welcome, ${data.data.name}.`);
      } else {
        addToast(data.message || 'Registration failed', 'error');
      }
    } catch (e) {
      addToast('Network error during registration', 'error');
    }
  };

  const logoutOwner = () => {
    setToken(null);
    localStorage.removeItem('sr_token');
    setIsAuthenticated(false);
    // Clear state
    setRooms([]);
    setTenants([]);
    setRentLedger([]);
    setActivities([]);
    addToast('Logged out.', 'info');
  };

  // --- Data Mutation Actions ---
  const addRoom = async (newRoom) => {
    try {
      const payload = {
        roomNumber: newRoom.roomNumber,
        type: newRoom.type || 'Single',
        rent: Number(newRoom.rent) || 0,
        status: newRoom.status || 'Vacant',
        property: newRoom.propertyId,
        floor: Number(newRoom.floor) || 1,
        beds: Number(newRoom.beds) || 1
      };
      
      const res = await fetch(`${API_BASE}/rooms`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Room ${newRoom.roomNumber} added!`);
        await Promise.all([fetchRooms(), fetchProperties(), fetchDashboard()]);
        return true;
      } else {
        addToast(data.message, 'error');
        return false;
      }
    } catch (e) {
      addToast('Error adding room', 'error');
      return false;
    }
  };

  const updateRoom = async (id, updated) => {
    try {
      const res = await fetch(`${API_BASE}/rooms/${id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (data.success) {
        addToast('Room updated');
        await Promise.all([fetchRooms(), fetchProperties(), fetchDashboard()]);
        return true;
      } else {
        addToast(data.message, 'error');
        return false;
      }
    } catch (e) {
      addToast('Error updating room', 'error');
      return false;
    }
  };

  const deleteRoom = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/rooms/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (data.success) {
        addToast('Room deleted');
        fetchRooms();
        fetchDashboard();
        return true;
      }
      addToast(data.message, 'error');
      return false;
    } catch (e) {
      addToast('Error deleting room', 'error');
      return false;
    }
  };

  const addTenant = async (newTenant) => {
    try {
      const payload = {
        name: newTenant.name,
        phone: newTenant.phone,
        email: newTenant.email,
        address: newTenant.address,
        rent: Number(newTenant.monthlyRent) || 0,
        deposit: Number(newTenant.deposit) || 0,
        idProof: newTenant.idProof,
        avatar: newTenant.avatar,
        emergencyContact: newTenant.emergencyContact,
        dueDay: Number(newTenant.dueDay) || 1,
        joiningDate: newTenant.moveInDate,
        leaseEndDate: newTenant.leaseEndDate
      };
      payload.room = newTenant.roomId || null;

      const res = await fetch(`${API_BASE}/tenants`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        addToast('Tenant added!');
        await Promise.all([fetchTenants(), fetchRooms(), fetchProperties(), fetchDashboard()]);
        return true;
      } else {
        addToast(data.message, 'error');
      }
    } catch (e) {
      addToast('Error adding tenant', 'error');
      return false;
    }
  };

  const updateTenant = async (id, updated) => {
    try {
      // Map roomId to room for backend
      const payload = { ...updated };
      if (Object.prototype.hasOwnProperty.call(updated, 'roomId')) payload.room = updated.roomId || null;
      if (updated.monthlyRent !== undefined) payload.rent = Number(updated.monthlyRent);
      delete payload.roomId;
      delete payload.propertyId;
      delete payload.propertyName;
      delete payload.roomNumber;
      delete payload.monthlyRent;
      
      const res = await fetch(`${API_BASE}/tenants/${id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        addToast('Tenant updated');
        await Promise.all([fetchTenants(), fetchRooms(), fetchDashboard()]);
        return true;
      } else {
        addToast(data.message, 'error');
      }
    } catch (e) {
      addToast('Error updating tenant', 'error');
      return false;
    }
  };

  const deleteTenant = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/tenants/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (data.success) {
        addToast('Tenant deleted');
        fetchTenants();
        fetchRooms();
        fetchDashboard();
        return true;
      }
      addToast(data.message, 'error');
      return false;
    } catch (e) {
      addToast('Error deleting tenant', 'error');
      return false;
    }
  };

  const removeTenant = deleteTenant;
  const vacateRoom = async (roomId) => {
     const tenant = tenants.find((item) => item.roomId === roomId);
     if (tenant) return updateTenant(tenant.id, { roomId: null });
     return updateRoom(roomId, { status: 'Vacant' });
  };

  const deleteRentPayment = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/payments/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (data.success) {
        addToast('Payment deleted');
        fetchPayments();
        fetchTenants();
        fetchDashboard();
        return true;
      }
      addToast(data.message, 'error');
      return false;
    } catch (e) {
      addToast('Error deleting payment', 'error');
      return false;
    }
  };

  const updateRentPayment = async (id, changes) => {
    try {
      const payload = { amount: Number(changes.amount), paymentDate: changes.paymentDate, billingPeriod: changes.billingPeriod, paymentMethod: changes.paymentMethod, transactionId: changes.transactionId, notes: changes.notes };
      const response = await fetch(`${API_BASE}/payments/${id}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok || !result.success) { addToast(result.message || 'Could not correct payment.', 'error'); return false; }
      await Promise.all([fetchPayments(), fetchTenants(), fetchDashboard()]);
      addToast('Payment corrected and balances recalculated.');
      return true;
    } catch (error) { addToast('Could not correct payment.', 'error'); return false; }
  };

  const recordRentPayment = async (data) => {
    try {
      const payload = {
        tenant: data.tenantId,
        amount: Number(data.paidAmount),
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionRef,
        billingPeriod: data.billingPeriod || currentPeriod(),
        paymentDate: data.paymentDate || new Date().toISOString(),
        dueDate: data.dueDate || undefined,
        notes: data.notes || ''
      };
      if (data.roomId) payload.room = data.roomId;
      if (data.propertyId) payload.property = data.propertyId;

      const res = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (resData.success) {
        addToast('Payment recorded');
        await Promise.all([fetchPayments(), fetchTenants(), fetchNotifications(), fetchDashboard()]);
        return true;
      } else {
        addToast(resData.message, 'error');
      }
    } catch (e) {
      addToast('Error recording payment', 'error');
      return false;
    }
  };

  const sendReminder = async (tenant, remainingAmount, customMessage, preopenedWindow = null) => {
    if (!tenant) return false;
    if (!tenant.monthlyRent && !tenant.rent) {
      addToast('Rent amount has not been set for this tenant.', 'error');
      return false;
    }
    
    if (!tenant.phone) {
      addToast('Tenant phone number is missing. Please edit the tenant details.', 'error');
      return false;
    }
    const amount = remainingAmount !== undefined ? remainingAmount : (tenant.currentBalance ?? tenant.monthlyRent ?? tenant.rent);
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      addToast('There is no outstanding rent balance to remind this tenant about.', 'info');
      return false;
    }
    const date = tenant.dueDate || `${currentPeriod()}-${String(tenant.dueDay || 1).padStart(2, '0')}`;
    const message = customMessage || buildRentReminderMessage({ name: tenant.name, roomNumber: tenant.roomNumber, propertyName: tenant.propertyName, amount, dueDate: date, upiId: settings.upiId, accountHolder: settings.accountHolder, paymentInstructions: settings.paymentInstructions });
    let url;
    try {
      url = buildWhatsAppUrl(tenant.phone, message);
    } catch (e) {
      addToast('Enter a valid tenant phone number with country code for WhatsApp.', 'error');
      return false;
    }
    const whatsappWindow = preopenedWindow || window.open(url, '_blank');
    if (!whatsappWindow) {
      addToast('Allow pop-ups to open the WhatsApp reminder.', 'error');
      return false;
    }
    if (preopenedWindow) preopenedWindow.location.href = url;

    try {
      const response = await fetch(`${API_BASE}/reminders`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          tenant: tenant.id || tenant._id,
          amountDue: amount,
          dueDate: date,
          billingPeriod: currentPeriod(),
          method: 'WhatsApp',
          status: 'Opened in WhatsApp; not sent'
        })
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Unable to record that WhatsApp was opened.');
      await fetchReminders();
      addToast('WhatsApp opened with the reminder. It is not marked as sent.');
      return true;
    } catch (e) {
      console.error('Failed to record WhatsApp reminder action', e);
      addToast('WhatsApp opened, but reminder history could not be saved.', 'error');
      return true;
    }
  };

  const copyReminder = (tenant, remainingAmount) => {
    if (!tenant) return;
    if (!(tenant.monthlyRent || tenant.rent) || (remainingAmount ?? tenant.currentBalance ?? 1) <= 0) {
      addToast('Rent amount has not been set for this tenant.', 'error');
      return;
    }
    const amount = remainingAmount ?? tenant.currentBalance;
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      addToast('There is no outstanding rent balance to remind this tenant about.', 'info');
      return;
    }
    const message = `Hello ${tenant.name},\n\nThis is a reminder regarding your outstanding rent of ₹${amount} for Room ${tenant.roomNumber}.\n\nPlease make the payment at your earliest convenience.\n\nThank you,\nSmartRent`;
    navigator.clipboard.writeText(buildRentReminderMessage({ name: tenant.name, roomNumber: tenant.roomNumber, propertyName: tenant.propertyName, amount, dueDate: tenant.dueDate || `${currentPeriod()}-${String(tenant.dueDay || 1).padStart(2, '0')}`, upiId: settings.upiId, accountHolder: settings.accountHolder, paymentInstructions: settings.paymentInstructions }) || message);
    addToast('Reminder copied to clipboard');
  };

  const uploadImage = async (file) => {
    if (!token) return null;
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        return data.imageUrl; // e.g. /uploads/image-123.jpg
      } else {
        addToast(data.message || 'Image upload failed', 'error');
        return null;
      }
    } catch (e) {
      addToast('Network error during image upload', 'error');
      return null;
    }
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('/uploads')) {
      return `${API_ORIGIN}${url}`;
    }
    return url;
  };

  // Stubs for unsupported features to prevent frontend crashes
  // Property CRUD
  const addProperty = async (newProp) => {
    try {
      const res = await fetch(`${API_BASE}/properties`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(newProp)
      });
      const data = await res.json();
      if (data.success) {
        addToast('Property added!');
        await Promise.all([fetchProperties(), fetchDashboard()]);
        return true;
      } else {
        addToast(data.message, 'error');
        return false;
      }
    } catch (e) {
      addToast('Error adding property', 'error');
      return false;
    }
  };

  const updateProperty = async (id, updated) => {
    try {
      const res = await fetch(`${API_BASE}/properties/${id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (data.success) {
        addToast('Property updated');
        await Promise.all([fetchProperties(), fetchDashboard()]);
        return true;
      } else {
        addToast(data.message, 'error');
        return false;
      }
    } catch (e) {
      addToast('Error updating property', 'error');
      return false;
    }
  };

  const deleteProperty = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/properties/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (data.success) {
        addToast('Property deleted');
        fetchProperties();
        fetchRooms();
        fetchTenants();
        fetchDashboard();
        return true;
      }
      addToast(data.message, 'error');
      return false;
    } catch (e) {
      addToast('Error deleting property', 'error');
      return false;
    }
  };
  const addBooking = async (booking) => {
    try {
      const response = await fetch(`${API_BASE}/bookings`, { method: 'POST', headers: authHeaders, body: JSON.stringify({ guestName: booking.guestName, guestPhone: booking.guestPhone, property: booking.propertyId, room: booking.roomId, checkIn: booking.checkIn, checkOut: booking.checkOut, amount: Number(booking.amount), type: booking.type }) });
      const result = await response.json();
      if (!response.ok || !result.success) { addToast(result.message || 'Could not create booking.', 'error'); return false; }
      await fetchBookings(); addToast('Booking created.'); return true;
    } catch (error) { addToast('Could not create booking.', 'error'); return false; }
  };
  const cancelBooking = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/bookings/${id}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify({ status: 'Cancelled' }) });
      const result = await response.json();
      if (!response.ok || !result.success) { addToast(result.message || 'Could not cancel booking.', 'error'); return false; }
      await fetchBookings(); addToast('Booking cancelled.'); return true;
    } catch (error) { addToast('Could not cancel booking.', 'error'); return false; }
  };
  const updateBooking = async (id, booking) => {
    try {
      const payload = { guestName: booking.guestName, guestPhone: booking.guestPhone, property: booking.propertyId, room: booking.roomId, checkIn: booking.checkIn, checkOut: booking.checkOut, amount: Number(booking.amount), type: booking.type };
      const response = await fetch(`${API_BASE}/bookings/${id}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok || !result.success) { addToast(result.message || 'Could not update booking.', 'error'); return false; }
      await fetchBookings(); addToast('Booking updated.'); return true;
    } catch (error) { addToast('Could not update booking.', 'error'); return false; }
  };
  const addMaintenance = async (ticket) => {
    try {
      const response = await fetch(`${API_BASE}/maintenance`, { method: 'POST', headers: authHeaders, body: JSON.stringify({ category: ticket.category, property: ticket.propertyId, room: ticket.roomId || undefined, priority: ticket.priority, description: ticket.description, assignedPerson: ticket.assignedPerson, estimatedCost: Number(ticket.estimatedCost || 0) }) });
      const result = await response.json();
      if (!response.ok || !result.success) { addToast(result.message || 'Could not log maintenance issue.', 'error'); return false; }
      await fetchMaintenance(); addToast('Maintenance issue logged.'); return true;
    } catch (error) { addToast('Could not log maintenance issue.', 'error'); return false; }
  };
  const updateMaintenanceStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_BASE}/maintenance/${id}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify({ status }) });
      const result = await response.json();
      if (!response.ok || !result.success) { addToast(result.message || 'Could not update ticket.', 'error'); return false; }
      await fetchMaintenance(); addToast('Ticket status updated.'); return true;
    } catch (error) { addToast('Could not update ticket.', 'error'); return false; }
  };
  const addTransaction = async (transaction) => {
    try {
      const response = await fetch(`${API_BASE}/transactions`, { method: 'POST', headers: authHeaders, body: JSON.stringify({ ...transaction, amount: Number(transaction.amount) }) });
      const result = await response.json();
      if (!response.ok || !result.success) { addToast(result.message || 'Could not save transaction.', 'error'); return false; }
      await fetchTransactions(); addToast('Transaction recorded.'); return true;
    } catch (error) { addToast('Could not save transaction.', 'error'); return false; }
  };
  const updateOwnerProfile = async (profile) => {
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, { method: 'PUT', headers: authHeaders, body: JSON.stringify({ name: profile.fullName, email: profile.email }) });
      const result = await response.json();
      if (!response.ok || !result.success) { addToast(result.message || 'Could not save profile.', 'error'); return false; }
      const settingsSaved = await updateSettingsAPI({ ownerProfile: profile });
      if (!settingsSaved) return false;
      const updatedProfile = { ...profile, fullName: result.data.name, email: result.data.email };
      setOwnerProfile(updatedProfile);
      setSettings((previous) => ({ ...previous, ownerProfile: updatedProfile }));
      return true;
    } catch (error) { addToast('Could not save profile.', 'error'); return false; }
  };

  const changeOwnerPassword = async ({ currentPassword, newPassword }) => {
    try {
      const response = await fetch(`${API_BASE}/auth/password`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        addToast(result.message || 'Could not update password.', 'error');
        return false;
      }
      addToast('Password updated successfully.');
      return true;
    } catch (error) {
      addToast('Could not update password. Check your connection and try again.', 'error');
      return false;
    }
  };
  
  const updateSettingsAPI = async (newSettings) => {
    try {
      const res = await fetch(`${API_BASE}/auth/settings`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(newSettings)
      });
      const data = await res.json();
      if (data.success) {
        setSettings(prev => ({ ...prev, ...data.data }));
        return true;
      }
      addToast(data.message || 'Could not save settings.', 'error');
      return false;
    } catch (e) {
      console.error('Failed to save settings to DB:', e);
      return false;
    }
  };

  const assignTenantToRoom = () => addToast('Use edit tenant to assign room');
  const resetAllData = () => {
    addToast('Not allowed in production');
  }

  return (
    <SmartRentContext.Provider
      value={{
        properties,
        setProperties,
        rooms,
        setRooms,
        tenants,
        setTenants,
        rentLedger,
        setRentLedger,
        reminderHistory,
        setReminderHistory,
        bookings,
        setBookings,
        maintenance,
        setMaintenance,
        receipts,
        setReceipts,
        transactions,
        setTransactions,
        activities,
        markNotificationRead,
        markAllNotificationsRead,
        settings,
        setSettings,
        updateSettingsAPI,
        ownerProfile,
        setOwnerProfile,
        updateOwnerProfile,
        changeOwnerPassword,
        isAuthenticated,
        setIsAuthenticated,
        loginOwner,
        signupOwner,
        logoutOwner,
        toasts,
        addToast,
        removeToast,
        addProperty,
        updateProperty,
        deleteProperty,
        addRoom,
        updateRoom,
        deleteRoom,
        assignTenantToRoom,
        vacateRoom,
        addTenant,
        updateTenant,
        removeTenant,
        deleteTenant,
        uploadImage,
        getImageUrl,
        recordRentPayment,
        deleteRentPayment,
        updateRentPayment,
        sendReminder,
        copyReminder,
        addBooking,
        cancelBooking,
        updateBooking,
        addMaintenance,
        updateMaintenanceStatus,
        addTransaction,
        resetAllData,
        dashboardStats,
        dashboardLoading,
        dashboardError,
        refreshDashboard: fetchDashboard
      }}
    >
      {children}
    </SmartRentContext.Provider>
  );
};

export const useSmartRent = () => {
  const context = useContext(SmartRentContext);
  if (!context) {
    throw new Error('useSmartRent must be used within a SmartRentProvider');
  }
  return context;
};
