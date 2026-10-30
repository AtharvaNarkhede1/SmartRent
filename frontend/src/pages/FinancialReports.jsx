import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  ArrowDownRight,
  PieChart as PieIcon,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Calendar,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { StatCard } from '../components/common/StatCard';
import { useSmartRent } from '../context/SmartRentContext';

export const FinancialReports = () => {
  const { properties, rooms, rentLedger, addToast } = useSmartRent();
  const [reportType, setReportType] = useState('Monthly Financial Report');
  const [selectedProperty, setSelectedProperty] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('March');
  const [selectedYear, setSelectedYear] = useState('2026');

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
                                 .reduce((sum, r) => sum + (r.rent || 0), 0);

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const expectedVal = currentExpected || 50000;
      data.push({
        month: d.toLocaleString('default', { month: 'short' }),
        expected: expectedVal,
        collected: paymentsByMonth[key] || 0,
        expenses: Math.round(expectedVal * 0.2),
      });
    }
    return data;
  }, [rentLedger, rooms]);

  const propertyPerformanceDataDynamic = React.useMemo(() => {
    return properties.map(p => {
      const pRooms = rooms.filter(r => r.propertyId === p.id);
      const revenue = pRooms.filter(r => r.status === 'Occupied' || r.status === 'Partial').reduce((sum, r) => sum + r.rent, 0);
      const occupancy = pRooms.length > 0 ? Math.round((pRooms.filter(r => r.status === 'Occupied' || r.status === 'Partial').length / pRooms.length) * 100) : 0;
      return {
        name: p.name,
        revenue: revenue,
        expense: Math.round(revenue * 0.2),
        occupancy: occupancy
      };
    });
  }, [properties, rooms]);

  const expenseBreakdownDynamic = [
    { name: 'Maintenance', value: 35000, color: '#3B82F6' },
    { name: 'Utilities', value: 20000, color: '#10B981' },
    { name: 'Staff Salaries', value: 15000, color: '#F59E0B' },
    { name: 'Taxes', value: 7000, color: '#6366F1' }
  ];

  const handleExportPDF = () => {
    addToast('Generating PDF statement: SmartRent_Q1_2026_Report.pdf', 'info');
  };

  const handleExportExcel = () => {
    addToast('Exported Excel Spreadsheet: SmartRent_Financials.xlsx', 'info');
  };

  const handleGenerateReport = () => {
    addToast(`Generated report for: ${reportType} (${selectedMonth} ${selectedYear})`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Financial Reports</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Analyze your property business performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleGenerateReport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Top 4 Statistics with Specified % Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Monthly Revenue"
          value="₹2,60,000"
          description="Gross lease receipts"
          trend="+11.4%"
          trendType="positive"
        />
        <StatCard
          icon={ArrowDownRight}
          label="Monthly Expenses"
          value="₹77,000"
          description="Utilities & operations"
          trend="-2.5%"
          trendType="positive" // less expenses is good
        />
        <StatCard
          icon={BarChart3}
          label="Net Profit"
          value="₹1,83,000"
          description="EBITDA contribution"
          trend="+14.8%"
          trendType="positive"
        />
        <StatCard
          icon={PieIcon}
          label="Occupancy Rate"
          value="70%"
          description="Weighted portfolio avg"
          trend="+5.2%"
          trendType="positive"
        />
      </div>

      {/* Filters Bar: Property, Report Type, Month, Year, Date Range */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-3">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 bg-white text-slate-800 font-semibold"
          >
            <option>Monthly Financial Report</option>
            <option>Rent Collection Report</option>
            <option>Property Performance Report</option>
            <option>Expense Report</option>
            <option>Tenant Payment Report</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Property</label>
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 bg-white text-slate-700"
          >
            <option value="All">All Properties</option>
            {properties.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Billing Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 bg-white text-slate-700"
          >
            <option>January</option>
            <option>February</option>
            <option>March</option>
            <option>April</option>
            <option>May</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Fiscal Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 bg-white text-slate-700"
          >
            <option>2026</option>
            <option>2025</option>
          </select>
        </div>
      </div>

      {/* 4 Financial Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Property Performance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Property Performance</h4>
              <p className="text-xs text-slate-500">Gross revenue vs expenses per building</p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              Per Property
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={propertyPerformanceDataDynamic} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="revenue" name="Revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#93C5FD" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Expense Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Expense Breakdown</h4>
              <p className="text-xs text-slate-500">Operational allocation across cost categories</p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              ₹77,000 Total
            </span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdownDynamic}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {expenseBreakdownDynamic.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Revenue vs Expense */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Revenue vs Expense Trend</h4>
              <p className="text-xs text-slate-500">Trailing quarterly margin evolution</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="expected" name="Gross Revenue" stroke="#2563EB" strokeWidth={2.5} />
                <Line type="monotone" dataKey="expenses" name="Operational Cost" stroke="#93C5FD" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Occupancy Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Occupancy Distribution</h4>
              <p className="text-xs text-slate-500">Unit capacity saturation across properties</p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              70% Average
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={propertyPerformanceDataDynamic} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Occupancy']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Bar dataKey="occupancy" name="Occupancy %" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
