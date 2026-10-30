import React from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  Edit3,
  ShieldCheck,
  Hash,
  FileText
} from 'lucide-react';
import { OwnerProfileCard } from '../components/owner/OwnerProfileCard';
import { useSmartRent } from '../context/SmartRentContext';

export const Profile = () => {
  const { onOpenModal } = useOutletContext();
  const { ownerProfile, properties } = useSmartRent();

  const propertyCount = properties?.length || ownerProfile.numProperties || 9;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Owner Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Personalized identity, portfolio branding, and contact details for the property owner.
          </p>
        </div>

        <button
          onClick={() => onOpenModal('editProfile')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all self-start sm:self-auto"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Hero Owner Profile Card */}
      <OwnerProfileCard onEditProfile={() => onOpenModal('editProfile')} />

      {/* Detailed Profile Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal & Business Credentials */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Personal & Business Identity</h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Full Name</span>
              <span className="font-bold text-slate-900">{ownerProfile.fullName || 'Rajesh Sharma'}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Account Role</span>
              <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-[11px]">
                <ShieldCheck className="w-3 h-3 text-blue-600" /> {ownerProfile.role || 'Property Owner'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Property / Business Name</span>
              <span className="font-semibold text-slate-800">{ownerProfile.businessName || 'Sharma Properties'}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Properties Managed</span>
              <span className="font-bold text-slate-900">{propertyCount} Buildings</span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">City / Location</span>
              <span className="font-medium text-slate-800 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-500" /> {ownerProfile.city || 'Pune, Maharashtra'}
              </span>
            </div>
          </div>
        </div>

        {/* Contact & Bio Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Mail className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Contact & Communications</h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Phone Number</span>
              <span className="font-semibold text-slate-800">{ownerProfile.phone || '+91 98230 45678'}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Email Address</span>
              <span className="font-semibold text-blue-600">{ownerProfile.email || 'rajesh.sharma@sharmaproperties.in'}</span>
            </div>

            <div className="pt-1">
              <span className="text-slate-500 block mb-1">Portfolio Bio / Description</span>
              <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed italic">
                "{ownerProfile.bio || 'Managing residential properties and executive co-living spaces across Pune.'}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
