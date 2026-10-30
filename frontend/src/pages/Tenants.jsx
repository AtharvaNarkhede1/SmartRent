import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Users,
  UserPlus,
  FileCheck,
  CalendarX,
  Phone,
  Mail,
  Search,
  Filter,
  Eye,
  Edit,
  UserMinus,
  History,
  Building,
  BedDouble,
  ShieldCheck,
  Camera
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { useSmartRent } from '../context/SmartRentContext';
import { EditTenantModal } from '../components/modals/EditTenantModal';

export const Tenants = () => {
  const { onOpenModal } = useOutletContext();
  const { tenants, updateTenant, addToast, getImageUrl, uploadImage } = useSmartRent();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('All');
  const [selectedTab, setSelectedTab] = useState('Active'); // 'Active' | 'New' | 'Pending Documents' | 'Lease Expiry'
  const [profileTenant, setProfileTenant] = useState(null);
  const [editTenant, setEditTenant] = useState(null);

  // Filter tenants
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProperty = selectedProperty === 'All' || t.propertyName === selectedProperty;

    let matchesTab = true;
    if (selectedTab === 'Active') {
      matchesTab = t.isActive !== false;
    } else if (selectedTab === 'Moved Out') {
      matchesTab = t.isActive === false;
    } else if (selectedTab === 'Pending Documents') {
      matchesTab = t.documentsStatus !== 'Submitted';
    } else if (selectedTab === 'New') {
      matchesTab = Boolean(t.moveInDate && new Date(t.moveInDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    } else if (selectedTab === 'Lease Expiry') {
      matchesTab = Boolean(t.leaseEndDate && new Date(t.leaseEndDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    }

    return matchesSearch && matchesProperty && matchesTab;
  });

  const handleMoveOut = (tenantId, tenantName) => {
    if (window.confirm(`Are you sure you want to mark ${tenantName} as moved out? This will vacate the room.`)) {
      updateTenant(tenantId, { isActive: false, roomId: null });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">People / Tenants</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain resident profiles, KYC compliance, lease agreements, and contact records.
          </p>
        </div>

        <button
          onClick={() => onOpenModal('addTenant')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Tenant</span>
        </button>
      </div>

      {/* Top 4 Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Active Tenants"
          value={tenants.filter((tenant) => tenant.isActive !== false).length}
          description="Occupying rooms"
          trend="100% verified"
          trendType="positive"
        />
        <StatCard
          icon={UserPlus}
          label="New Tenants"
          value={tenants.filter(t => new Date(t.moveInDate || t.createdAt) >= new Date(new Date().setDate(new Date().getDate() - 30))).length}
          description="Joined last 30 days"
          trend="Recent"
        />
        <StatCard
          icon={FileCheck}
          label="Pending Documents"
          value={tenants.filter(t => t.documentsStatus !== 'Submitted').length}
          description="Missing ID/Aadhaar"
          trend="Action required"
          trendType="negative"
        />
        <StatCard
          icon={CalendarX}
          label="Lease Expiry"
          value={tenants.filter(t => t.leaseEndDate && new Date(t.leaseEndDate) <= new Date(new Date().setDate(new Date().getDate() + 30))).length}
          description="Due next 30 days"
        />
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['Active', 'Moved Out', 'New', 'Pending Documents', 'Lease Expiry'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTab === tab
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tenant name, room, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Resident</th>
                <th className="py-3 px-4">Phone / Contact</th>
                <th className="py-3 px-4">Property & Room</th>
                <th className="py-3 px-4">Monthly Rent</th>
                <th className="py-3 px-4">Move-in Date</th>
                <th className="py-3 px-4">Lease Status</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.map((t) => (
                <tr key={t.id} className="hover:bg-blue-50/40 transition-colors">
                  {/* Avatar & Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {t.avatar ? <img src={getImageUrl(t.avatar)} alt={t.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200" /> : <div aria-label={t.name} className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 ring-1 ring-blue-200 flex items-center justify-center text-xs font-bold">{t.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div>}
                      <div>
                        <span className="font-bold text-slate-900 block">{t.name}</span>
                        <span className="text-[10px] text-slate-400">{t.email}</span>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {t.phone}
                  </td>

                  {/* Property & Room */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800">{t.propertyName}</span>
                    <span className="block text-[11px] text-blue-600 font-medium">Room {t.roomNumber}</span>
                  </td>

                  {/* Rent */}
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    ₹{t.monthlyRent.toLocaleString('en-IN')}
                  </td>

                  {/* Move-in */}
                  <td className="py-3.5 px-4 text-slate-500">
                    {t.moveInDate}
                  </td>

                  {/* Lease Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={t.leaseStatus} />
                  </td>

                  {/* Payment Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={t.paymentStatus} />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <button
                        onClick={() => setProfileTenant(t)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setEditTenant(t)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Tenant"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleMoveOut(t.id, t.name)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Move Out Tenant"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTenants.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Users className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-sm font-medium text-slate-900 mb-1">No tenants found</p>
                      <p className="text-xs max-w-sm mb-4 text-slate-500">
                        There are no tenants matching your current filters or search criteria.
                      </p>
                      <button
                        onClick={() => onOpenModal('addTenant')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs hover:shadow transition-all"
                      >
                        Add New Tenant
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenant Profile Modal */}
      {profileTenant && (
        <Modal
          isOpen={Boolean(profileTenant)}
          onClose={() => setProfileTenant(null)}
          title="Resident Profile"
          subtitle={`KYC and Tenancy Contract Details`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
              <div className="relative group shrink-0">
                {profileTenant.avatar ? <img src={getImageUrl(profileTenant.avatar)} alt={profileTenant.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-100" /> : <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 ring-2 ring-blue-100 flex items-center justify-center text-lg font-bold">{profileTenant.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div>}
                <label
                  title="Click to change resident photo"
                  className="absolute inset-0 bg-slate-900/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-[9px] font-semibold"
                >
                  <Camera className="w-4 h-4 mb-0.5" />
                  <span>Change</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        uploadImage(file).then(uploadedUrl => {
                          if (uploadedUrl) {
                            updateTenant(profileTenant.id, { avatar: uploadedUrl });
                            setProfileTenant((prev) => ({ ...prev, avatar: uploadedUrl }));
                            addToast(`Updated photo for ${profileTenant.name}`);
                          }
                        });
                      }
                    }}
                  />
                </label>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{profileTenant.name}</h3>
                <p className="text-slate-500">{profileTenant.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <StatusBadge status={profileTenant.documentsStatus} />
                  <StatusBadge status={profileTenant.paymentStatus} />
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Mobile Number</span>
                <span className="font-semibold text-slate-800">{profileTenant.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Assigned Room</span>
                <span className="font-semibold text-slate-800">
                  {profileTenant.propertyName} (Room {profileTenant.roomNumber})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Monthly Rent</span>
                <span className="font-bold text-blue-700">₹{(profileTenant.monthlyRent || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">ID Proof Document</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> {profileTenant.idProof ? profileTenant.idProof : 'Not Submitted/Not Verified'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Emergency Contact</span>
                <span className="font-semibold text-slate-800">{profileTenant.emergencyContact || '+91 98000 00000'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setProfileTenant(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {editTenant && (
        <EditTenantModal
          isOpen={Boolean(editTenant)}
          onClose={() => setEditTenant(null)}
          tenant={editTenant}
        />
      )}
    </div>
  );
};
