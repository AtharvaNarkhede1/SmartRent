import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  Calendar,
  Building,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { ReceiptPrintModal } from '../components/modals/ReceiptPrintModal';
import { useSmartRent } from '../context/SmartRentContext';
import { downloadReceiptPDF, printReceipt } from '../utils/receiptPdf';

export const Receipts = () => {
  const { onOpenModal } = useOutletContext();
  const { receipts, properties, settings, ownerProfile, addToast } = useSmartRent();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('All');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const filteredReceipts = receipts.filter((r) => {
    const matchesSearch =
      r.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProperty = selectedProperty === 'All' || r.propertyName === selectedProperty;
    return matchesSearch && matchesProperty;
  });

  const handleDownload = (rc) => {
    downloadReceiptPDF(rc, settings, ownerProfile);
    addToast(`Downloaded PDF receipt: ${rc.receiptNumber}`);
  };

  const handlePrint = (rc) => {
    printReceipt(rc, settings, ownerProfile);
    addToast(`Opening print dialog for: ${rc.receiptNumber}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Receipts & Invoices</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, preview, print, and download official rent receipts and tax vouchers.
          </p>
        </div>

        <button
          onClick={() => onOpenModal('addPayment')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Receipt</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search receipt #, tenant name, or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
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
      </div>

      {/* Receipts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReceipts.map((rc) => (
          <div
            key={rc.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-mono font-bold text-xs text-slate-800">{rc.receiptNumber}</h3>
                    <p className="text-[11px] text-slate-400">Date: {rc.date}</p>
                  </div>
                </div>
                <StatusBadge status={rc.status} />
              </div>

              {/* Resident & Room details */}
              <div className="py-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Resident:</span>
                  <span className="font-bold text-slate-900">{rc.tenantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Property:</span>
                  <span className="text-slate-700 font-semibold">{rc.propertyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Unit:</span>
                  <span className="text-blue-600 font-semibold">{rc.roomNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Payment Mode:</span>
                  <span className="text-slate-600">{rc.paymentMethod}</span>
                </div>
              </div>

              {/* Amount badge */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-baseline justify-between">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Amount Paid</span>
                <span className="text-lg font-extrabold text-blue-700">₹{Number(rc.amount).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Actions: View, Print, Download */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => setSelectedReceipt(rc)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs hover:shadow transition-all"
                title="View Receipt"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </button>

              <button
                onClick={() => handlePrint(rc)}
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors"
                title="Print Receipt"
              >
                <Printer className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDownload(rc)}
                className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-200 rounded-lg transition-colors"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptPrintModal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        receipt={selectedReceipt}
      />
    </div>
  );
};
