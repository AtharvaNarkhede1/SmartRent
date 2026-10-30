import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BellRing,
  Clock,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  MessageSquare,
  CircleDollarSign,
  Users,
  Mail,
  Copy,
  Upload
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { useSmartRent } from '../context/SmartRentContext';
import { SendReminderModal } from '../components/modals/SendReminderModal';

export const RentReminders = () => {
  const { onOpenModal } = useOutletContext();
  const { tenants, rentLedger, settings, copyReminder, getImageUrl } = useSmartRent();
  const [selectedReminder, setSelectedReminder] = useState(null);

  // Derive reminders from tenants who have not paid (or just show all active tenants)
  const reminders = tenants.filter((tenant) => tenant.isActive !== false).map(t => {
      const now = new Date();
      const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const today = `${currentPeriod}-${String(now.getDate()).padStart(2, '0')}`;
      const tenantPayments = rentLedger.filter(p => p.tenantId === t.id && p.billingPeriod === currentPeriod && p.paymentStatus !== 'Pending');
      const totalPaid = tenantPayments.reduce((sum, p) => sum + p.paidAmount, 0);
      const remaining = Math.max(0, t.currentBalance ?? (t.monthlyRent - totalPaid));
      const dueDate = t.dueDate || `${currentPeriod}-${String(t.dueDay || 1).padStart(2, '0')}`;
      const dueStatus = remaining === 0 ? 'Paid' : dueDate < today ? 'Overdue' : dueDate === today ? 'Due today' : 'Upcoming';

      return {
        id: t.id,
        tenantName: t.name,
        tenantPhone: t.phone,
        propertyName: t.propertyName,
        roomNumber: t.roomNumber,
        monthlyRent: t.monthlyRent,
        paidAmount: totalPaid,
        remainingAmount: remaining,
        dueDate,
        status: dueStatus,
        rawTenant: t
      };
  }).sort((a, b) => (a.remainingAmount > 0 ? 0 : 1) - (b.remainingAmount > 0 ? 0 : 1) || a.dueDate.localeCompare(b.dueDate));



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Smart Rent Reminders</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track upcoming rent payments and send personalized payment reminders.
          </p>
        </div>

        <button
          onClick={() => onOpenModal('configureQr')}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors self-start sm:self-auto"
        >
          <QrCode className="w-4 h-4 text-blue-600" />
          <span>Manage UPI & QR</span>
        </button>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="Pending Reminders"
          value={reminders.filter(r => r.remainingAmount > 0).length}
          description="Awaiting payment"
        />
        <StatCard
          icon={Users}
          label="Active Tenants"
          value={tenants.length}
          description="Receiving updates"
        />
        <StatCard
          icon={CheckCircle2}
          label="Paid Rent"
          value={reminders.filter(r => r.remainingAmount === 0).length}
          description="Fully settled"
          trendType="positive"
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue Rent"
          value={reminders.filter(r => r.status === 'Overdue').length}
          description="Past the tenant's due date"
          trendType="negative"
        />
      </div>

      {/* Top 2 Cards: Auto Reminder Settings & Payment Details / QR Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
              <h3 className="font-bold text-sm text-slate-900">Reminder delivery</h3>
                  <p className="text-[11px] text-slate-500">Messages are prepared for you to review and send</p>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">Manual</span>
            </div>
            <div className="pt-4 space-y-3">
              <p className="text-xs leading-5 text-slate-600">Automatic delivery is not configured. Choose a tenant below to prepare a WhatsApp message, then review and send it in WhatsApp.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Payment Details & QR</h3>
                  <p className="text-[11px] text-slate-500">Configured account receiving rent funds</p>
                </div>
              </div>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row gap-5 items-center">
              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs text-center shrink-0 w-full sm:w-44">
                <div className="w-32 h-32 mx-auto bg-slate-900 rounded-xl p-2 flex flex-col items-center justify-center text-white relative overflow-hidden border border-slate-200/80 shadow-2xs">
                  {settings.qrCodeImage ? (
                    <img
                      src={getImageUrl(settings.qrCodeImage)}
                      alt="Custom Payment QR Code"
                      className="w-full h-full object-contain bg-white rounded-lg p-1"
                    />
                  ) : (
                    <>
                      <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 2h4v4h-4v-4zm-4-2h2v2h-2v-2zm2 4h2v2h-2v-2zm2-2h2v2h-2v-2zm-6-2h2v4h-2v-4z" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">₹</div>
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-2.5 flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onOpenModal('configureQr')}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Manage QR</span>
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-xs flex-1">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Account Holder Name</span>
                  <p className="font-bold text-slate-900 mt-0.5">{settings.accountHolder || 'Not Set'}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Primary UPI ID</span>
                  <p className="font-mono font-bold text-blue-600 mt-0.5">{settings.upiId || 'Not Set'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Rent Reminders Table</h3>
            <p className="text-[11px] text-slate-500">Live payment statuses and reminder dispatch actions</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {reminders.length} Active tenants
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Tenant</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Monthly Rent</th>
                <th className="py-3 px-4">Remaining</th>
                <th className="py-3 px-4">Due date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reminders.map((rem) => (
                <tr key={rem.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {rem.tenantName}
                    <span className="block text-[11px] text-blue-600 font-medium">Room {rem.roomNumber}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {rem.tenantPhone}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    ₹{(rem.monthlyRent || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-rose-600">
                    ₹{(rem.remainingAmount || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {new Date(`${rem.dueDate}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={rem.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      <button
                        onClick={() => setSelectedReminder(rem)}
                        disabled={rem.remainingAmount <= 0 || !rem.tenantPhone}
                        className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                        title="Send WhatsApp Reminder (Deep Link)"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Open WhatsApp</span>
                      </button>

                      <button
                        onClick={() => onOpenModal('addPayment', { tenantId: rem.id })}
                        disabled={rem.remainingAmount <= 0}
                        className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Record a payment manually"
                      >
                        <CircleDollarSign className="w-3.5 h-3.5" />
                        <span>Record payment</span>
                      </button>

                      <button
                        onClick={() => copyReminder(rem.rawTenant, rem.remainingAmount)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1"
                        title="Copy Reminder Text"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-600" />
                        <span>Copy Reminder</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reminders.length === 0 && <tr><td colSpan="7" className="px-4 py-10 text-center text-sm text-slate-500">No active tenants to remind.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <SendReminderModal isOpen={Boolean(selectedReminder)} onClose={() => setSelectedReminder(null)} onConfigure={() => onOpenModal('configureQr')} reminder={selectedReminder} />
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="border-b border-slate-100 p-4">
          <h3 className="text-sm font-bold text-slate-900">Reminder History</h3>
        </div>
        <p className="px-4 py-8 text-center text-sm text-slate-500">No reminder entries to display.</p>
      </section>
    </div>
  );
};
