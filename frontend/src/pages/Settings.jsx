import React, { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  CreditCard,
  Bell,
  Shield,
  KeyRound,
  RotateCcw,
  Save,
  Check,
  Building,
  QrCode
} from 'lucide-react';
import { useSmartRent } from '../context/SmartRentContext';

export const Settings = () => {
  const {
    settings,
    ownerProfile,
    updateOwnerProfile,
    updateSettingsAPI,
    changeOwnerPassword,
    addToast
  } = useSmartRent();

  const [formData, setFormData] = useState({ ...settings });
  const [profileData, setProfileData] = useState({ ...ownerProfile });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('general'); // 'general' | 'payments' | 'notifications' | 'data'

  useEffect(() => {
    setFormData({ ...settings });
    setProfileData({ ...ownerProfile });
  }, [settings, ownerProfile]);

  const handleSave = async (e) => {
    e.preventDefault();
    const settingsSaved = await updateSettingsAPI(formData);
    const profileSaved = await updateOwnerProfile(profileData);
    if (settingsSaved && profileSaved) addToast('Settings and profile saved successfully!');
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || passwordData.newPassword.length < 8) {
      addToast('Enter your current password and a new password with at least 8 characters.', 'error');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast('The new passwords do not match.', 'error');
      return;
    }
    setPasswordSaving(true);
    const updated = await changeOwnerPassword(passwordData);
    setPasswordSaving(false);
    if (updated) setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your owner profile, receiving bank details, and notification defaults.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="space-y-1">
          <button
            onClick={() => setActiveSection('general')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
              activeSection === 'general'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Portfolio</span>
          </button>

          <button
            onClick={() => setActiveSection('payments')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
              activeSection === 'payments'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>UPI & Bank Gateway</span>
          </button>

          <button
            onClick={() => setActiveSection('notifications')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
              activeSection === 'notifications'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Reminders & Alerts</span>
          </button>

          <button
            onClick={() => setActiveSection('security')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
              activeSection === 'security'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Account Security</span>
          </button>

          <button
            onClick={() => setActiveSection('data')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
              activeSection === 'data'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Data & Demo Reset</span>
          </button>
        </div>

        {/* Form Container */}
        <div className="md:col-span-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <form onSubmit={handleSave} className="space-y-5">
            {activeSection === 'general' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                  Property Owner Profile Details
                </h3>

                {/* Profile Photo URL & Preview */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {profileData.profilePhoto ? <img src={profileData.profilePhoto} alt={profileData.fullName || 'Owner profile'} className="w-14 h-14 rounded-xl object-cover border border-slate-200" /> : <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold">{(profileData.fullName || 'PO').split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div>}
                  <div className="flex-1 w-full">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Profile Photo URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={profileData.profilePhoto || ''}
                      onChange={(e) => setProfileData({ ...profileData, profilePhoto: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Owner Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.fullName || ''}
                      onChange={(e) => {
                        setProfileData({ ...profileData, fullName: e.target.value });
                        setFormData({ ...formData, accountHolder: e.target.value });
                      }}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Property / Business Name
                    </label>
                    <input
                      type="text"
                      value={profileData.businessName || ''}
                      onChange={(e) => setProfileData({ ...profileData, businessName: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone || ''}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email || ''}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      City / Base Location
                    </label>
                    <input
                      type="text"
                      value={profileData.city || ''}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Number of Properties Managed
                    </label>
                    <input
                      type="number"
                      value={profileData.numProperties || 9}
                      onChange={(e) => setProfileData({ ...profileData, numProperties: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Short Bio / Description
                  </label>
                  <textarea
                    rows={2}
                    value={profileData.bio || ''}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Code</label>
                    <input
                      type="text"
                      value={formData.currency || 'INR'}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Symbol</label>
                    <input
                      type="text"
                      value={formData.currencySymbol || '₹'}
                      onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'payments' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                  Receiving Bank & UPI Settings
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Primary UPI ID</label>
                    <input
                      type="text"
                      value={formData.upiId || ''}
                      onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={formData.bankName || ''}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={formData.accountNumber || ''}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={formData.ifscCode || ''}
                      onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Default Payment Instructions
                  </label>
                  <textarea
                    rows="3"
                    value={formData.paymentInstructions || ''}
                    onChange={(e) => setFormData({ ...formData, paymentInstructions: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 leading-relaxed"
                  />
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                  Notification Delivery Channels
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
                    <div>
                      <p className="text-xs font-bold text-slate-800">WhatsApp Gateway Reminders</p>
                      <p className="text-[11px] text-slate-400">Send automated payment receipts & notices on WhatsApp</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.whatsappEnabled)}
                      onChange={(e) => setFormData({ ...formData, whatsappEnabled: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
                    <div>
                      <p className="text-xs font-bold text-slate-800">SMS Notifications</p>
                      <p className="text-[11px] text-slate-400">Dispatch SMS alerts for urgent maintenance tickets</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.smsEnabled)}
                      onChange={(e) => setFormData({ ...formData, smsEnabled: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Email Invoicing</p>
                      <p className="text-[11px] text-slate-400">Attach PDF tax receipts to tenant monthly statements</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.emailEnabled)}
                      onChange={(e) => setFormData({ ...formData, emailEnabled: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Change account password</h3>
                <p className="text-xs text-slate-500">Confirm your current password to set a new password. Use at least 8 characters.</p>
                <div className="max-w-lg space-y-3">
                  <label className="block text-xs font-semibold text-slate-700">Current password
                    <input type="password" autoComplete="current-password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-normal" />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">New password
                    <input type="password" autoComplete="new-password" minLength={8} value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-normal" />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">Confirm new password
                    <input type="password" autoComplete="new-password" minLength={8} value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-normal" />
                  </label>
                  <button type="button" onClick={handlePasswordChange} disabled={passwordSaving} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                    {passwordSaving ? 'Updating…' : 'Update password'}
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'data' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                  Database & Data Retention
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Property, room, tenant, payment, and account preferences are stored in the connected database. Financial history is retained when related records are protected from deletion.
                </p>

                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3">
                  <h4 className="text-xs font-bold text-rose-800">Database reset is disabled</h4>
                  <p className="text-[11px] text-rose-600">
                    Resetting the database can permanently remove tenant and payment records. Use your database administrator’s backup and maintenance process for any intentional data cleanup.
                  </p>
                  <button
                    type="button"
                    disabled
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    Protected database
                  </button>
                </div>
              </div>
            )}

            {activeSection !== 'security' && <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>}
          </form>
        </div>
      </div>
    </div>
  );
};
