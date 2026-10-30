import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  Camera,
  FileText,
  Hash,
  Sparkles,
  Check,
  RefreshCw,
  Trash2,
  Loader2
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useSmartRent } from '../../context/SmartRentContext';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
];

/**
 * Resizes and compresses image to lightweight base64 (~20-35KB)
 * to ensure bulletproof persistence in browser storage across reloads.
 */
const processProfilePhoto = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file selected'));
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Please upload a valid image file (PNG, JPG, JPEG, WebP).'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image.'));
      img.onload = () => {
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        // Fill white background for transparent PNGs
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compact high-quality JPEG (~25-35KB)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export const EditOwnerProfileModal = ({ isOpen, onClose }) => {
  const { ownerProfile, updateOwnerProfile, changeOwnerPassword, addToast } = useSmartRent();
  const fileInputRef = useRef(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [formData, setFormData] = useState({
    fullName: '',
    profilePhoto: '',
    phone: '',
    email: '',
    businessName: '',
    city: '',
    bio: '',
    numProperties: 9
  });

  useEffect(() => {
    if (ownerProfile && isOpen) {
      setFormData({
        fullName: ownerProfile.fullName || '',
        profilePhoto: ownerProfile.profilePhoto || '',
        phone: ownerProfile.phone || '',
        email: ownerProfile.email || '',
        businessName: ownerProfile.businessName || '',
        city: ownerProfile.city || '',
        bio: ownerProfile.bio || '',
        numProperties: ownerProfile.numProperties || 9
      });
    }
  }, [ownerProfile, isOpen]);

  useEffect(() => {
    if (isOpen) setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  }, [isOpen]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const dataUrl = await processProfilePhoto(file);
      setFormData((prev) => ({ ...prev, profilePhoto: dataUrl }));
      addToast('Profile photo selected! Click "Save Changes" to finalize.', 'info');
    } catch (err) {
      console.error('Error processing photo:', err);
      addToast(err.message || 'Failed to process image. Please try another image.', 'error');
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, profilePhoto: '' }));
    addToast('Photo removed. Initials will be displayed.', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      addToast('Please enter your full name.', 'error');
      return;
    }

    const success = await updateOwnerProfile(formData);
    if (success) onClose();
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
    setIsChangingPassword(true);
    const updated = await changeOwnerPassword(passwordData);
    setIsChangingPassword(false);
    if (updated) setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Property Owner Profile"
      subtitle="Update your personalized profile, business branding, and contact details."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Photo Selection Section */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Profile Photo
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            {/* Avatar Preview */}
            <div className="relative shrink-0 group">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer block relative rounded-2xl overflow-hidden"
                title="Click to change profile photo"
              >
                {formData.profilePhoto ? (
                  <img
                    src={formData.profilePhoto}
                    alt="Preview"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-xs group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.target.src = AVATAR_PRESETS[0];
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center border-2 border-white shadow-xs">
                    {formData.fullName ? formData.fullName.slice(0, 2).toUpperCase() : 'PO'}
                  </div>
                )}

                {isProcessing ? (
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                ) : (
                  <span className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 text-white rounded-full group-hover:bg-blue-700 shadow-2xs transition-colors">
                    <Camera className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>

            {/* Upload Buttons & Presets */}
            <div className="flex-1 w-full space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{formData.profilePhoto ? 'Change Photo' : 'Upload Photo'}</span>
                </button>

                {formData.profilePhoto && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="Remove custom photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}

                <span className="text-[11px] text-slate-400 sm:ml-2">or select preset:</span>
                <div className="flex items-center gap-1.5">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, profilePhoto: preset })}
                      className={`w-7 h-7 rounded-lg overflow-hidden border transition-all ${
                        formData.profilePhoto === preset
                          ? 'ring-2 ring-blue-600 scale-105'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                      title={`Select Avatar Preset ${idx + 1}`}
                    >
                      <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Supports PNG, JPG, JPEG, and WebP. Automatically optimized for crystal-clear cross-session display.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Info: Full Name & Business Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. Rajesh Sharma"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Property / Business Name *
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. Sharma Properties"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Contact Info: Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="tel"
                placeholder="e.g. +91 98230 45678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="email"
                placeholder="e.g. rajesh@sharmaproperties.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Location & Portfolio Size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              City / Base Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Pune, Maharashtra"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Short Professional Bio
          </label>
          <textarea
            rows="3"
            placeholder="Introduce yourself to prospective tenants and residents..."
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 leading-relaxed"
          />
        </div>

        <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Change administrator password</h3>
            <p className="mt-1 text-[11px] text-slate-500">Your current password is required. Use at least 8 characters for the new password.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="text-[11px] font-semibold text-slate-700">Current password
              <input type="password" autoComplete="current-password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-normal" />
            </label>
            <label className="text-[11px] font-semibold text-slate-700">New password
              <input type="password" autoComplete="new-password" minLength={8} value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-normal" />
            </label>
            <label className="text-[11px] font-semibold text-slate-700">Confirm new password
              <input type="password" autoComplete="new-password" minLength={8} value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-normal" />
            </label>
          </div>
          <button type="button" onClick={handlePasswordChange} disabled={isChangingPassword} className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-60">
            {isChangingPassword ? 'Updating password…' : 'Update password'}
          </button>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
