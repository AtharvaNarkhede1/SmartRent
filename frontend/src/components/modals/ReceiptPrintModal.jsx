import React from 'react';
import { Modal } from '../common/Modal';
import { Printer, Download, CheckCircle, Building, QrCode } from 'lucide-react';
import { useSmartRent } from '../../context/SmartRentContext';
import { downloadReceiptPDF, printReceipt } from '../../utils/receiptPdf';

export const ReceiptPrintModal = ({ isOpen, onClose, receipt }) => {
  const { settings, ownerProfile, addToast } = useSmartRent();

  if (!receipt) return null;

  const handlePrint = () => {
    printReceipt(receipt, settings, ownerProfile);
    addToast(`Opening print dialog for ${receipt.receiptNumber || 'Receipt'}`);
  };

  const handleDownload = () => {
    downloadReceiptPDF(receipt, settings, ownerProfile);
    addToast(`Downloaded PDF receipt: ${receipt.receiptNumber || 'Receipt'}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Rent Receipt"
      subtitle={`Receipt Reference: ${receipt.receiptNumber}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Printable Area */}
        <div
          id="printable-receipt"
          className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 text-slate-800 font-sans shadow-xs"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">SmartRent Properties</h2>
                <p className="text-xs text-slate-500">Official Rent Collection & E-Invoice</p>
                <p className="text-[11px] text-slate-400">GSTIN / Reg: 27AABCS1429B1Z8</p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
                <CheckCircle className="w-3.5 h-3.5" /> PAID
              </div>
              <p className="text-xs font-mono font-bold text-slate-700">{receipt.receiptNumber}</p>
              <p className="text-xs text-slate-500">Date: {receipt.date}</p>
            </div>
          </div>

          {/* Billing metadata */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Tenant / Resident
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1">{receipt.tenantName}</p>
              <p className="text-slate-600 mt-0.5">{receipt.tenantPhone}</p>
              <p className="text-slate-600 font-medium mt-1">
                {receipt.propertyName} — {receipt.roomNumber}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Payment Details
              </span>
              <p className="text-slate-700 mt-1">
                <span className="font-semibold text-slate-900">Period:</span> {receipt.period}
              </p>
              <p className="text-slate-700">
                <span className="font-semibold text-slate-900">Method:</span> {receipt.paymentMethod}
              </p>
              <p className="text-slate-700 font-mono text-[11px]">
                <span className="font-semibold text-slate-900">Txn Ref:</span> {receipt.transactionId || 'UPI-VERIFIED'}
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4">Billing Cycle</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    Monthly Room Rent & Maintenance ({receipt.roomNumber})
                  </td>
                  <td className="py-3 px-4 text-slate-500">{receipt.period}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    ₹{Number(receipt.amount).toLocaleString('en-IN')}.00
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-slate-500 text-[11px]">Common Area Maintenance & Wi-Fi</td>
                  <td className="py-2 px-4 text-slate-500 text-[11px]">Included</td>
                  <td className="py-2 px-4 text-right text-slate-500 text-[11px]">₹0.00</td>
                </tr>
              </tbody>
              <tfoot className="bg-blue-50/50 border-t border-slate-200">
                <tr>
                  <td colSpan="2" className="py-3 px-4 font-bold text-slate-900 text-right">
                    Total Amount Received:
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-base text-blue-700">
                    ₹{Number(receipt.amount).toLocaleString('en-IN')}.00
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer & Signature */}
          <div className="flex items-end justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
            <div>
              <p className="font-semibold text-slate-700">Payment Status: Confirmed & Reconciled</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                This is a computer-generated digital receipt. No physical signature required.
              </p>
            </div>

            <div className="text-center">
              <div className="w-28 border-b border-slate-300 pb-1 mb-1 font-serif italic text-blue-700">
                {settings.accountHolder || 'Not configured'}
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Authorized Signatory</p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Download PDF
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs hover:shadow transition-all"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
