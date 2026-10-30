import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useSmartRent } from '../../context/SmartRentContext';

export const AddTransactionModal = ({ isOpen, onClose }) => {
  const { addTransaction } = useSmartRent();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    category: 'Utilities',
    amount: '',
    type: 'Expense',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving || !formData.description.trim() || Number(formData.amount) <= 0) return;
    setSaving(true);
    const saved = await addTransaction(formData);
    setSaving(false);
    if (!saved) return;
    onClose();
    setFormData({
      description: '',
      category: 'Utilities',
      amount: '',
      type: 'Expense',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={saving ? () => {} : onClose} title="Add financial transaction" subtitle="Record a real expense or income item">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Transaction Description <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Electricity Bill - Sunrise Residency"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="Expense">Expense (-)</option>
              <option value="Income">Income (+)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option>Utilities</option>
              <option>Maintenance</option>
              <option>Staff Payroll</option>
              <option>Repairs</option>
              <option>Rent Income</option>
              <option>Security Deposit</option>
              <option>Miscellaneous</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0.01"
              required
              required
              step="100"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || Number(formData.amount) <= 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs hover:shadow transition-all"
          >
            {saving ? 'Saving…' : 'Save transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
