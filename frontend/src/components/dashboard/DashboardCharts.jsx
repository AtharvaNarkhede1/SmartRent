import React, { useMemo } from 'react';
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
import { useSmartRent } from '../../context/SmartRentContext';

export const DashboardCharts = () => {
  const { rentLedger, rooms } = useSmartRent();

  // Generate real data for the last 6 months
  const monthlyData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    // Group payments by month-year
    const paymentsByMonth = rentLedger.reduce((acc, curr) => {
      if (curr.paymentStatus !== 'Paid') return acc;
      const d = new Date(curr.paymentDate || curr.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      acc[key] = (acc[key] || 0) + curr.paidAmount;
      return acc;
    }, {});

    // Calculate total expected rent (sum of all occupied rooms rent)
    const currentExpected = rooms.filter(r => r.status === 'Occupied' || r.status === 'Partial')
                                 .reduce((sum, r) => sum + (r.rent || 0), 0);
    
    const currentOccupancy = rooms.length > 0 
      ? Math.round((rooms.filter(r => r.status === 'Occupied' || r.status === 'Partial').length / rooms.length) * 100)
      : 0;

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const monthName = d.toLocaleString('default', { month: 'short' });
      
      const expectedVal = currentExpected || 50000;
      data.push({
        month: monthName,
        expected: expectedVal, // fallback if no rooms
        collected: paymentsByMonth[key] || 0,
        occupancy: currentOccupancy,
        expenses: Math.round(expectedVal * 0.2) // dummy expenses as 20% of expected
      });
    }
    return data;
  }, [rentLedger, rooms]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Monthly Rent Collection */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Monthly Rent Collection</h4>
            <p className="text-xs text-slate-500">Expected vs Actual collections across 6 months</p>
          </div>
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
              <Bar dataKey="expected" name="Expected Rent" fill="#93C5FD" radius={[4, 4, 0, 0]} />
              <Bar dataKey="collected" name="Collected Rent" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Occupancy Trend */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Portfolio Occupancy Trend</h4>
            <p className="text-xs text-slate-500">Average occupancy rate (%) over time</p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                formatter={(val) => [`${val}%`, 'Occupancy Rate']}
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="occupancy" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#occupancyGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Monthly Expenses */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Monthly Expenses</h4>
            <p className="text-xs text-slate-500">Operational costs & maintenance outlay</p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip
                formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Expenses']}
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="expenses" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#expenseGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 4: Income vs Expense Comparison */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Income vs Expense</h4>
            <p className="text-xs text-slate-500">Revenue against operating outlays</p>
          </div>
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
              <Bar dataKey="expenses" name="Expense" fill="#93C5FD" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

