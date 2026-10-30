import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useSmartRent } from '../../context/SmartRentContext';

export const EditTenantModal = ({ isOpen, onClose, tenant }) => {
  const { properties, rooms, updateTenant } = useSmartRent();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    propertyId: '',
    propertyName: '',
    roomId: '',
    roomNumber: '',
    monthlyRent: '',
    dueDay: 1,
    address: '',
    emergencyContact: '',
    idProof: ''
  });

  useEffect(() => {
    if (tenant && isOpen) {
      setFormData({
        name: tenant.name || '',
        phone: tenant.phone || '',
        email: tenant.email || '',
        propertyId: tenant.propertyId || '',
        propertyName: tenant.propertyName || '',
        roomId: tenant.roomId || '',
        roomNumber: tenant.roomNumber || '',
        monthlyRent: tenant.monthlyRent || '',
        dueDay: tenant.dueDay || 1,
        address: tenant.address || '',
        emergencyContact: tenant.emergencyContact || '',
        idProof: tenant.idProof || ''
      });
    }
  }, [tenant, isOpen]);

  const availableRooms = rooms.filter(
    (r) => r.propertyId === formData.propertyId || r.propertyName === formData.propertyName
  );

  const handlePropertyChange = (e) => {
    const prop = properties.find((p) => p.id === e.target.value);
    if (prop) {
      setFormData({
        ...formData,
        propertyId: prop.id,
        propertyName: prop.name,
        roomId: '',
        roomNumber: ''
      });
    }
  };

  const handleRoomChange = (e) => {
    const room = availableRooms.find((r) => r.id === e.target.value);
    if (room) {
      setFormData({
        ...formData,
        roomId: room.id,
        roomNumber: room.roomNumber,
        monthlyRent: room.rent
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving || !formData.name.trim() || !formData.phone.trim() || Number(formData.monthlyRent) <= 0) return;
    setSaving(true);
    
    const saved = await updateTenant(tenant.id, {
      ...formData,
      rent: Number(formData.monthlyRent) || 0
    });
    setSaving(false);
    if (saved) onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Tenant" subtitle="Update tenant details" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mobile Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Permanent Address <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Property</label>
            <select
              value={formData.propertyId}
              onChange={handlePropertyChange}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select Property...</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Room</label>
            <select
              value={formData.roomId}
              onChange={handleRoomChange}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select a room...</option>
              {availableRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Room {r.roomNumber} ({r.type} — ₹{r.rent.toLocaleString('en-IN')}) [{r.status}]
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Rent (₹)</label>
            <input
              type="number"
              required
              min="1"
              step="0.01"
              value={formData.monthlyRent}
              onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ID Proof Document (Link/Name)</label>
            <input
              type="text"
              value={formData.idProof}
              onChange={(e) => setFormData({ ...formData, idProof: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rent due day</label>
            <input type="number" required min="1" max="28" value={formData.dueDay} onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
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
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs hover:shadow transition-all"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
