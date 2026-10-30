import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SmartRentProvider } from './context/SmartRentContext';
import { MainLayout } from './layouts/MainLayout';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Properties } from './pages/Properties';
import { PropertyDetails } from './pages/PropertyDetails';
import { RoomsManagement } from './pages/RoomsManagement';
import { Tenants } from './pages/Tenants';
import { RentLedger } from './pages/RentLedger';
import { Bookings } from './pages/Bookings';
import { Maintenance } from './pages/Maintenance';
import { Receipts } from './pages/Receipts';
import { RentReminders } from './pages/RentReminders';
import { FinancialReports } from './pages/FinancialReports';
import { MoneyOverview } from './pages/MoneyOverview';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';

export default function App() {
  return (
    <SmartRentProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="properties" element={<Properties />} />
            <Route path="properties/:id" element={<PropertyDetails />} />
            <Route path="rooms" element={<RoomsManagement />} />
            <Route path="tenants" element={<Tenants />} />
            <Route path="rent" element={<RentLedger />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="receipts" element={<Receipts />} />
            <Route path="reminders" element={<RentReminders />} />
            <Route path="reports" element={<FinancialReports />} />
            <Route path="finances" element={<MoneyOverview />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SmartRentProvider>
  );
}
