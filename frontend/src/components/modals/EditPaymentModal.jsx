import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { useSmartRent } from '../../context/SmartRentContext';

const asDateInput = (date) => date ? new Date(date).toISOString().slice(0, 10) : '';

export const EditPaymentModal = ({ payment, onClose }) => {
  const { updateRentPayment } = useSmartRent();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ amount: '', paymentDate: '', billingPeriod: '', paymentMethod: '', transactionId: '', notes: '' });

  useEffect(() => {
    if (payment) setForm({ amount: payment.paidAmount, paymentDate: asDateInput(payment.paymentDate), billingPeriod: payment.billingPeriod, paymentMethod: payment.paymentMethod || '', transactionId: payment.transactionRef || '', notes: payment.notes || '' });
  }, [payment]);

  const change = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const save = async (event) => {
    event.preventDefault();
    if (saving || !payment || Number(form.amount) <= 0) return;
    setSaving(true);
    const saved = await updateRentPayment(payment.id, form);
    setSaving(false);
    if (saved) onClose();
  };

  return <Modal isOpen={Boolean(payment)} onClose={saving ? () => {} : onClose} title="Correct payment record" subtitle="Changes are checked against the tenant’s rent for this period; balances recalculate after saving." maxWidth="max-w-xl">
    <form onSubmit={save} className="space-y-4">
      <div className="rounded-xl bg-slate-50 p-3 text-sm"><span className="text-slate-500">Tenant</span><p className="font-semibold text-slate-900">{payment?.tenantName}</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block text-xs font-semibold text-slate-700">Rental period<input required type="month" value={form.billingPeriod || ''} onChange={change('billingPeriod')} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" /></label>
        <label className="block text-xs font-semibold text-slate-700">Payment date<input required type="date" value={form.paymentDate || ''} onChange={change('paymentDate')} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" /></label>
        <label className="block text-xs font-semibold text-slate-700">Amount (₹)<input required type="number" min="0.01" step="0.01" value={form.amount} onChange={change('amount')} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" /></label>
        <label className="block text-xs font-semibold text-slate-700">Payment method<input maxLength="60" value={form.paymentMethod} onChange={change('paymentMethod')} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" /></label>
        <label className="block text-xs font-semibold text-slate-700 sm:col-span-2">Transaction reference<input maxLength="120" value={form.transactionId} onChange={change('transactionId')} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" /></label>
        <label className="block text-xs font-semibold text-slate-700 sm:col-span-2">Correction notes<textarea maxLength="1000" rows="3" value={form.notes} onChange={change('notes')} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" /></label>
      </div>
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <button type="button" disabled={saving} onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
        <button type="submit" disabled={saving || Number(form.amount) <= 0} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save correction'}</button>
      </div>
    </form>
  </Modal>;
};
