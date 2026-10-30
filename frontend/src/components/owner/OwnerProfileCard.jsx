import React from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Edit3,
  Building,
  Sparkles
} from 'lucide-react';
import { useSmartRent } from '../../context/SmartRentContext';

export const OwnerProfileCard = ({ onEditProfile }) => {
  const { ownerProfile, properties } = useSmartRent();

  const getInitials = (name) => {
    if (!name) return 'PO';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };


  return (
    <div className="relative bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 rounded-2xl border border-blue-100/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 bg-blue-300/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left Side: Avatar + Details */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
          {/* Profile Photo */}
          <div className="relative shrink-0">
            {ownerProfile.profilePhoto ? (
              <img
                src={ownerProfile.profilePhoto}
                alt={ownerProfile.fullName}
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl object-cover border-2 border-white shadow-md ring-4 ring-blue-50"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fb = e.currentTarget.parentElement?.querySelector('.owner-avatar-fallback');
                  if (fb) {
                    fb.classList.remove('hidden');
                    fb.classList.add('flex');
                  }
                }}
              />
            ) : null}
            <div
              className={`owner-avatar-fallback w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-2xl font-bold items-center justify-center border-2 border-white shadow-md ring-4 ring-blue-50 ${
                ownerProfile.profilePhoto ? 'hidden' : 'flex'
              }`}
            >
              {getInitials(ownerProfile.fullName)}
            </div>

            <span
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs"
              title="Verified Single Property Owner"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Owner Info & Business Branding */}
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {ownerProfile.fullName || 'Property Owner'}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100/70 text-blue-800 border border-blue-200/60">
                <Sparkles className="w-3 h-3 text-blue-600" />
                {ownerProfile.role || 'Property Owner'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
              <Building2 className="w-4 h-4 shrink-0 text-blue-600" />
              <span>{ownerProfile.businessName || 'My Real Estate Portfolio'}</span>
            </div>

            {ownerProfile.bio && (
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl line-clamp-2 leading-relaxed pt-0.5">
                "{ownerProfile.bio}"
              </p>
            )}

            {/* City & Contact Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-slate-500">
              {ownerProfile.city && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="font-medium text-slate-700">{ownerProfile.city}</span>
                </div>
              )}
              {ownerProfile.phone && (
                <a
                  href={`tel:${ownerProfile.phone}`}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-medium">{ownerProfile.phone}</span>
                </a>
              )}
              {ownerProfile.email && (
                <a
                  href={`mailto:${ownerProfile.email}`}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="truncate max-w-[200px] font-medium">{ownerProfile.email}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action to Edit Profile */}
        <div className="flex items-center self-start md:self-center shrink-0">
          <button
            onClick={onEditProfile}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold shadow-2xs hover:shadow-xs transition-all duration-150 group/btn"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-600 group-hover/btn:rotate-12 transition-transform duration-200" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
