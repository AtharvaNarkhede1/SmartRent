import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { useSmartRent } from '../../context/SmartRentContext';

export const AddBookingModal = ({ isOpen, onClose, booking }) => {
  const { properties, rooms, addBooking, updateBooking } = useSmartRent();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    guestName: '',
    guestPhone: '',
    propertyId: '',
    roomId: '',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: '',
    amount: '',
    type: 'Monthly Stay'
  });

  const availableRooms = rooms.filter((room) => room.propertyId === formData.propertyId && room.status === 'Vacant');
  useEffect(() => {
    if (!isOpen) return;
    if (booking) {
      setFormData({ guestName: booking.guestName, guestPhone: booking.guestPhone, propertyId: booking.propertyId, roomId: booking.roomId, checkIn: booking.checkIn, checkOut: booking.checkOut, amount: booking.amount, type: booking.type });
      setSaving(false);
      return;
    }
    const checkIn = new Date();
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 1);
    const propertyId = properties[0]?.id || '';
    setFormData((current) => ({ ...current, propertyId, roomId: '', checkIn: checkIn.toISOString().slice(0, 10), checkOut: checkOut.toISOString().slice(0, 10), amount: '' }));
    setSaving(false);
  }, [isOpen, properties, booking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving || !formData.guestName.trim() || !formData.guestPhone.trim() || !formData.propertyId || !formData.roomId || Number(formData.amount) < 0 || formData.checkOut <= formData.checkIn) return;
    setSaving(true);
    const saved = booking?.id ? await updateBooking(booking.id, formData) : await addBooking(formData);
    setSaving(false);
    if (!saved) return;
    onClose();
    setFormData({
      guestName: '',
      guestPhone: '',
      propertyId: properties[0]?.id || '',
      roomId: '',
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: '',
      amount: '',
      type: 'Monthly Stay'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={saving ? () => {} : onClose} title={booking ? 'Edit booking' : 'Create new booking'} subtitle="Reserve a vacant room for the selected stay dates">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Guest Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ananya Deshpande"
              value={formData.guestName}
              onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="+91 98334 11223"
              value={formData.guestPhone}
              onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Room</label>
            <select
              required
              value={formData.roomId}
              onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Choose a vacant room</option>
              {availableRooms.map((room) => <option key={room.id} value={room.id}>Room {room.roomNumber} · ₹{Number(room.rent).toLocaleString('en-IN')}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Check-in Date</label>
            <input
              type="date"
              required
              value={formData.checkIn}
              onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Check-out Date</label>
            <input
              type="date"
              required
              min={formData.checkIn}
              value={formData.checkOut}
              onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Total Agreed Amount (₹)</label>
            <input
              type="number"
              min="0"
              required
              step="500"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Booking Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option>Short Stay (Days)</option>
              <option>Monthly Stay</option>
              <option>3 Months Stay</option>
              <option>Long Term (Annual)</option>
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
            disabled={saving || !formData.roomId || !formData.amount || formData.checkOut <= formData.checkIn}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs hover:shadow transition-all"
          >
            {saving ? 'Saving…' : booking ? 'Save changes' : 'Confirm reservation'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
