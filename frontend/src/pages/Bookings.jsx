import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { useSmartRent } from '../context/SmartRentContext';

export const Bookings = () => {
  const { onOpenModal } = useOutletContext();
  const { bookings, cancelBooking, addToast } = useSmartRent();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const total = bookings.length;
  const upcoming = bookings.filter((b) => b.status !== 'Cancelled' && new Date(b.checkIn) >= new Date(new Date().setHours(0, 0, 0, 0))).length;
  const confirmed = bookings.filter((b) => b.status === 'Confirmed').length;
  const pending = bookings.filter((b) => b.status === 'Pending').length;
  const cancelled = bookings.filter((b) => b.status === 'Cancelled').length;

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCancel = (id, guestName) => {
    if (window.confirm(`Are you sure you want to cancel the booking for ${guestName}?`)) {
      cancelBooking(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Bookings Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track stay reservations, advance payments, and customer check-in dates.
          </p>
        </div>

        <button
          onClick={() => onOpenModal('addBooking')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Booking</span>
        </button>
      </div>

      {/* 5 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <StatCard
          icon={CalendarCheck}
          label="Total Bookings"
          value={total}
          description="In portfolio"
        />
        <StatCard
          icon={Clock}
          label="Upcoming"
          value={upcoming}
          description="Awaiting arrival"
          trend="Next 30 days"
        />
        <StatCard
          icon={CheckCircle2}
          label="Confirmed"
          value={confirmed}
          description="Deposit received"
          trend="Active"
          trendType="positive"
        />
        <StatCard
          icon={AlertCircle}
          label="Pending"
          value={pending}
          description="Awaiting payment"
          trend="Review"
          trendType="neutral"
        />
        <StatCard
          icon={XCircle}
          label="Cancelled"
          value={cancelled}
          description="Released inventory"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search guest name, property, or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 bg-white text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Guest / Customer</th>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-4">Check-in</th>
                <th className="py-3 px-4">Check-out</th>
                <th className="py-3 px-4">Agreed Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {b.guestName}
                    <span className="block text-[10px] text-slate-400 font-normal">{b.guestPhone}</span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{b.propertyName}</td>
                  <td className="py-3.5 px-4 text-blue-600 font-semibold">{b.roomNumber}</td>
                  <td className="py-3.5 px-4 text-slate-600">{b.checkIn}</td>
                  <td className="py-3.5 px-4 text-slate-600">{b.checkOut}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    ₹{b.amount.toLocaleString('en-IN')}
                    <span className="block text-[10px] text-slate-400 font-normal">{b.type}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenModal('editBooking', b)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit booking"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {b.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleCancel(b.id, b.guestName)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Cancel booking"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
