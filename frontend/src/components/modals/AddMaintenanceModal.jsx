import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { useSmartRent } from '../../context/SmartRentContext';

export const AddMaintenanceModal = ({ isOpen, onClose }) => {
  const { properties, rooms, addMaintenance } = useSmartRent();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Plumbing',
    propertyId: '',
    roomId: '',
    priority: 'Medium',
    description: '',
    assignedPerson: '',
    estimatedCost: 0
  });

  const propertyRooms = rooms.filter((room) => room.propertyId === formData.propertyId);
  useEffect(() => {
    if (isOpen) { setFormData((current) => ({ ...current, propertyId: properties[0]?.id || '', roomId: '', estimatedCost: 0 })); setSaving(false); }
  }, [isOpen, properties]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving || !formData.description.trim() || !formData.propertyId || Number(formData.estimatedCost) < 0) return;
    setSaving(true);
    const saved = await addMaintenance(formData);
    setSaving(false);
    if (!saved) return;
    onClose();
    setFormData({
      category: 'Plumbing',
      propertyId: properties[0]?.id || '',
      roomId: '',
      priority: 'Medium',
      description: '',
      assignedPerson: '',
      estimatedCost: 0
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={saving ? () => {} : onClose} title="Log maintenance ticket" subtitle="Record an issue against a property and optional room">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option>Plumbing</option>
              <option>Electrical</option>
              <option>Cleaning</option>
              <option>Repairs</option>
              <option>Appliance</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Level</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Property</label>
            <select
              required
              value={formData.propertyId}
              onChange={(e) => setFormData({ ...formData, propertyId: e.target.value, roomId: '' })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Room / Unit</label>
            <select
              value={formData.roomId}
              onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Common area / no room</option>
              {propertyRooms.map((room) => <option key={room.id} value={room.id}>Room {room.roomNumber}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Issue Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows="3"
            required
            placeholder="Explain the problem in detail (e.g., tap leaking, MCB tripping, AC servicing)..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Vendor / Person</label>
            <input
              type="text"
              placeholder="e.g. Ramesh Plumber (+91...)"
              value={formData.assignedPerson}
              onChange={(e) => setFormData({ ...formData, assignedPerson: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Cost (₹)</label>
            <input
              type="number"
              min="0"
              step="100"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !formData.propertyId}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs hover:shadow transition-all"
          >
            {saving ? 'Saving…' : 'Log request'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
