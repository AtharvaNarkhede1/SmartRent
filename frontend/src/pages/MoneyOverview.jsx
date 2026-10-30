import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Clock,
  Plus,
  Search,
  Filter,
  ArrowDownLeft
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { useSmartRent } from '../context/SmartRentContext';

export const MoneyOverview = () => {
  const { onOpenModal } = useOutletContext();
  const { transactions, rentLedger, rooms } = useSmartRent();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const monthlyData = React.useMemo(() => {
    const data = [];
    const now = new Date();
    const paymentsByMonth = rentLedger.reduce((acc, curr) => {
      if (curr.paymentStatus !== 'Paid') return acc;
      const d = new Date(curr.paymentDate || curr.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      acc[key] = (acc[key] || 0) + curr.paidAmount;
      return acc;
    }, {});

    const currentExpected = rooms.filter(r => r.status === 'Occupied' || r.status === 'Partial')
                                 .reduce((sum, r) => sum + r.rent, 0);

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      data.push({
        month: d.toLocaleString('default', { month: 'short' }),
        collected: paymentsByMonth[key] || 0,
        expenses: Math.round((currentExpected || 50000) * 0.2), // dummy 20%
      });
    }
    return data;
  }, [rentLedger, rooms]);

  const filteredTxns = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Money Overview</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor income, expenses, profit, and cash flow.
          </p>
        </div>

        <button
          onClick={() => onOpenModal('addTransaction')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* 5 Statistics Cards (Specified in prompt) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatCard
          icon={ArrowUpRight}
          label="Total Income"
          value="₹39,500"
          description="Gross collections"
          trend="+8.2%"
          trendType="positive"
        />
        <StatCard
          icon={ArrowDownRight}
          label="Total Expenses"
          value="₹22,700"
          description="Operational disbursements"
        />
        <StatCard
          icon={TrendingUp}
          label="Net Profit"
          value="₹16,800"
          description="Retained net earnings"
          trend="+14%"
          trendType="positive"
        />
        <StatCard
          icon={Clock}
          label="Pending Income"
          value="₹55,000"
          description="Awaiting remittance"
        />
        <StatCard
          icon={Wallet}
          label="This Month Growth"
          value="+12.5%"
          description="MoM portfolio expansion"
          trend="Target Met"
          trendType="positive"
        />
      </div>

      {/* Charts: Income vs Expenses & Cash Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Income vs Expenses</h4>
              <p className="text-xs text-slate-500">Trailing comparison of revenue against operating costs</p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              6 Months
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="collected" name="Income" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#93C5FD" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cash Flow Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Cash Flow Evolution</h4>
              <p className="text-xs text-slate-500">Liquid operational surplus progression</p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              +₹16,800 Net
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyData.map((d) => ({
                  ...d,
                  netCashFlow: d.collected - d.expenses
                }))}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="cashflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Net Cashflow']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="netCashFlow" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#cashflowGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Ledger Transactions</h3>
            <p className="text-[11px] text-slate-500">All registered inflows and disbursements</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500 bg-white text-slate-700"
            >
              <option value="All">All Types</option>
              <option value="Income">Income (+)</option>
              <option value="Expense">Expense (-)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Transaction</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTxns.map((t) => {
                const isIncome = t.type === 'Income';

                return (
                  <tr key={t.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {t.description}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{t.date}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                          isIncome ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isIncome ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                        {t.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      <span
                        className={`text-sm ${
                          isIncome
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {isIncome ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <StatusBadge status={t.status || 'Completed'} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
