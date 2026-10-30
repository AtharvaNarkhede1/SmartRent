import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from '../common/Modal';
import { useSmartRent } from '../../context/SmartRentContext';

const thisPeriod = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};
const today = () => new Date().toISOString().slice(0, 10);

export const RecordPaymentModal = ({ isOpen, onClose, preselectedRecord }) => {
  const { tenants, rentLedger, recordRentPayment, sendReminder } = useSmartRent();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ tenantId: '', billingPeriod: thisPeriod(), paidAmount: '', paymentDate: today(), paymentMethod: 'UPI', transactionRef: '', notes: '' });
  const tenant = tenants.find((item) => item.id === formData.tenantId);
  const periodPayments = useMemo(() => rentLedger.filter((payment) => payment.tenantId === formData.tenantId && payment.billingPeriod === formData.billingPeriod), [rentLedger, formData.tenantId, formData.billingPeriod]);
  const paid = periodPayments.reduce((sum, payment) => sum + Number(payment.paidAmount || 0), 0);
  const outstanding = Math.max(0, Number(tenant?.monthlyRent || 0) - paid);

  useEffect(() => {
    if (!isOpen) return;
    const initialTenantId = preselectedRecord?.tenantId || '';
    setFormData({ tenantId: initialTenantId, billingPeriod: thisPeriod(), paidAmount: '', paymentDate: today(), paymentMethod: 'UPI', transactionRef: '', notes: '' });
    setSaving(false);
  }, [isOpen, preselectedRecord]);

  useEffect(() => {
    if (tenant) setFormData((current) => ({ ...current, paidAmount: String(Math.max(0, Number(tenant.monthlyRent || 0) - rentLedger.filter((payment) => payment.tenantId === tenant.id && payment.billingPeriod === current.billingPeriod).reduce((sum, payment) => sum + Number(payment.paidAmount || 0), 0))) }));
  }, [tenant, formData.billingPeriod, rentLedger]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || !tenant || Number(formData.paidAmount) <= 0 || Number(formData.paidAmount) > outstanding) return;
    setSaving(true);
    const saved = await recordRentPayment({ ...formData, tenantId: tenant.id, roomId: tenant.roomId, propertyId: tenant.propertyId, dueDate: tenant.dueDate });
    setSaving(false);
    if (saved) onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={saving ? () => {} : onClose} title="Record a rent payment" subtitle="Record a manual payment against a tenant’s rental period" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block text-xs font-semibold text-slate-700">Tenant <span className="text-rose-500">*</span>
            <select required value={formData.tenantId} onChange={(event) => setFormData((current) => ({ ...current, tenantId: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
              <option value="">Choose tenant</option>{tenants.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.propertyName} / {item.roomNumber}</option>)}
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-700">Rental period <span className="text-rose-500">*</span>
            <input required type="month" value={formData.billingPeriod} onChange={(event) => setFormData((current) => ({ ...current, billingPeriod: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
          </label>
        </div>
        {tenant && <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div><p className="text-slate-500">Property</p><p className="mt-1 font-semibold text-slate-800">{tenant.propertyName || 'Unassigned'}</p></div>
          <div><p className="text-slate-500">Room</p><p className="mt-1 font-semibold text-slate-800">{tenant.roomNumber || 'Unassigned'}</p></div>
          <div><p className="text-slate-500">Monthly rent</p><p className="mt-1 font-semibold text-slate-800">₹{Number(tenant.monthlyRent || 0).toLocaleString('en-IN')}</p></div>
          <div><p className="text-slate-500">Balance this period</p><p className="mt-1 font-bold text-rose-700">₹{outstanding.toLocaleString('en-IN')}</p></div>
        </div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block text-xs font-semibold text-slate-700">Amount received (₹) <span className="text-rose-500">*</span>
            <input required type="number" min="0.01" max={outstanding} step="0.01" value={formData.paidAmount} onChange={(event) => setFormData((current) => ({ ...current, paidAmount: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
            {Number(formData.paidAmount) > outstanding && <span className="mt-1 block text-rose-600">Payment cannot exceed this period’s outstanding balance.</span>}
          </label>
          <label className="block text-xs font-semibold text-slate-700">Payment date <span className="text-rose-500">*</span>
            <input required type="date" value={formData.paymentDate} onChange={(event) => setFormData((current) => ({ ...current, paymentDate: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
          </label>
          <label className="block text-xs font-semibold text-slate-700">Payment method
            <select value={formData.paymentMethod} onChange={(event) => setFormData((current) => ({ ...current, paymentMethod: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option>UPI</option><option>Cash</option><option>Bank transfer</option><option>Card</option><option>Cheque</option><option>Other</option></select>
          </label>
          <label className="block text-xs font-semibold text-slate-700">Transaction reference <span className="font-normal text-slate-400">Optional</span>
            <input maxLength="120" value={formData.transactionRef} onChange={(event) => setFormData((current) => ({ ...current, transactionRef: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
          </label>
        </div>
        <label className="block text-xs font-semibold text-slate-700">Notes <span className="font-normal text-slate-400">Optional</span>
          <textarea maxLength="1000" rows="2" value={formData.notes} onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
        </label>
        {tenant && outstanding > 0 && <button type="button" onClick={() => sendReminder(tenant, outstanding)} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">Open WhatsApp with a prefilled balance reminder</button>}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" disabled={saving} onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button type="submit" disabled={saving || !tenant || outstanding <= 0 || Number(formData.paidAmount) <= 0 || Number(formData.paidAmount) > outstanding} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Saving…' : 'Record payment'}</button>
        </div>
      </form>
    </Modal>
  );
};
