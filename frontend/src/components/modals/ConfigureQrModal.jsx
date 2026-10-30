import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useSmartRent } from '../../context/SmartRentContext';
import { QrCode, Upload, RefreshCw, Trash2, Check } from 'lucide-react';

export const ConfigureQrModal = ({ isOpen, onClose }) => {
  const { settings, setSettings, addToast, updateSettingsAPI, uploadImage, getImageUrl } = useSmartRent();
  const fileInputRef = useRef(null);
  const [qrFile, setQrFile] = useState(null);

  const [formData, setFormData] = useState({
    accountHolder: settings.accountHolder || '',
    upiId: settings.upiId || '',
    bankName: settings.bankName || '',
    accountNumber: settings.accountNumber || '',
    ifscCode: settings.ifscCode || '',
    paymentInstructions: settings.paymentInstructions || 'Please include your Room Number in UPI transaction remarks and share screenshot on WhatsApp.',
    qrCodeImage: settings.qrCodeImage || null
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        accountHolder: settings.accountHolder || '',
        upiId: settings.upiId || '',
        bankName: settings.bankName || '',
        accountNumber: settings.accountNumber || '',
        ifscCode: settings.ifscCode || '',
        paymentInstructions: settings.paymentInstructions || 'Please include your Room Number in UPI transaction remarks and share screenshot on WhatsApp.',
        qrCodeImage: settings.qrCodeImage || null
      });
    }
  }, [isOpen, settings]);

  const handleQrUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      addToast('Invalid file format. Please upload a PNG, JPG, or JPEG file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 600;
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
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.9);
        setFormData((prev) => ({ ...prev, qrCodeImage: dataUrl }));
        setQrFile(file);
        addToast('QR code preview updated. Click "Save Configuration" to apply.');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveQr = () => {
    setFormData((prev) => ({ ...prev, qrCodeImage: null }));
    setQrFile(null);
    addToast('Custom QR code removed from form.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalQrUrl = formData.qrCodeImage;
    if (qrFile) {
      const uploadedUrl = await uploadImage(qrFile);
      if (uploadedUrl) {
        finalQrUrl = uploadedUrl;
      }
    }
    const newSettings = { ...formData, qrCodeImage: finalQrUrl };
    const success = await updateSettingsAPI(newSettings);
    if (success) {
      addToast('Payment gateway & UPI QR details updated successfully!');
      onClose();
    } else {
      addToast('Failed to save settings.', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Payment Details & UPI QR"
      subtitle="Customize receiving accounts, UPI address, QR code image, and tenant transfer guidance"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* QR Code Upload & Preview Section */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl flex flex-col sm:flex-row items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, .png, .jpg, .jpeg"
            onChange={handleQrUpload}
            className="hidden"
          />

          <div className="w-24 h-24 bg-slate-900 rounded-xl p-1.5 flex flex-col items-center justify-center text-white shrink-0 relative overflow-hidden border border-slate-200 shadow-2xs">
            {formData.qrCodeImage ? (
              <img
                src={getImageUrl(formData.qrCodeImage)}
                alt="Custom QR Preview"
                className="w-full h-full object-contain bg-white rounded-lg p-0.5"
              />
            ) : (
              <>
                <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 2h4v4h-4v-4zm-4-2h2v2h-2v-2zm2 4h2v2h-2v-2zm2-2h2v2h-2v-2zm-6-2h2v4h-2v-4z" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold shadow-xs">
                    ₹
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <span className="block text-xs font-bold text-slate-800">
              Payment QR Code Image
            </span>
            <p className="text-[11px] text-slate-500">
              Upload your official PhonePe, GPay, or bank UPI QR (PNG, JPG, or JPEG)
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              {formData.qrCodeImage ? (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Replace</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveQr}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload QR Image</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Account Holder Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.accountHolder}
              onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary UPI ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.upiId}
              onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
            <input
              type="text"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code</label>
            <input
              type="text"
              value={formData.ifscCode}
              onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
          <input
            type="text"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Payment Instructions for Tenants
          </label>
          <textarea
            rows="3"
            value={formData.paymentInstructions}
            onChange={(e) => setFormData({ ...formData, paymentInstructions: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs hover:shadow transition-all"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </Modal>
  );
};
