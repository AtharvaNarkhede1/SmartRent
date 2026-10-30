import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Building2, BedDouble, DoorOpen, Users, CircleDollarSign, Clock3, Plus, ArrowUpRight, ReceiptText } from 'lucide-react';
import { useSmartRent } from '../context/SmartRentContext';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export const Dashboard = () => {
  const { onOpenModal } = useOutletContext();
  const navigate = useNavigate();
  const { properties, rooms, tenants, rentLedger, maintenance, dashboardStats, dashboardLoading, dashboardError, refreshDashboard, activities } = useSmartRent();
  const metric = (value) => dashboardLoading && !dashboardStats ? '…' : value;
  const occupied = dashboardStats?.occupiedRooms ?? rooms.filter((room) => ['Occupied', 'Partial'].includes(room.status)).length;
  const vacant = dashboardStats?.vacantRooms ?? rooms.filter((room) => room.status === 'Vacant').length;
  const openMaintenance = maintenance.filter((item) => ['Open', 'In Progress'].includes(item.status)).length;
  const recentPayments = (dashboardStats?.recentPayments || rentLedger).slice(0, 5);
  const recentActivity = (dashboardStats?.recentActivity || activities).slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">Portfolio overview</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">A current view of your properties, residents, and rent.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onOpenModal('addRoom')} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"><Plus size={16}/> Add room</button>
          <button onClick={() => onOpenModal('addPayment')} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3.5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"><Plus size={16}/> Record payment</button>
        </div>
      </section>

      {dashboardError && <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><span>{dashboardError}</span><button onClick={refreshDashboard} className="shrink-0 font-medium underline underline-offset-2">Retry</button></div>}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Portfolio metrics">
        <StatCard icon={Building2} label="Properties" value={metric(dashboardStats?.totalProperties ?? properties.length)} description="Managed properties" onClick={() => navigate('/properties')} />
        <StatCard icon={BedDouble} label="Rooms" value={metric(dashboardStats?.totalRooms ?? rooms.length)} description={`${occupied} occupied`} onClick={() => navigate('/rooms')} />
        <StatCard icon={DoorOpen} label="Vacant rooms" value={metric(vacant)} description="Available for residents" onClick={() => navigate('/rooms')} />
        <StatCard icon={Users} label="Active tenants" value={metric(dashboardStats?.totalPeople ?? tenants.filter((tenant) => tenant.isActive !== false).length)} description="Current residents" onClick={() => navigate('/tenants')} />
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button onClick={() => navigate('/rent')} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-emerald-300">
          <span className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><CircleDollarSign size={19}/></span><span><span className="block text-xs font-medium text-slate-500">Collected this month</span><span className="mt-0.5 block text-xl font-semibold text-slate-900">{dashboardLoading && !dashboardStats ? '…' : dashboardStats ? money(dashboardStats.payments?.totalPaid) : '—'}</span></span></span><ArrowUpRight size={17} className="text-slate-400"/>
        </button>
        <button onClick={() => navigate('/rent')} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-amber-300">
          <span className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-amber-50 text-amber-700"><Clock3 size={19}/></span><span><span className="block text-xs font-medium text-slate-500">Rent outstanding this month</span><span className="mt-0.5 block text-xl font-semibold text-slate-900">{dashboardLoading && !dashboardStats ? '…' : dashboardStats ? money(dashboardStats.payments?.totalPending) : '—'}</span></span></span><ArrowUpRight size={17} className="text-slate-400"/>
        </button>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white xl:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5"><div><h2 className="text-sm font-semibold text-slate-900">Recent payments</h2><p className="mt-0.5 text-xs text-slate-500">Latest recorded rent transactions</p></div><button onClick={() => navigate('/rent')} className="text-xs font-medium text-emerald-700 hover:text-emerald-800">View ledger</button></div>
          {recentPayments.length ? <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="bg-slate-50 text-xs font-medium text-slate-500"><tr><th className="px-4 py-2.5">Tenant</th><th className="px-4 py-2.5">Room</th><th className="px-4 py-2.5">Date</th><th className="px-4 py-2.5 text-right">Amount</th><th className="px-4 py-2.5">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{recentPayments.map((payment) => <tr key={payment.id || payment._id}><td className="px-4 py-3 font-medium text-slate-800">{payment.tenantName || payment.tenant?.name || 'Tenant'}</td><td className="px-4 py-3 text-slate-600">{typeof payment.room === 'string' ? payment.room : payment.room?.roomNumber || '—'}</td><td className="px-4 py-3 text-slate-600">{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('en-IN') : '—'}</td><td className="px-4 py-3 text-right font-medium text-slate-900">{money(payment.paidAmount ?? payment.amount)}</td><td className="px-4 py-3"><StatusBadge status={payment.paymentStatus || payment.status || 'Paid'} /></td></tr>)}</tbody></table></div> : <div className="px-4 py-10 text-center">{dashboardLoading ? <p className="text-sm text-slate-500">Loading payments…</p> : <><ReceiptText className="mx-auto mb-2 text-slate-300" size={22}/><p className="text-sm font-medium text-slate-700">No payments recorded yet</p><p className="mt-1 text-xs text-slate-500">Recorded payments will appear here.</p></>}</div>}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5"><div><h2 className="text-sm font-semibold text-slate-900">Recent activity</h2><p className="mt-0.5 text-xs text-slate-500">Latest account updates</p></div></div>
          {recentActivity.length ? <ul className="divide-y divide-slate-100">{recentActivity.map((item, index) => <li key={item.id || item._id || index} className="flex gap-3 px-4 py-3"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-600"/><span className="min-w-0"><span className="block text-sm text-slate-700">{item.desc || item.message || item.title || 'Account activity'}</span><span className="mt-1 block text-xs text-slate-400">{item.time || (item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN') : '')}</span></span></li>)}</ul> : <div className="px-4 py-10 text-center text-sm text-slate-500">No recent activity</div>}
        </div>
      </section>
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"><div><p className="text-sm font-medium text-slate-800">Operations</p><p className="mt-0.5 text-xs text-slate-500">{openMaintenance} open maintenance {openMaintenance === 1 ? 'request' : 'requests'}</p></div><button onClick={() => navigate('/maintenance')} className="text-sm font-medium text-emerald-700">Review maintenance</button></div>
    </div>
  );
};
