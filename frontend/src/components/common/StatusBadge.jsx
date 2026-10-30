import React from 'react';

const statusConfig = {
  // Rent / Payment
  Paid: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  Overdue: { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  'Due today': { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  Partial: { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },

  // Rooms / Occupancy
  Occupied: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Vacant: { bg: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500' },
  Reserved: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  Maintenance: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },

  // Lease / Tenant Documents
  Active: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Verified: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Pending Documents': { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  Expiring: { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },

  // Maintenance Status & Priority
  Open: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  'In Progress': { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  Completed: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Urgent: { bg: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold', dot: 'bg-rose-600 animate-pulse' },
  High: { bg: 'bg-amber-100 text-amber-800 border-amber-300 font-medium', dot: 'bg-amber-600' },
  Medium: { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  Low: { bg: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-400' },

  // Bookings
  Confirmed: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Upcoming: { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  Cancelled: { bg: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
  Sent: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' }
};

export const StatusBadge = ({ status, className = '' }) => {
  const config = statusConfig[status] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
};
