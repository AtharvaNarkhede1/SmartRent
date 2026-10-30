import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRentReminderMessage, buildWhatsAppUrl, buildUpiPaymentUri, createUpiPaymentQr, getPublicPaymentQrUrl, isValidUpiId, normalizeWhatsAppPhone } from './rentReminder.js';

test('normalizes Indian tenant phone numbers and preserves explicit international country codes', () => {
  assert.equal(normalizeWhatsAppPhone('+91 98765 43210'), '919876543210');
  assert.equal(normalizeWhatsAppPhone('98765-43210'), '919876543210');
  assert.equal(normalizeWhatsAppPhone('+44 20 7946 0958'), '442079460958');
  assert.throws(() => normalizeWhatsAppPhone('123'), RangeError);
});

test('builds a reminder with the supplied amount, due date, rent reference, and payment instructions', () => {
  const message = buildRentReminderMessage({ name: 'Asha Rao', roomNumber: 'B-12', amount: 1250, dueDate: '2026-10-05', upiId: 'owner@example', accountHolder: 'Owner Name' });
  assert.match(message, /Asha Rao/);
  assert.match(message, /B-12/);
  assert.match(message, /₹1,250/);
  assert.match(message, /2026-10-05/);
  const payLink = message.match(/upi:\/\/pay\?\S+/)?.[0];
  const payParams = new URL(payLink.replace('upi://pay', 'https://upi.invalid')).searchParams;
  assert.equal(payParams.get('pa'), 'owner@example');
  assert.equal(payParams.get('pn'), 'Owner Name');
  assert.equal(payParams.get('am'), '1250.00');
  assert.equal(payParams.get('cu'), 'INR');
  assert.equal(payParams.get('tn'), 'Room B-12');
  assert.match(message, /transaction reference or payment confirmation/);
});

test('creates a click-to-chat URL with an encoded message and rejects zero-balance reminders', () => {
  const message = 'Balance: INR 500\nDue: 2026-10-05';
  const link = new URL(buildWhatsAppUrl('9876543210', message));
  assert.equal(link.hostname, 'wa.me');
  assert.equal(link.pathname, '/919876543210');
  assert.equal(link.searchParams.get('text'), message);
  assert.throws(() => buildRentReminderMessage({ name: 'Asha', amount: 0, dueDate: '2026-10-05' }), RangeError);
});

test('creates a valid amount-specific UPI payment QR with payee and optional rent reference', async () => {
  assert.equal(isValidUpiId('owner@example'), true);
  assert.equal(isValidUpiId('not-a-upi-id'), false);
  const paymentUri = buildUpiPaymentUri({ upiId: 'owner@example', accountHolder: 'Owner Name', amount: 900, reference: 'Flat 2 · Room B-12' });
  const params = new URL(paymentUri.replace('upi://pay', 'https://upi.invalid')).searchParams;
  assert.equal(params.get('pa'), 'owner@example');
  assert.equal(params.get('pn'), 'Owner Name');
  assert.equal(params.get('am'), '900.00');
  assert.equal(params.get('cu'), 'INR');
  assert.equal(params.get('tn'), 'Flat 2 · Room B-12');
  const dataUrl = await createUpiPaymentQr({ upiId: 'owner@example', accountHolder: 'Owner Name', amount: 900, reference: 'Room B-12' });
  assert.match(dataUrl, /^data:image\/png;base64,/);
  assert.throws(() => buildUpiPaymentUri({ upiId: 'not-upi', amount: 900 }), /valid UPI ID/);
});

test('builds one complete message and handles missing due dates and payment configuration clearly', () => {
  const message = buildRentReminderMessage({ name: 'Asha Rao', propertyName: 'Lotus Homes', roomNumber: 'B-12', amount: 900, paymentInstructions: 'Share the transaction reference after paying.' });
  assert.match(message, /rent payment of ₹900 for Lotus Homes · Room B-12/);
  assert.match(message, /₹900/);
  assert.doesNotMatch(message, /due on undefined/);
  assert.match(message, /Share the transaction reference after paying\./);
  assert.doesNotMatch(message, /amount-prefilled UPI link/);
  assert.match(message, /Thank you,\nSmartRent Management/);
  const missingPaymentConfig = buildRentReminderMessage({ name: 'Asha Rao', amount: 900 });
  assert.match(missingPaymentConfig, /contact the property manager for payment instructions/);
});

test('adds a public QR image link only when one is safely shareable', () => {
  const message = buildRentReminderMessage({ name: 'Asha Rao', amount: 900, upiId: 'owner@example', accountHolder: 'Owner Name', qrCodeUrl: 'https://rent.example/uploads/qr.png', paymentInstructions: 'Use room B-12 as the payment note.' });
  assert.match(message, /Payment QR: https:\/\/rent\.example\/uploads\/qr\.png/);
  assert.match(message, /Use room B-12 as the payment note\./);
});

test('only publishes QR links when the QR is hosted on a public HTTPS origin', () => {
  assert.equal(getPublicPaymentQrUrl('/uploads/qr.png', 'https://api.rent.example/api'), 'https://api.rent.example/uploads/qr.png');
  assert.equal(getPublicPaymentQrUrl('/uploads/qr.png', 'http://127.0.0.1:5000/api'), '');
  assert.equal(getPublicPaymentQrUrl('data:image/png;base64,abc', 'https://api.rent.example/api'), '');
});
