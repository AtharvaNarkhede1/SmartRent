import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Check,
  Building,
  UserCheck
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { useSmartRent } from '../context/SmartRentContext';

export const Maintenance = () => {
  const { onOpenModal } = useOutletContext();
  const { maintenance, updateMaintenanceStatus, properties } = useSmartRent();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const openCount = maintenance.filter((m) => m.status === 'Open').length;
  const inProgressCount = maintenance.filter((m) => m.status === 'In Progress').length;
  const completedCount = maintenance.filter((m) => m.status === 'Completed').length;
  const urgentCount = maintenance.filter((m) => m.priority === 'Urgent').length;

  const filteredTickets = maintenance.filter((m) => {
    const matchesSearch =
      m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.assignedPerson && m.assignedPerson.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'All' || m.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Maintenance Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dispatch technicians, resolve property issues, and track repair expenses.
          </p>
        </div>

        <button
          onClick={() => onOpenModal('addMaintenance')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Issue</span>
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={AlertTriangle}
          label="Open Tickets"
          value={openCount}
          description="Awaiting assignment"
          trend="Review"
          trendType="neutral"
        />
        <StatCard
          icon={Clock}
          label="In Progress"
          value={inProgressCount}
          description="Vendor dispatched"
          trend="Active"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={completedCount}
          description="Inspected & closed"
          trend="+4 wk"
          trendType="positive"
        />
        <StatCard
          icon={Wrench}
          label="Urgent Issues"
          value={urgentCount}
          description="High priority"
          trend="Immediate"
          trendType="negative"
        />
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search issue, room, vendor, or property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 bg-white text-slate-700"
          >
            <option value="All">All Categories</option>
            <option>Plumbing</option>
            <option>Electrical</option>
            <option>Cleaning</option>
            <option>Repairs</option>
            <option>Appliance</option>
            <option>Other</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 bg-white text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Maintenance Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Property & Room</th>
                <th className="py-3 px-4">Issue Description</th>
                <th className="py-3 px-4">Reported Date</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Person</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map((m) => (
                <tr key={m.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-semibold">
                      {m.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800">{m.property}</span>
                    <span className="block text-[11px] text-blue-600 font-medium">{m.room}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                    <p className="line-clamp-2 leading-relaxed">{m.description}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{m.reportedDate}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={m.priority} />
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    {m.assignedPerson || <span className="text-slate-400 italic">Unassigned</span>}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {m.status !== 'Completed' ? (
                        <button
                          onClick={() => updateMaintenanceStatus(m.id, 'Completed')}
                          className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Done</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400">Resolved</span>
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
