import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useSmartRent } from '../../context/SmartRentContext';

export const AddRoomModal = ({ isOpen, onClose, defaultPropertyId, room }) => {
  const { properties, addRoom, updateRoom } = useSmartRent();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    propertyId: '',
    propertyName: '',
    roomNumber: '',
    floor: 1,
    type: 'Single',
    beds: 1,
    rent: '',
    status: 'Vacant'
  });

  useEffect(() => {
    if (room && isOpen) {
      setFormData({ propertyId: room.propertyId || '', propertyName: room.propertyName || '', roomNumber: room.roomNumber || '', floor: room.floor ?? 1, type: room.type || 'Single', beds: room.beds || 1, rent: room.rent || '', status: room.status || 'Vacant' });
      return;
    }
    if (properties.length > 0) {
      const selected = defaultPropertyId
        ? properties.find((p) => p.id === defaultPropertyId) || properties[0]
        : properties[0];

      setFormData((prev) => ({
        ...prev,
        propertyId: selected.id,
        propertyName: selected.name
      }));
    }
  }, [defaultPropertyId, properties, isOpen, room]);

  const handlePropertyChange = (e) => {
    const selected = properties.find((p) => p.id === e.target.value);
    if (selected) {
      setFormData({
        ...formData,
        propertyId: selected.id,
        propertyName: selected.name
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving || !formData.roomNumber.trim() || Number(formData.rent) <= 0 || !formData.propertyId) return;
    setSaving(true);
    const saved = room?.id ? await updateRoom(room.id, { ...formData, property: formData.propertyId, rent: Number(formData.rent), floor: Number(formData.floor), beds: Number(formData.beds) }) : await addRoom(formData);
    setSaving(false);
    if (!saved) return;
    onClose();
    setFormData((prev) => ({
      ...prev,
      roomNumber: '',
      floor: 1,
      rent: '',
      status: 'Vacant'
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={saving ? () => {} : onClose} title={room ? 'Edit room' : 'Add new room'} subtitle="Configure a room or unit within a property">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Target Property <span className="text-rose-500">*</span>
          </label>
          <select
            value={formData.propertyId}
            onChange={handlePropertyChange}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}{p.address ? ` (${p.address.split(',')[0]})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Room Number / Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 101 or 3B"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Floor Level</label>
            <input
              type="number"
              min="0"
              max="20"
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Room Sharing Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option>Single</option>
              <option>Double Sharing</option>
              <option>Triple Sharing</option>
              <option>Suite</option>
              <option>Private</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Total Beds</label>
            <input
              type="number"
              min="1"
              max="6"
              value={formData.beds}
              onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monthly Rent (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1000"
              step="500"
              value={formData.rent}
              onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option>Vacant</option>
              <option>Maintenance</option>
            </select>
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
            {saving ? 'Saving…' : room ? 'Save changes' : 'Create room'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
