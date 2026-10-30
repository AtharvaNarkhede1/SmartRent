import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Building2,
  Plus,
  MapPin,
  BedDouble,
  Users,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Layers
} from 'lucide-react';
import { useSmartRent } from '../context/SmartRentContext';
import { DeleteConfirmModal } from '../components/common/DeleteConfirmModal';

export const Properties = () => {
  const { properties, deleteProperty } = useSmartRent();
  const { onOpenModal } = useOutletContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || p.type.toLowerCase().includes(filterType.toLowerCase());
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">All Properties</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your residential portfolio, occupancy, and floor-level room allotments.
          </p>
        </div>

        <button
          onClick={() => onOpenModal('addProperty')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Property</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search property or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 text-slate-600 bg-white"
          >
            <option value="All">All Property Types</option>
            <option value="Apartment">Apartments</option>
            <option value="PG">Executive PG</option>
            <option value="Villa">Villa / Co-living</option>
            <option value="Commercial">Commercial</option>
          </select>

          <span className="text-xs font-medium text-slate-400 ml-2">
            {filteredProperties.length} Properties
          </span>
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filteredProperties.map((prop) => {
          const occupancyPct = Math.round((prop.occupiedRooms / prop.totalRooms) * 100) || 0;

          return (
            <div
              key={prop.id}
              className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition-all duration-200 hover:border-emerald-300 hover:shadow-md flex flex-col group"
            >
              {/* Image Container with Badges */}
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src={prop.image}
                  alt={prop.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                {/* Top Badge: Type */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-xs text-blue-700 shadow-xs">
                    {prop.type.split('/')[0]}
                  </span>
                </div>

                {/* Bottom Overlay Info on Image */}
                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <h3 className="truncate font-bold text-base tracking-tight drop-shadow-xs">{prop.name}</h3>
                  <div className="flex items-center gap-1 text-[11px] text-slate-200 mt-0.5 drop-shadow-xs">
                    <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                    <span className="truncate">{prop.address}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="min-w-0 p-4 flex-1 flex flex-col justify-between space-y-4">
                {/* Metric Summary */}
                <div className="grid min-w-0 grid-cols-3 gap-1 py-2 px-2 bg-slate-50/80 rounded-lg border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Total</span>
                    <p className="text-sm font-bold text-slate-800">{prop.totalRooms}</p>
                    <span className="text-[10px] text-slate-400">Rooms</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Occupied</span>
                    <p className="text-sm font-bold text-blue-600">{prop.occupiedRooms}</p>
                    <span className="text-[10px] text-slate-400">Rooms</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Occupancy</span>
                    <p className="text-sm font-bold text-emerald-600">{occupancyPct}%</p>
                    <span className="text-[10px] text-slate-400">Rate</span>
                  </div>
                </div>

                {/* Occupancy Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Occupancy Capacity</span>
                    <span className="font-bold text-slate-800">{prop.occupiedRooms} / {prop.totalRooms} Units</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        occupancyPct === 100
                          ? 'bg-emerald-500'
                          : occupancyPct >= 70
                          ? 'bg-blue-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons: View, Edit & Delete */}
                <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-1.5 border-t border-slate-100 pt-3">
                  <button
                    onClick={() => navigate(`/properties/${prop.id}`)}
                    className="flex min-w-0 items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-2 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-800"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="truncate">View details</span>
                  </button>

                  <button
                    onClick={() => onOpenModal('editProperty', prop)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white p-0 text-slate-700 transition-colors hover:bg-slate-50"
                    title="Edit property details"
                    aria-label={`Edit ${prop.name}`}
                  >
                    <Edit className="h-3.5 w-3.5 text-slate-500" />
                  </button>

                  <button
                    onClick={() => setPropertyToDelete(prop)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white p-0 text-rose-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                    title="Delete property"
                    aria-label={`Delete ${prop.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmModal
        isOpen={Boolean(propertyToDelete)}
        onClose={() => setPropertyToDelete(null)}
        onConfirm={() => {
          if (propertyToDelete) {
            deleteProperty(propertyToDelete.id);
            setPropertyToDelete(null);
          }
        }}
        title="Delete Property"
        itemType="property"
        itemName={propertyToDelete?.name}
        message="Are you sure you want to delete this property?"
      />
    </div>
  );
};
