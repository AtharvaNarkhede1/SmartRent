import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  Wrench,
  ReceiptIndianRupee,
  ArrowRight,
  ExternalLink,
  PlusCircle,
  Inbox
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
import { useSmartRent } from '../../context/SmartRentContext';

export const DashboardQuickLists = ({ onOpenModal }) => {
  const { rentLedger, bookings, maintenance, tenants, getImageUrl } = useSmartRent();
  const [paymentsTab, setPaymentsTab] = useState('recent'); // 'recent' | 'empty'

  const newTenants = tenants
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  const recentPayments = rentLedger.slice(0, 4);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Section 1: Payments */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ReceiptIndianRupee className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Recent Payments</h4>
              <p className="text-[11px] text-slate-500">Latest rent transactions & receipts</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPaymentsTab(paymentsTab === 'recent' ? 'empty' : 'recent')}
              className="text-[11px] font-semibold text-slate-400 hover:text-blue-600 px-2 py-0.5 rounded border border-slate-200"
              title="Toggle empty state view"
            >
              {paymentsTab === 'recent' ? 'Show Empty State' : 'Show Records'}
            </button>
            <NavLink
              to="/rent"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 ml-1"
            >
              Ledger <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>

        <div className="pt-3">
          {paymentsTab === 'empty' ? (
            <EmptyState
              icon={Inbox}
              title="No Recent Payments"
              description="There are no payment entries recorded for the selected window."
              actionLabel="Record Payment"
              onAction={() => onOpenModal('addPayment')}
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {recentPayments.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-900">{p.tenantName}</p>
                    <p className="text-[11px] text-slate-500">{p.property} — {p.room}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">₹{(p.rentAmount || 0).toLocaleString('en-IN')}</p>
                    <div className="mt-0.5">
                      <StatusBadge status={p.paymentStatus} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 2: New Tenants */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">New Tenants</h4>
              <p className="text-[11px] text-slate-500">Recently onboarded residents</p>
            </div>
          </div>

          <NavLink
            to="/tenants"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            All Tenants <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        <div className="pt-3 divide-y divide-slate-100">
          {newTenants.map((t, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={getImageUrl(t.avatar)}
                  alt={t.name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div>
                  <p className="font-semibold text-slate-900">{t.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {t.propertyName} — <span className="font-medium text-slate-700">Room {t.roomNumber}</span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-slate-800">₹{(t.monthlyRent || 0).toLocaleString('en-IN')}</p>
                <div className="mt-0.5">
                  <StatusBadge status={t.paymentStatus || 'Pending'} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Overdue Tenants */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Overdue Tenants</h4>
              <p className="text-[11px] text-slate-500">Tenants with pending rent</p>
            </div>
          </div>

          <NavLink
            to="/rent/reminders"
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            Manage <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        <div className="pt-3 divide-y divide-slate-100">
          {tenants.map(t => {
            const tenantPayments = rentLedger.filter(p => p.tenantId === t.id && p.paymentStatus === 'Paid');
            const totalPaid = tenantPayments.reduce((sum, p) => sum + p.paidAmount, 0);
            const remaining = Math.max(0, t.monthlyRent - totalPaid);
            return { ...t, remainingAmount: remaining };
          }).filter(t => t.remainingAmount > 0).slice(0, 3).map((t) => (
            <div key={t.id} className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-slate-900">{t.name}</p>
                <p className="text-[11px] text-slate-500">{t.propertyName} — {t.roomNumber}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-rose-600">₹{(t.remainingAmount || 0).toLocaleString('en-IN')} Due</p>
                <div className="mt-0.5">
                  <StatusBadge status="Overdue" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Maintenance */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Maintenance Tickets</h4>
              <p className="text-[11px] text-slate-500">Urgent issues & vendor assignments</p>
            </div>
          </div>

          <NavLink
            to="/maintenance"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            All Tickets <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        <div className="pt-3 space-y-2.5">
          {/* Specifically mentioned in prompt:
              * Plumbing — In Progress — Green Residency
              * Electrical — Open — Green Residency
          */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between text-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">Plumbing</span>
                <StatusBadge status="In Progress" />
              </div>
              <p className="text-slate-600 text-[11px] mt-1 font-medium">Green Residency — Room 202</p>
              <p className="text-slate-400 text-[11px] line-clamp-1 mt-0.5">
                Bathroom faucet leaking continuously; plumber assigned.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between text-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">Electrical</span>
                <StatusBadge status="Open" />
                <StatusBadge status="Urgent" />
              </div>
              <p className="text-slate-600 text-[11px] mt-1 font-medium">Green Residency — Room 105</p>
              <p className="text-slate-400 text-[11px] line-clamp-1 mt-0.5">
                AC main circuit breaker tripping repeatedly when compressor kicks in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
