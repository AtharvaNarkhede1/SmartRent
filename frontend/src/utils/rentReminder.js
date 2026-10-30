export function normalizeWhatsAppPhone(value, defaultCountryCode = '91') {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 10) digits = `${defaultCountryCode}${digits}`;
  if (digits.length < 10 || digits.length > 15) throw new RangeError('Enter a valid phone number with country code.');
  return digits;
}

export function isValidUpiId(value) {
  return /^[A-Za-z0-9._-]{2,256}@[A-Za-z0-9.-]{2,64}$/.test(String(value || '').trim());
}

export function buildUpiPaymentUri({ upiId, accountHolder, amount, reference }) {
  if (!isValidUpiId(upiId)) throw new TypeError('Configure a valid UPI ID to generate a payment QR.');
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) throw new RangeError('QR amount must be greater than zero.');
  const params = new URLSearchParams({ pa: upiId.trim(), am: numericAmount.toFixed(2), cu: 'INR' });
  if (accountHolder?.trim()) params.set('pn', accountHolder.trim());
  if (reference) params.set('tn', String(reference).slice(0, 80));
  return `upi://pay?${params.toString()}`;
}

export async function createUpiPaymentQr({ upiId, accountHolder, amount, reference }) {
  const QRCode = (await import('qrcode')).default;
  return QRCode.toDataURL(buildUpiPaymentUri({ upiId, accountHolder, amount, reference }), {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 320,
    color: { dark: '#0f172a', light: '#ffffff' }
  });
}

export function getPublicPaymentQrUrl(qrCodeImage, apiBase = import.meta.env?.VITE_API_BASE_URL || 'http://127.0.0.1:5001/api') {
  if (!qrCodeImage || qrCodeImage.startsWith('data:')) return '';
  let url;
  try {
    url = new URL(qrCodeImage, `${new URL(apiBase).origin}/`);
    const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
    return url.protocol === 'https:' && !isLocalHost ? url.href : '';
  } catch {
    return '';
  }
}

export function buildRentReminderMessage({ name, roomNumber, propertyName, amount, dueDate, upiId, accountHolder, qrCodeUrl, paymentInstructions }) {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) throw new RangeError('Reminder amount must be greater than zero.');
  const reference = [propertyName, roomNumber ? `Room ${roomNumber}` : ''].filter(Boolean).join(' · ');
  let upiLink = '';
  if (isValidUpiId(upiId)) {
    upiLink = `UPI ID: ${upiId.trim()}\nPay with amount prefilled: ${buildUpiPaymentUri({ upiId, accountHolder, amount: numericAmount, reference })}`;
  }
  const details = [upiLink, qrCodeUrl ? `Payment QR: ${qrCodeUrl}` : '', paymentInstructions || ''].filter(Boolean).join('\n\n');
  const paymentHelp = details || 'Please contact the property manager for payment instructions.';
  const paymentPrompt = isValidUpiId(upiId)
    ? 'Please complete the payment using the amount-prefilled UPI link or payment instructions below.'
    : 'Please follow the payment instructions below.';
  const rentDetails = `This is a reminder that your rent payment of ₹${numericAmount.toLocaleString('en-IN')}${reference ? ` for ${reference}` : ''}${dueDate ? ` is due on ${dueDate}.` : ' is outstanding.'}`;
  return `Hello ${name || 'Tenant'},\n\n${rentDetails}\n\n${paymentPrompt}\n\n${paymentHelp}\n\nAfter making the payment, please share the transaction reference or payment confirmation.\n\nThank you,\nSmartRent Management`;
}

export function buildWhatsAppUrl(phone, message) {
  return `https://wa.me/${normalizeWhatsAppPhone(phone)}?text=${encodeURIComponent(message)}`;
}
