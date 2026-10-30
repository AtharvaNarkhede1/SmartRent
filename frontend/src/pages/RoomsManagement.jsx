import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  BedDouble,
  DoorClosed,
  DoorOpen,
  PieChart,
  Plus,
  Search,
  Edit,
  Trash2
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { useSmartRent } from '../context/SmartRentContext';
import { DeleteConfirmModal } from '../components/common/DeleteConfirmModal';

export const RoomsManagement = () => {
  const { onOpenModal } = useOutletContext();
  const navigate = useNavigate();
  const { rooms, properties, vacateRoom, assignTenantToRoom, deleteRoom } = useSmartRent();
  const [roomToDelete, setRoomToDelete] = useState(null);

  // Dynamic calculations from state
  const totalRoomsCount = rooms.length;
  const occupiedCount = rooms.filter((r) => r.status === 'Occupied' || r.status === 'Partial').length;
  const vacantCount = rooms.filter((r) => r.status === 'Vacant').length;
  const maintenanceCount = rooms.filter((r) => r.status === 'Maintenance').length;
  const occupancyRate = totalRoomsCount > 0 ? Math.round((occupiedCount / totalRoomsCount) * 100) : 0;

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('All');
  const [selectedFloor, setSelectedFloor] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Filter logic
  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.tenantName && r.tenantName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesProperty = selectedProperty === 'All' || r.propertyName === selectedProperty;
    const matchesFloor = selectedFloor === 'All' || r.floor.toString() === selectedFloor;
    const matchesType = selectedType === 'All' || r.type === selectedType;
    const matchesStatus = selectedStatus === 'All' || r.status === selectedStatus;

    return matchesSearch && matchesProperty && matchesFloor && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Room Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Filter by property, floor, status, and type. Assign tenants or vacate rooms.
          </p>
        </div>

        <button
          onClick={() => onOpenModal('addRoom')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Room</span>
        </button>
      </div>

      {/* 4 Primary Room Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BedDouble}
          label="Total Rooms"
          value={totalRoomsCount}
          description="Across all floors & properties"
          trend={`${properties.length} Properties`}
          trendType="neutral"
          onClick={() => setSelectedStatus('All')}
        />
        <StatCard
          icon={DoorClosed}
          label="Occupied"
          value={occupiedCount}
          description="Full & partial contracts"
          trend={`${occupancyRate}% Rate`}
          trendType="positive"
          onClick={() => setSelectedStatus('Occupied')}
        />
        <StatCard
          icon={DoorOpen}
          label="Vacant"
          value={vacantCount}
          description="Ready for allotment & move-in"
          trend={`${vacantCount} Available`}
          trendType="neutral"
          onClick={() => setSelectedStatus('Vacant')}
        />
        <StatCard
          icon={PieChart}
          label="Occupancy Rate"
          value={`${occupancyRate}%`}
          description={maintenanceCount > 0 ? `${maintenanceCount} room in maintenance` : 'Portfolio-wide occupancy'}
          trend="Healthy"
          trendType="positive"
          onClick={() => setSelectedStatus('All')}
        />
      </div>

      {/* Multi-Parameter Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search room #, property, tenant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Property Dropdown */}
          <div className="w-full md:w-auto flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 bg-white text-slate-700"
            >
              <option value="All">All Properties</option>
              {properties.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Floor Dropdown */}
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 bg-white text-slate-700"
            >
              <option value="All">All Floors</option>
              <option value="1">Floor 1</option>
              <option value="2">Floor 2</option>
              <option value="3">Floor 3</option>
              <option value="4">Floor 4</option>
            </select>

            {/* Type Dropdown */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 bg-white text-slate-700"
            >
              <option value="All">All Types</option>
              <option value="Single">Single</option>
              <option value="Double Sharing">Double Sharing</option>
              <option value="Triple Sharing">Triple Sharing</option>
              <option value="Suite">Suite</option>
              <option value="Private">Private</option>
            </select>

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 bg-white text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Occupied">Occupied</option>
              <option value="Vacant">Vacant</option>
              <option value="Partial">Partial</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Reserved">Reserved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Room & Floor</th>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Type & Beds</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Rent (₹)</th>
                <th className="py-3 px-4">Assigned Tenant</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRooms.map((room) => (
                <tr key={room.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 text-sm">Room {room.roomNumber}</span>
                    <span className="block text-[11px] text-slate-400">Floor {room.floor}</span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {room.propertyName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800">{room.type}</span>
                    <span className="block text-[11px] text-slate-400">{room.beds} bed{room.beds > 1 ? 's' : ''}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={room.status} />
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    ₹{room.rent.toLocaleString('en-IN')}
                    <span className="text-[10px] text-slate-400 font-normal"> /mo</span>
                  </td>
                  <td className="py-3.5 px-4">
                    {room.tenantName ? (
                      <div>
                        <span className="font-semibold text-blue-700">{room.tenantName}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Vacant / Unoccupied</span>
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
                          Assign Tenant
                        </button>
                      )}

                      <button
                        onClick={() => onOpenModal('editRoom', room)}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        title="Edit room"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

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

      {/* Mobile Stacked Room Cards View */}
      <div className="md:hidden space-y-3">
        {filteredRooms.map((room) => (
          <div key={room.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-base font-bold text-slate-900">Room {room.roomNumber}</span>
                <p className="text-xs text-slate-500 font-medium">{room.propertyName} • Floor {room.floor}</p>
              </div>
              <StatusBadge status={room.status} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Type</span>
                <p className="font-semibold text-slate-800">{room.type} ({room.beds} Beds)</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Monthly Rent</span>
                <p className="font-bold text-slate-900">₹{room.rent.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {room.tenantName && (
              <div className="text-xs text-slate-700">
                <span className="text-slate-400">Resident: </span>
                <span className="font-semibold text-blue-600">{room.tenantName}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              {room.status === 'Occupied' || room.status === 'Partial' ? (
                <button
                  onClick={() => vacateRoom(room.id)}
                  className="flex-1 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg text-center"
                >
                  Vacate Room
                </button>
              ) : (
                <button
                  onClick={() => onOpenModal('addTenant')}
                  className="flex-1 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-center"
                >
                  Assign Tenant
                </button>
              )}

              <button
                onClick={() => setRoomToDelete(room)}
                className="py-1.5 px-3 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg text-center flex items-center justify-center gap-1"
                title="Delete room"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
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
        itemName={`Room ${roomToDelete?.roomNumber} (${roomToDelete?.propertyName})`}
        message="Are you sure you want to delete this room?"
      />
    </div>
  );
};
