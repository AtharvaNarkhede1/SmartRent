import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ReceiptIndianRupee,
  CheckCircle2,
  Clock,
  AlertTriangle,
  QrCode,
  Download,
  Printer,
  Search,
  Filter,
  RotateCcw,
  Plus,
  FileText,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Trash2,
  Pencil
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { ReceiptPrintModal } from '../components/modals/ReceiptPrintModal';
import { EditPaymentModal } from '../components/modals/EditPaymentModal';
import { useSmartRent } from '../context/SmartRentContext';
import { downloadReceiptPDF, printReceipt } from '../utils/receiptPdf';

export const RentLedger = () => {
  const { onOpenModal } = useOutletContext();
  const { rentLedger, properties, tenants, settings, ownerProfile, addToast, dashboardStats, deleteRentPayment } = useSmartRent();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);

  const itemsPerPage = 6;

  const totalPaid = dashboardStats?.payments?.totalPaid || 0;
  const totalPending = dashboardStats?.payments?.totalPending || 0;
  const totalExpected = totalPaid + totalPending;
  const collectionRate = totalExpected === 0 ? 0 : Math.round((totalPaid / totalExpected) * 100);
  const pendingTenants = tenants.filter((tenant) => tenant.isActive !== false && tenant.paymentStatus !== 'Paid').length;

  // Filter records
  const filteredLedger = rentLedger.filter((item) => {
    const matchesSearch =
      item.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.property.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProperty = selectedProperty === 'All' || item.property === selectedProperty;
    const matchesStatus = selectedStatus === 'All' || item.paymentStatus === selectedStatus;

    return matchesSearch && matchesProperty && matchesStatus;
  });

  const totalPages = Math.ceil(filteredLedger.length / itemsPerPage) || 1;
  const paginatedRecords = filteredLedger.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleReset = () => {
    setSearchTerm('');
    setSelectedProperty('All');
    setSelectedStatus('All');
    setCurrentPage(1);
  };

  const getReceiptObj = (item) => ({
    receiptNumber: item.receiptNumber,
    date: item.paymentDate || item.dueDate || '',
    tenantName: item.tenantName,
    tenantPhone: item.tenantPhone || '',
    propertyName: item.property,
    roomNumber: item.room,
    period: item.billingPeriod || item.invoiceMonth || '',
    amount: item.paidAmount || item.rentAmount,
    paymentMethod: item.paymentMethod || '',
    transactionId: item.transactionRef,
    status: item.paymentStatus
  });

  const handlePrintReceipt = (item) => {
    const rc = getReceiptObj(item);
    printReceipt(rc, settings, ownerProfile);
    addToast(`Preparing receipt for printing: ${rc.receiptNumber}`);
  };

  const handleDownloadPDF = (item) => {
    const rc = getReceiptObj(item);
    downloadReceiptPDF(rc, settings, ownerProfile);
    addToast(`Downloaded PDF receipt: ${rc.receiptNumber}`);
  };

  const handleExportCSV = () => {
    const headers = ['Receipt #', 'Tenant', 'Property', 'Room', 'Rent', 'Due Date', 'Status', 'Paid Date', 'Method'];
    const rows = filteredLedger.map((r) => [
      r.receiptNumber,
      r.tenantName,
      r.property,
      r.room,
      r.rentAmount,
      r.dueDate,
      r.paymentStatus,
      r.paymentDate || 'N/A',
      r.paymentMethod
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RentSmart_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Ledger exported to CSV successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Rent Ledger</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track all rent payments, pending amounts, and transaction history.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => onOpenModal('configureQr')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>Configure Payment & QR</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Ledger</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards & Collection Rate Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard
          icon={ReceiptIndianRupee}
          label="Total Rent Expected"
          value={`₹${((dashboardStats?.payments?.totalPaid || 0) + (dashboardStats?.payments?.totalPending || 0)).toLocaleString('en-IN')}`}
          description="Total rolled"
        />
        <StatCard
          icon={CheckCircle2}
          label="Rent Collected"
          value={`₹${(dashboardStats?.payments?.totalPaid || 0).toLocaleString('en-IN')}`}
          description="Reconciled accounts"
          trend="Realtime"
          trendType="positive"
        />
        <StatCard
          icon={Clock}
          label="Pending Rent"
          value={`₹${(dashboardStats?.payments?.totalPending || 0).toLocaleString('en-IN')}`}
          description="Awaiting remittance"
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue Payments"
          value={pendingTenants}
          description="Active tenants with rent due"
          trend={`${pendingTenants} tenants`}
          trendType="negative"
        />

        {/* Collection Rate Progress Meter */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Collection Rate
              </span>
              <span className="text-sm font-bold text-blue-600">{collectionRate}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden mt-2">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${collectionRate}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            ₹{totalPaid.toLocaleString('en-IN')} collected of ₹{totalExpected.toLocaleString('en-IN')} billed this month.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tenant, room, property, or receipt #..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedProperty}
            onChange={(e) => {
              setSelectedProperty(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 bg-white text-slate-700"
          >
            <option value="All">All Properties</option>
            {properties.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 bg-white text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
            <option value="Partial">Partial</option>
          </select>

          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenModal('addPayment')}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-all ml-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Tenant Name</th>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-4">Rent Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4">Payment Date</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900">{item.tenantName}</span>
                    <span className="block text-[10px] text-slate-400 font-mono">{item.receiptNumber}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{item.property}</td>
                  <td className="py-3.5 px-4 text-slate-600">{item.room}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    ₹{item.rentAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{item.dueDate}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.paymentStatus} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {item.paymentDate || <span className="text-slate-400">—</span>}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-medium">
                      {item.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewingReceipt(getReceiptObj(item))}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        title="View Full Receipt"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="hidden xl:inline">View</span>
                      </button>

                      <button
                        onClick={() => handlePrintReceipt(item)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors"
                        title="Print Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDownloadPDF(item)}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-200 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setEditingPayment(item)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors"
                        title="Correct payment details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`Delete payment of ₹${item.paidAmount} for ${item.tenantName}?`)) {
                            deleteRentPayment(item.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors"
                        title="Delete Payment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredLedger.length)} of {filteredLedger.length} records
          </span>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 py-0.5 text-xs font-semibold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptPrintModal
        isOpen={Boolean(viewingReceipt)}
        onClose={() => setViewingReceipt(null)}
        receipt={viewingReceipt}
      />
      <EditPaymentModal payment={editingPayment} onClose={() => setEditingPayment(null)} />
    </div>
  );
};
