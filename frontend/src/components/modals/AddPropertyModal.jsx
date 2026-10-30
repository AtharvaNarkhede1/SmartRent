import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { useSmartRent } from '../../context/SmartRentContext';
import { ImageUpload } from '../common/ImageUpload';

const PROPERTY_PRESETS = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
];

export const AddPropertyModal = ({ isOpen, onClose, property }) => {
  const { addProperty, updateProperty, uploadImage } = useSmartRent();
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    floors: 2,
    type: 'Apartment Complex',
    image: PROPERTY_PRESETS[0],
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving || !formData.name.trim() || !formData.address.trim()) return;
    setSaving(true);
    let image = formData.image;
    if (imageFile) {
      image = await uploadImage(imageFile);
      if (!image) { setSaving(false); return; }
    }
    const payload = { ...formData, image };
    const saved = property?.id ? await updateProperty(property.id, payload) : await addProperty(payload);
    setSaving(false);
    if (!saved) return;
    onClose();
    setImageFile(null);
    setFormData({
      name: '',
      address: '',
      floors: 2,
      type: 'Apartment Complex',
      image: PROPERTY_PRESETS[0],
      description: ''
    });
  };

  useEffect(() => {
    if (isOpen) {
      setFormData(property ? { name: property.name || '', address: property.address || '', floors: property.floors || 1, type: property.type || '', image: property.image || '', description: property.description || '' } : { name: '', address: '', floors: 1, type: 'Apartment Complex', image: PROPERTY_PRESETS[0], description: '' });
      setImageFile(null);
    }
  }, [isOpen, property]);

  return (
    <Modal isOpen={isOpen} onClose={saving ? () => {} : onClose} title={property ? 'Edit property' : 'Add new property'} subtitle={property ? 'Update the property record' : 'Register a building, villa, or PG to your portfolio'} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Property Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Sunrise Residency"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Full Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Street, Area, City, State & PIN code"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Property Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option>Apartment Complex</option>
              <option>Executive PG</option>
              <option>Luxury Villa / Co-living</option>
              <option>Serviced Apartments</option>
              <option>Lakefront Residences</option>
              <option>Commercial & Residential PG</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Total Floors</label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.floors}
              onChange={(e) => setFormData({ ...formData, floors: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

        </div>

        {/* Property Image Upload */}
        <ImageUpload
          label="Property Photo"
          helperText="Upload image from device (JPEG, PNG, WebP)"
          value={formData.image}
          onChange={(newImg, file) => { setFormData({ ...formData, image: newImg }); if (file) setImageFile(file); }}
          shape="landscape"
          presets={PROPERTY_PRESETS}
          maxDimension={1000}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
          <textarea
            rows="2"
            placeholder="Key highlights, amenities, power backup, parking details..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs hover:shadow transition-all"
          >
            {saving ? 'Saving…' : property ? 'Save changes' : 'Add property'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
