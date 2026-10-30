import React, { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Edit,
  Plus,
  ArrowLeft,
  BedDouble,
  DoorClosed,
  DoorOpen,
  PieChart,
  UserCheck,
  CheckCircle,
  Wrench,
  Calendar,
  Settings as SettingsIcon,
  Filter,
  Users,
  Trash2
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { useSmartRent } from '../context/SmartRentContext';
import { DeleteConfirmModal } from '../components/common/DeleteConfirmModal';

export const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { onOpenModal } = useOutletContext();
  const { properties, rooms, tenants, maintenance, bookings, vacateRoom, deleteProperty, deleteRoom, deleteTenant } = useSmartRent();

  const property = properties.find((p) => p.id === id);

  const [activeTab, setActiveTab] = useState('Rooms'); // 'Rooms' | 'Overview' | 'Tenants' | 'Bookings' | 'Maintenance' | 'Reports' | 'Settings'
  const [floorFilter, setFloorFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Deletion modals state
  const [isDeletingProperty, setIsDeletingProperty] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  // Filter property rooms
  const propertyRooms = rooms.filter(
    (r) => property && (r.propertyId === property.id || r.propertyName === property.name)
  );

  const filteredRooms = propertyRooms.filter((r) => {
    const matchesFloor = floorFilter === 'All' || r.floor.toString() === floorFilter;
    const matchesStatus = statusFilter === 'All' || r.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesFloor && matchesStatus;
  });

  const occupiedRoomsCount = propertyRooms.filter((r) => r.status === 'Occupied' || r.status === 'Partial').length;
  const vacantRoomsCount = propertyRooms.filter((r) => r.status === 'Vacant').length;
  const occupancyRate = propertyRooms.length ? Math.round((occupiedRoomsCount / propertyRooms.length) * 100) : 0;

  const propertyTenants = tenants.filter(
    (t) => property && (t.propertyId === property.id || t.propertyName === property.name)
  );

  const propertyMaintenance = maintenance.filter(
    (m) => property && m.property === property.name
  );

  const propertyBookings = bookings.filter(
    (b) => property && b.propertyName === property.name
  );

  const tabs = ['Rooms', 'Overview', 'Tenants', 'Bookings', 'Maintenance', 'Reports', 'Settings'];

  if (!property) return (
    <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-xl font-bold text-slate-900">{properties.length ? 'Property not found' : 'Loading property data'}</h1>
      <p className="mt-2 text-sm text-slate-500">{properties.length ? 'This property is not part of the current portfolio.' : 'Property records will appear here after the database responds.'}</p>
      <button onClick={() => navigate('/properties')} className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">View properties</button>
    </section>
  );

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/properties')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Properties</span>
        </button>
      </div>

      {/* Property Hero Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="relative h-56 sm:h-64 bg-slate-900">
          <img
            src={property.image}
            alt={property.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

          {/* Hero Content */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white mb-2 inline-block">
                {property.type}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-sm">
                {property.name}
              </h1>
              <p className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-200 mt-1">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{property.address}</span>
              </p>
            </div>

            {/* Actions: Add Room, Edit Property & Delete Property */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => onOpenModal('addRoom')}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Room</span>
              </button>
              <button
                onClick={() => onOpenModal('editProperty', property)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white/90 backdrop-blur-xs hover:bg-white text-slate-800 rounded-xl text-xs font-semibold shadow-md transition-all"
              >
                <Edit className="w-4 h-4 text-slate-600" />
                <span>Edit Property</span>
              </button>
              <button
                onClick={() => setIsDeletingProperty(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600/90 backdrop-blur-xs hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
                title="Delete this property"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-white p-4">
          <div className="p-3 text-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Rooms</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{property.totalRooms}</p>
            <span className="text-[11px] text-slate-500">Across {property.floors} floors</span>
          </div>

          <div className="p-3 text-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Occupied</span>
            <p className="text-2xl font-bold text-blue-600 mt-1">{property.occupiedRooms}</p>
            <span className="text-[11px] text-emerald-600 font-medium">All active</span>
          </div>

          <div className="p-3 text-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vacant</span>
            <p className="text-2xl font-bold text-slate-700 mt-1">{property.totalRooms - property.occupiedRooms}</p>
            <span className="text-[11px] text-slate-500">Immediate availability</span>
          </div>

          <div className="p-3 text-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Occupancy</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{occupancyRate}%</p>
            <span className="text-[11px] text-slate-500">Full yield performance</span>
          </div>
        </div>
      </div>

      {/* 7 Tabs Bar */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto pb-px">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab 1: Rooms Tab Content */}
      {activeTab === 'Rooms' && (
        <div className="space-y-4">
          {/* Filters Bar: Floor & Status */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Floor:</span>
              {['All', '1', '2', '3', '4'].map((fl) => (
                <button
                  key={fl}
                  onClick={() => setFloorFilter(fl)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    floorFilter === fl
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {fl === 'All' ? 'All Floors' : `Floor ${fl}`}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Status:</span>
              {['All', 'Occupied', 'Vacant', 'Partial', 'Maintenance'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'All' ? 'All Status' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Room Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Room</th>
                    <th className="py-3 px-4">Floor</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Beds</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Rent</th>
                    <th className="py-3 px-4">Tenant</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRooms.map((room) => (
                    <tr key={room.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {room.roomNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">Floor {room.floor}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{room.type}</td>
                      <td className="py-3.5 px-4 text-slate-600">{room.beds} bed{room.beds > 1 ? 's' : ''}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={room.status} />
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ₹{room.rent.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        {room.tenantName ? (
                          <span className="font-semibold text-blue-700">{room.tenantName}</span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {room.status === 'Occupied' || room.status === 'Partial' ? (
                            <button
                              onClick={() => vacateRoom(room.id)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                            >
                              Vacate
                            </button>
                          ) : (
                            <button
                              onClick={() => onOpenModal('addTenant')}
                              className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              Assign
                            </button>
                          )}
                          <button
                            onClick={() => setRoomToDelete(room)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete room"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Overview */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-slate-200/80">
          <div>
            <h3 className="font-bold text-base text-slate-900 mb-2">Building Specifications</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">{property.description}</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Total Built-up Floors</span>
                <span className="font-semibold text-slate-800">{property.floors} Floors</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Estimated Monthly Gross</span>
                <span className="font-semibold text-slate-800">₹{(property.monthlyRevenue || 98000).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Security & Surveillance</span>
                <span className="font-semibold text-emerald-600">24/7 CCTV & Biometric</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-base text-slate-900 mb-2">Amenities & Infrastructure</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-blue-800 font-medium">✓ High Speed Fiber Wi-Fi</div>
              <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-blue-800 font-medium">✓ 100% Diesel Generator Backup</div>
              <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-blue-800 font-medium">✓ Dedicated Two-wheeler Parking</div>
              <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-blue-800 font-medium">✓ Daily Housekeeping & Waste Mgmt</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Tenants */}
      {activeTab === 'Tenants' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-bold text-sm text-slate-900">Current Residents in {property.name}</h3>
            <button
              onClick={() => onOpenModal('addTenant')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Tenant
            </button>
          </div>

          {propertyTenants.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No tenants assigned to this property yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {propertyTenants.map((t) => (
                <div key={t.id} className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{t.name}</h4>
                      <p className="text-[11px] text-slate-500">Room {t.roomNumber} • {t.phone}</p>
                      <p className="text-[10px] text-slate-400">Lease: {t.moveInDate} to {t.leaseEndDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-bold text-xs text-slate-900">₹{t.monthlyRent.toLocaleString('en-IN')}</span>
                      <div className="mt-1">
                        <StatusBadge status={t.paymentStatus} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Bookings */}
      {activeTab === 'Bookings' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-bold text-sm text-slate-900">Advance Bookings for {property.name}</h3>
            <button
              onClick={() => onOpenModal('addBooking')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New Booking
            </button>
          </div>
          {propertyBookings.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No active upcoming bookings for this building.</p>
          ) : (
            <div className="space-y-3">
              {propertyBookings.map((b) => (
                <div key={b.id} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{b.guestName} ({b.guestPhone})</p>
                    <p className="text-slate-500">{b.roomNumber} • {b.type} • In: {b.checkIn} | Out: {b.checkOut}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">₹{b.amount.toLocaleString('en-IN')}</p>
                    <StatusBadge status={b.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Maintenance */}
      {activeTab === 'Maintenance' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-bold text-sm text-slate-900">Maintenance & Tickets</h3>
            <button
              onClick={() => onOpenModal('addMaintenance')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Log Issue
            </button>
          </div>
          {propertyMaintenance.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No open maintenance tickets for this property.</p>
          ) : (
            <div className="space-y-3">
              {propertyMaintenance.map((m) => (
                <div key={m.id} className="p-3.5 rounded-xl border border-slate-200 flex items-start justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{m.category}</span>
                      <StatusBadge status={m.status} />
                      <StatusBadge status={m.priority} />
                    </div>
                    <p className="text-slate-600 mt-1">{m.description}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{m.room} • Reported on {m.reportedDate}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Reports */}
      {activeTab === 'Reports' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Property Financial & Occupancy Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-semibold uppercase">Monthly Projected Rent</span>
              <p className="text-lg font-bold text-slate-900 mt-1">₹{(property.monthlyRevenue || 98000).toLocaleString('en-IN')}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-semibold uppercase">Operating Outlay</span>
              <p className="text-lg font-bold text-rose-600 mt-1">₹18,000</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-semibold uppercase">Net Operational Yield</span>
              <p className="text-lg font-bold text-emerald-600 mt-1">₹80,000 / mo</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Settings */}
      {activeTab === 'Settings' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Property Operational Rules</h3>
          <div className="space-y-3 text-xs max-w-lg">
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl">
              <div>
                <p className="font-semibold text-slate-800">Auto Rent Reminders</p>
                <p className="text-slate-400 text-[11px]">Send automatic WhatsApp notifications 3 days before due date</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
            </div>

            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl">
              <div>
                <p className="font-semibold text-slate-800">Digital Check-in KYC Verification</p>
                <p className="text-slate-400 text-[11px]">Require Aadhaar or Passport scan before room key handoff</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
            </div>
          </div>
        </div>
      )}

      {/* Delete Property Confirmation Dialog */}
      <DeleteConfirmModal
        isOpen={isDeletingProperty}
        onClose={() => setIsDeletingProperty(false)}
        onConfirm={() => {
          deleteProperty(property.id);
          setIsDeletingProperty(false);
          navigate('/properties');
        }}
        title="Delete Property"
        itemType="property"
        itemName={property?.name}
        message="Are you sure you want to delete this property?"
      />

      {/* Delete Room Confirmation Dialog */}
      <DeleteConfirmModal
        isOpen={Boolean(roomToDelete)}
        onClose={() => setRoomToDelete(null)}
        onConfirm={() => {
          if (roomToDelete) {
            deleteRoom(roomToDelete.id);
            setRoomToDelete(null);
          }
        }}
        title="Delete Room"
        itemType="room"
        itemName={`Room ${roomToDelete?.roomNumber}`}
        message="Are you sure you want to delete this room?"
      />
    </div>
  );
};
