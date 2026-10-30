import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { useSmartRent } from '../../context/SmartRentContext';
import { MessageSquare, QrCode } from 'lucide-react';
import { buildRentReminderMessage, createUpiPaymentQr, isValidUpiId } from '../../utils/rentReminder';

const formatDueDate = (value) => {
  if (!value) return '';
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const SendReminderModal = ({ isOpen, onClose, onConfigure, reminder }) => {
  const { sendReminder, settings } = useSmartRent();
  const [message, setMessage] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrError, setQrError] = useState('');
  const [sending, setSending] = useState(false);

  const amount = Number(reminder?.remainingAmount || 0);
  const dueDate = formatDueDate(reminder?.dueDate);
  const reference = [reminder?.propertyName, reminder?.roomNumber ? `Room ${reminder.roomNumber}` : ''].filter(Boolean).join(' · ');

  useEffect(() => {
    let active = true;
    setQrDataUrl('');
    setQrError('');
    if (!reminder || !isValidUpiId(settings.upiId) || amount <= 0) return () => { active = false; };
    createUpiPaymentQr({ upiId: settings.upiId, accountHolder: settings.accountHolder, amount, reference })
      .then((dataUrl) => { if (active) setQrDataUrl(dataUrl); })
      .catch(() => { if (active) setQrError('Could not generate the payment QR.'); });
    return () => { active = false; };
  }, [reminder, settings.upiId, settings.accountHolder, amount, reference]);

  useEffect(() => {
    if (!reminder) return;
    setMessage(buildRentReminderMessage({
      name: reminder.tenantName,
      roomNumber: reminder.roomNumber,
      propertyName: reminder.propertyName,
      amount,
      dueDate,
      upiId: settings.upiId,
      accountHolder: settings.accountHolder,
      paymentInstructions: settings.paymentInstructions
    }));
  }, [reminder, amount, dueDate, settings.upiId, settings.accountHolder, settings.paymentInstructions]);

  if (!reminder) return null;

  const handleCopyQrAndOpenWhatsApp = async () => {
    if (!qrDataUrl || !navigator.clipboard?.write || typeof ClipboardItem === 'undefined' || sending) return;
    const whatsappWindow = window.open('', '_blank');
    if (!whatsappWindow) {
      window.alert('Allow pop-ups to open WhatsApp.');
      return;
    }
    setSending(true);
    try {
      const bytes = Uint8Array.from(atob(qrDataUrl.split(',')[1]), (character) => character.charCodeAt(0));
      const image = new Blob([bytes], { type: 'image/png' });
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': image })]);
      const opened = await sendReminder(reminder.rawTenant, amount, message, whatsappWindow);
      if (opened) onClose();
      else whatsappWindow.close();
    } catch (error) {
      whatsappWindow.close();
      window.alert(error.name === 'NotAllowedError' ? 'Clipboard access was blocked. Allow clipboard access, then try again.' : (error.message || 'Could not copy the QR image.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={sending ? () => {} : onClose} title="Review rent reminder" subtitle="Check the balance, payment QR, and complete WhatsApp message before opening the tenant’s chat." maxWidth="max-w-2xl">
      <div className="space-y-4">
        <section className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <div>
            <p className="font-semibold text-slate-900">{reminder.tenantName}</p>
            <p className="mt-0.5 text-xs text-slate-600">{reminder.tenantPhone || 'No phone number on file'}</p>
            {reference && <p className="mt-1 text-xs text-slate-500">{reference}</p>}
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase text-slate-500">Outstanding</p>
            <p className="font-semibold text-emerald-800">₹{amount.toLocaleString('en-IN')}</p>
            <p className="mt-0.5 text-xs text-slate-600">{dueDate ? `Due ${dueDate}` : 'No due date set'}</p>
          </div>
        </section>

        <section className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-start">
          <div className="grid h-36 w-36 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white p-2">
            {qrDataUrl ? <img src={qrDataUrl} alt={`UPI QR for ₹${amount.toLocaleString('en-IN')}`} className="h-full w-full object-contain" /> : <QrCode className="h-10 w-10 text-slate-300" />}
          </div>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-xs font-semibold text-slate-900">Amount-specific UPI payment QR</p>
            {isValidUpiId(settings.upiId) ? <>
              <p className="mt-1 break-all font-mono text-xs text-slate-600">{settings.upiId}</p>
              <p className="mt-1 text-xs text-slate-600">Payee: {settings.accountHolder || 'Name not configured'} · Amount: ₹{amount.toLocaleString('en-IN')}</p>
              <p className="mt-2 text-[11px] leading-4 text-slate-500">Click the button below, then press Ctrl+V in the tenant’s WhatsApp chat to paste the QR before sending.</p>
              {typeof navigator !== 'undefined' && (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') && <p className="mt-1 text-[11px] text-amber-700">This browser does not allow copying images. Open SmartRent in a secure browser to use this action.</p>}
              {qrError && <p role="alert" className="mt-2 text-xs text-rose-700">{qrError}</p>}
            </> : <>
              <p className="mt-2 text-xs text-amber-800">No valid UPI ID is configured, so an amount-specific QR cannot be generated.</p>
              <button type="button" onClick={onConfigure} className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100">Configure UPI details</button>
            </>}
          </div>
        </section>

        <label className="block text-xs font-medium text-slate-700">Combined message preview
          <textarea rows={9} value={message} onChange={(event) => setMessage(event.target.value)} className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 p-3 text-sm leading-relaxed text-slate-700" />
        </label>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
          <button type="button" onClick={onClose} disabled={sending} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
          {qrDataUrl && <button type="button" onClick={handleCopyQrAndOpenWhatsApp} disabled={sending || !reminder.tenantPhone || !message.trim() || typeof navigator === 'undefined' || !navigator.clipboard?.write || typeof ClipboardItem === 'undefined'} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"><MessageSquare size={15} />{sending ? 'Copying QR…' : 'Copy QR + Open WhatsApp'}</button>}
        </div>
        <p className="text-right text-[11px] text-slate-500">Opening WhatsApp is logged as opened, not sent. Rent is not marked paid.</p>
      </div>
    </Modal>
  );
};
