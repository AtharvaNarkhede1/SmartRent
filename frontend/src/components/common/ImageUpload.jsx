import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, RefreshCw, Check } from 'lucide-react';

/**
 * Resizes an image file and converts it to a compact Base64 data URL
 * to avoid exceeding browser localStorage quotas.
 */
const processImageFile = (file, maxDimension = 900, quality = 0.82) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export const ImageUpload = ({
  value,
  onChange,
  label = 'Upload Image',
  required = false,
  helperText = 'PNG, JPG, WebP up to 10MB',
  shape = 'landscape', // 'landscape' | 'square' | 'circle'
  presets = [],
  maxDimension = 900
}) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }
    setError('');
    setIsProcessing(true);
    try {
      const dataUrl = await processImageFile(file, maxDimension);
      onChange(dataUrl, file);
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Failed to process image. Please try another file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          {helperText && <span className="text-[11px] text-slate-400">{helperText}</span>}
        </div>
      )}

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif"
        onChange={onFileInputChange}
        className="hidden"
      />

      {value ? (
        /* Image Preview Box */
        <div
          className={`relative overflow-hidden border border-slate-200 bg-slate-50 group ${
            shape === 'circle'
              ? 'w-24 h-24 rounded-full mx-auto ring-4 ring-blue-50'
              : shape === 'square'
              ? 'w-28 h-28 rounded-2xl mx-auto'
              : 'w-full h-40 rounded-xl'
          }`}
        >
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80';
            }}
          />

          {/* Action Overlay */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1 transition-all"
              title="Change Image"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {shape !== 'circle' && <span className="text-[11px]">Change</span>}
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
              title="Remove Image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Dropzone / Upload Area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 flex flex-col items-center justify-center p-4 text-center ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-slate-50'
          } ${shape === 'circle' ? 'w-28 h-28 rounded-full mx-auto p-2' : 'w-full py-5'}`}
        >
          <div
            className={`rounded-xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center shadow-2xs mb-2 ${
              shape === 'circle' ? 'w-8 h-8 rounded-full' : 'w-10 h-10'
            }`}
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <UploadCloud className="w-5 h-5 text-blue-600" />
            )}
          </div>

          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-slate-700">
              {isProcessing ? 'Processing image...' : 'Click to upload image'}
            </p>
            {shape !== 'circle' && (
              <p className="text-[11px] text-slate-400">or drag and drop your photo here</p>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}

      {/* Preset Suggestions (Quick-pick gallery) */}
      {presets.length > 0 && (
        <div className="pt-1">
          <p className="text-[11px] text-slate-500 font-medium mb-1.5">Or choose a preset:</p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {presets.map((preset, index) => {
              const isSelected = value === preset;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => onChange(preset)}
                  className={`relative rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    shape === 'circle' ? 'w-9 h-9 rounded-full' : 'w-12 h-9 rounded-lg'
                  } ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={preset} alt={`Preset ${index + 1}`} className="w-full h-full object-cover" />
                  {isSelected && (
                    <span className="absolute inset-0 bg-blue-600/40 flex items-center justify-center text-white">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
