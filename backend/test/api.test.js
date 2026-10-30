const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

test('authenticated CRUD, rent balances, settings, and related records persist in an isolated database', { timeout: 60000 }, async (t) => {
  const env = dotenv.parse(fs.readFileSync(path.join(__dirname, '..', '.env')));
  const sourceUri = process.env.MONGO_URI || env.MONGO_URI;
  if (!sourceUri) throw new Error('MONGO_URI is missing from the local backend environment.');
  const dbName = `smartrent_test_${Date.now()}_${process.pid}`;
  const testUri = sourceUri.replace(/^(mongodb(?:\+srv)?:\/\/[^/?]+)(?:\/[^?]*)?/, `$1/${dbName}`);
  const parsedUri = new URL(testUri);
  assert.match(parsedUri.pathname, new RegExp(`^/${dbName}$`), 'integration tests must use a dedicated scratch database');

  process.env.JWT_SECRET = process.env.JWT_SECRET || env.JWT_SECRET;
  const app = require('../app');
  let server;
  let base;
  let authToken;
  try {
    await mongoose.connect(testUri, { serverSelectionTimeoutMS: 8000 });
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    base = `http://127.0.0.1:${server.address().port}/api`;
    const request = async (route, options = {}) => {
      const response = await fetch(`${base}${route}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}), ...options.headers },
        body: options.body === undefined ? undefined : JSON.stringify(options.body)
      });
      const data = await response.json();
      return { status: response.status, data };
    };

    await t.test('auth protects records and existing admin registration/login paths work', async () => {
      assert.equal((await request('/properties')).status, 401);
      const credentials = { name: 'RentSmart Integration Check', email: `codex-${Date.now()}@example.invalid`, password: `test-${Date.now()}-secret` };
      const registered = await request('/auth/register', { method: 'POST', body: credentials });
      assert.equal(registered.status, 201);
      assert.equal((await request('/auth/register', { method: 'POST', body: { ...credentials, email: `second-${Date.now()}@example.invalid` } })).status, 403);
      const loggedIn = await request('/auth/login', { method: 'POST', body: { email: credentials.email, password: credentials.password } });
      assert.equal(loggedIn.status, 200);
      assert.ok(loggedIn.data.token);
      authToken = loggedIn.data.token;
      const changedProfile = await request('/auth/profile', { method: 'PUT', token: authToken, body: { name: credentials.name, email: `updated-${credentials.email}` } });
      assert.equal(changedProfile.status, 200);
      assert.equal(changedProfile.data.data.email, `updated-${credentials.email}`);
      assert.equal((await request('/auth/password', { method: 'PUT', token: authToken, body: { currentPassword: credentials.password, newPassword: 'short' } })).status, 400);
      assert.equal((await request('/auth/password', { method: 'PUT', token: authToken, body: { currentPassword: 'incorrect-password', newPassword: 'new-secure-test-password' } })).status, 401);
      assert.equal((await request('/auth/password', { method: 'PUT', token: authToken, body: { currentPassword: credentials.password, newPassword: 'new-secure-test-password' } })).status, 200);
      const changedLogin = await request('/auth/login', { method: 'POST', body: { email: `updated-${credentials.email}`, password: 'new-secure-test-password' } });
      assert.equal(changedLogin.status, 200);
    });

    const auth = (route, options = {}) => request(route, { ...options, token: authToken });
    let propertyId;
    let roomA;
    let roomB;
    let tenantId;
    let paymentA;
    let paymentB;
    const period = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    await t.test('property and room create/read/update/delete preserve relationships', async () => {
      const created = await auth('/properties', { method: 'POST', body: { name: 'Test House', address: 'Test Street', type: 'Apartment', floors: 2 } });
      assert.equal(created.status, 201);
      propertyId = created.data.data._id;
      assert.equal((await auth(`/properties/${propertyId}`)).status, 200);
      const updated = await auth(`/properties/${propertyId}`, { method: 'PUT', body: { name: 'Updated Test House' } });
      assert.equal(updated.data.data.name, 'Updated Test House');
      const firstRoom = await auth('/rooms', { method: 'POST', body: { roomNumber: 'T-1', type: 'Single', rent: 1000, property: propertyId } });
      const secondRoom = await auth('/rooms', { method: 'POST', body: { roomNumber: 'T-2', type: 'Single', rent: 1000, property: propertyId } });
      assert.equal(firstRoom.status, 201);
      assert.equal(secondRoom.status, 201);
      roomA = firstRoom.data.data._id;
      roomB = secondRoom.data.data._id;
      assert.equal((await auth('/rooms', { method: 'POST', body: { roomNumber: 'T-1', type: 'Single', rent: 1000, property: propertyId } })).status, 400);
      const changedRoom = await auth(`/rooms/${roomA}`, { method: 'PUT', body: { rent: 1200 } });
      assert.equal(changedRoom.data.data.rent, 1200);
      assert.equal((await auth(`/properties/${propertyId}`, { method: 'DELETE' })).status, 409);
    });

    await t.test('tenant create, image update, room reassignment, and payment-backed delete protection', async () => {
      const created = await auth('/tenants', { method: 'POST', body: { name: 'Test Tenant', phone: '9876543210', rent: 1000, address: 'Test Address', room: roomA, avatar: '/uploads/test-avatar.png', dueDay: 5 } });
      assert.equal(created.status, 201);
      tenantId = created.data.data._id;
      assert.equal(created.data.data.avatar, '/uploads/test-avatar.png');
      assert.equal((await auth('/rooms')).data.data.find((room) => room._id === roomA).tenantAssigned._id, tenantId);
      const changed = await auth(`/tenants/${tenantId}`, { method: 'PUT', body: { room: roomB, avatar: '/uploads/updated-avatar.png' } });
      assert.equal(changed.status, 200);
      assert.equal(changed.data.data.room._id, roomB);
      assert.equal(changed.data.data.avatar, '/uploads/updated-avatar.png');
      const rooms = (await auth('/rooms')).data.data;
      assert.equal(rooms.find((room) => room._id === roomA).tenantAssigned, null);
      assert.equal(rooms.find((room) => room._id === roomB).tenantAssigned._id, tenantId);
    });

    await t.test('manual partial payments persist and balances update consistently', async () => {
      const tooMuch = await auth('/payments', { method: 'POST', body: { tenant: tenantId, amount: 1001, billingPeriod: period, paymentDate: new Date().toISOString(), paymentMethod: 'UPI' } });
      assert.equal(tooMuch.status, 400);
      const first = await auth('/payments', { method: 'POST', body: { tenant: tenantId, room: roomB, property: propertyId, amount: 400, billingPeriod: period, paymentDate: new Date().toISOString(), dueDate: new Date().toISOString(), paymentMethod: 'UPI', transactionId: 'test-ref-a', notes: 'first installment' } });
      assert.equal(first.status, 201);
      paymentA = first.data.data._id;
      assert.equal(first.data.balance, 600);
      let tenants = (await auth('/tenants')).data.data;
      assert.equal(tenants.find((tenant) => tenant._id === tenantId).currentBalance, 600);
      assert.equal(tenants.find((tenant) => tenant._id === tenantId).paymentStatus, 'Partial');
      const second = await auth('/payments', { method: 'POST', body: { tenant: tenantId, room: roomB, property: propertyId, amount: 600, billingPeriod: period, paymentDate: new Date().toISOString(), paymentMethod: 'Cash' } });
      assert.equal(second.status, 201);
      paymentB = second.data.data._id;
      tenants = (await auth('/tenants')).data.data;
      assert.equal(tenants.find((tenant) => tenant._id === tenantId).currentBalance, 0);
      assert.equal(tenants.find((tenant) => tenant._id === tenantId).paymentStatus, 'Paid');
      const dashboard = await auth('/dashboard');
      assert.equal(dashboard.status, 200);
      assert.equal(dashboard.data.data.payments.totalPaid >= 1000, true);
      assert.equal(dashboard.data.data.payments.totalPending >= 0, true);
      assert.equal((await auth(`/payments/${paymentA}`)).status, 200);
      assert.equal((await auth('/payments')).data.count, 2);
      assert.equal((await auth(`/payments/${paymentA}`, { method: 'PUT', body: { amount: 450 } })).status, 400);
      assert.equal((await auth(`/payments/${paymentA}`, { method: 'PUT', body: { amount: 350 } })).status, 200);
      assert.equal((await auth(`/payments/${paymentA}`)).data.data.amount, 350);
      const duplicateReference = await auth('/payments', { method: 'POST', body: { tenant: tenantId, amount: 50, billingPeriod: period, paymentDate: new Date().toISOString(), paymentMethod: 'UPI', transactionId: 'test-ref-a' } });
      assert.equal(duplicateReference.status, 409);
      assert.equal((await auth(`/tenants/${tenantId}`, { method: 'DELETE' })).status, 409);
      assert.equal((await auth(`/rooms/${roomB}`, { method: 'DELETE' })).status, 400);
      assert.equal((await auth(`/payments/${paymentA}`, { method: 'DELETE' })).status, 200);
      tenants = (await auth('/tenants')).data.data;
      assert.equal(tenants.find((tenant) => tenant._id === tenantId).currentBalance, 400);
    });

    await t.test('bookings and maintenance operations persist against real property and room records', async () => {
      const start = new Date(); start.setDate(start.getDate() + 40);
      const end = new Date(start); end.setDate(end.getDate() + 5);
      const bookingBody = { guestName: 'Test Guest', guestPhone: '9876543210', property: propertyId, room: roomA, checkIn: start.toISOString(), checkOut: end.toISOString(), amount: 2500, type: 'Short Stay' };
      const booking = await auth('/bookings', { method: 'POST', body: bookingBody });
      assert.equal(booking.status, 201);
      const conflict = await auth('/bookings', { method: 'POST', body: bookingBody });
      assert.equal(conflict.status, 409);
      const bookingId = booking.data.data._id;
      assert.equal((await auth(`/bookings/${bookingId}`, { method: 'PUT', body: { status: 'Confirmed' } })).status, 200);
      assert.equal((await auth('/bookings')).data.count, 1);
      assert.equal((await auth(`/bookings/${bookingId}`, { method: 'DELETE' })).status, 200);

      const ticket = await auth('/maintenance', { method: 'POST', body: { category: 'Plumbing', property: propertyId, room: roomA, priority: 'High', description: 'Test leak', estimatedCost: 500 } });
      assert.equal(ticket.status, 201);
      const ticketId = ticket.data.data._id;
      assert.equal((await auth(`/maintenance/${ticketId}`, { method: 'PUT', body: { status: 'Completed', assignedPerson: 'Maintenance test' } })).status, 200);
      assert.equal((await auth('/maintenance')).data.data[0].status, 'Completed');
      assert.equal((await auth(`/maintenance/${ticketId}`, { method: 'DELETE' })).status, 200);
    });

    await t.test('rent reminder history records prefilled chat attempts without claiming messages were sent', async () => {
      assert.equal((await auth('/reminders', { method: 'POST', body: { tenant: tenantId, amountDue: 400, dueDate: new Date().toISOString(), billingPeriod: period, method: 'WhatsApp' } })).status, 201);
      const history = await auth('/reminders');
      assert.equal(history.status, 200);
      assert.equal(history.data.data[0].status, 'Opened in WhatsApp; not sent');
    });

    await t.test('financial transactions can be created, corrected, and deleted', async () => {
      const created = await auth('/transactions', { method: 'POST', body: { description: 'Test maintenance expense', category: 'Repairs', amount: 500, type: 'Expense', date: new Date().toISOString(), property: propertyId } });
      assert.equal(created.status, 201);
      const transactionId = created.data.data._id;
      assert.equal((await auth('/transactions')).data.count, 1);
      assert.equal((await auth(`/transactions/${transactionId}`, { method: 'PUT', body: { amount: 650 } })).data.data.amount, 650);
      assert.equal((await auth(`/transactions/${transactionId}`, { method: 'DELETE' })).status, 200);
    });

    await t.test('settings persist and remaining records can be safely removed', async () => {
      const updated = await auth('/auth/settings', { method: 'PUT', body: { testPreference: 'saved', upiId: 'test@upi' } });
      assert.equal(updated.status, 200);
      const profile = await auth('/auth/me');
      assert.equal(profile.data.data.settings.testPreference, 'saved');
      assert.equal((await auth(`/payments/${paymentB}`, { method: 'DELETE' })).status, 200);
      assert.equal((await auth('/payments')).data.count, 0, 'test tenant payments should be fully removed before tenant cleanup');
      const tenantDelete = await auth(`/tenants/${tenantId}`, { method: 'DELETE' });
      assert.equal(tenantDelete.status, 409, tenantDelete.data.message);
      const movedOut = await auth(`/tenants/${tenantId}`, { method: 'PUT', body: { isActive: false } });
      assert.equal(movedOut.status, 200);
      assert.equal(movedOut.data.data.isActive, false);
      assert.equal(movedOut.data.data.room, null);
      assert.equal((await auth(`/rooms/${roomA}`, { method: 'DELETE' })).status, 200);
      assert.equal((await auth(`/rooms/${roomB}`, { method: 'DELETE' })).status, 200);
      assert.equal((await auth(`/properties/${propertyId}`, { method: 'DELETE' })).status, 200);
      assert.equal((await auth('/properties')).data.count, 0);
    });
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (mongoose.connection.readyState) {
      if (mongoose.connection.name === dbName) await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }
  }
});
