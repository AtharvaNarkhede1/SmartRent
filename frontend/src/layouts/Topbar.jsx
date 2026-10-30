import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Plus,
  Building,
  BedDouble,
  UserPlus,
  Wrench,
  Receipt,
  Calendar,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSmartRent } from '../context/SmartRentContext';

export const Topbar = ({ onOpenMobile, onOpenModal, onEditProfile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activities, markNotificationRead, markAllNotificationsRead, ownerProfile, logoutOwner } = useSmartRent();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadNotifications = activities.filter((item) => !item.isRead).length;

  const todayStr = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  const firstName = ownerProfile?.fullName?.split(' ')[0] || 'Owner';
  const pageTitle = ({ '/': 'Dashboard', '/rooms': 'Rooms', '/tenants': 'People', '/rent': 'Payments', '/settings': 'Settings', '/properties': 'Properties', '/maintenance': 'Maintenance', '/receipts': 'Receipts', '/reminders': 'Reminders', '/profile': 'Profile' })[location.pathname] || 'RentSmart';

  return (
    <header className="h-20 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 transition-all duration-200 shadow-xs">
      {/* LEFT: Mobile Hamburger + SmartRent Brand Logo (Matching Home Page Navbar) */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Branded Logo Container (shown on mobile when sidebar is hidden) */}
        <Link
          to="/"
          className="flex lg:hidden items-center gap-3 px-3 py-1.5 rounded-2xl border border-slate-200/80 bg-slate-50/80 hover:bg-white hover:shadow-xs transition-all duration-200 group shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center group-hover:bg-emerald-800 transition-colors">
            <Building className="w-5 h-5" />
          </div>
          <div>
              <span className="text-base font-semibold tracking-tight flex items-center gap-1">
              <span className="text-slate-900">Rent</span>
              <span className="text-emerald-700">Smart</span>
            </span>
            <span className="hidden sm:block text-[10px] font-bold uppercase tracking-wider -mt-0.5 text-slate-500">
              Private Property Management
            </span>
          </div>
        </Link>

        {/* Date Display Pill */}
        <div className="hidden lg:block"><h1 className="text-sm font-semibold text-slate-900">{pageTitle}</h1><p className="mt-0.5 text-[11px] text-slate-500">{todayStr}</p></div>
      </div>

      {/* RIGHT: Quick Add Button, Notifications Bell, Owner Profile Chip */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Add Menu */}
        <div className="relative">
          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 hover:-translate-y-0.5 transition-all duration-150"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add New</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {showQuickAdd && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowQuickAdd(false)}
              />
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200/80 py-2 z-30 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    setShowQuickAdd(false);
                    onOpenModal('addProperty');
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors"
                >
                  <Building className="w-4 h-4 text-blue-500" />
                  <span>New Property</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickAdd(false);
                    onOpenModal('addRoom');
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors"
                >
                  <BedDouble className="w-4 h-4 text-indigo-500" />
                  <span>New Room</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickAdd(false);
                    onOpenModal('addTenant');
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-emerald-500" />
                  <span>New Tenant</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickAdd(false);
                    onOpenModal('addPayment');
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors"
                >
                  <Receipt className="w-4 h-4 text-sky-500" />
                  <span>Record Payment</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickAdd(false);
                    onOpenModal('addMaintenance');
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors"
                >
                  <Wrench className="w-4 h-4 text-amber-500" />
                  <span>Log Maintenance</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 shadow-xs hover:scale-105 active:scale-95 transition-all duration-200 relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200/80 p-3 z-30 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Notifications</h4>
                    <span className="text-[10px] font-semibold text-slate-500">{unreadNotifications} unread</span>
                  </div>
                  {unreadNotifications > 0 && <button type="button" onClick={markAllNotificationsRead} className="text-[10px] font-semibold text-blue-600 hover:text-blue-800">Mark all read</button>}
                </div>

                <div className="py-2 space-y-2 max-h-60 overflow-y-auto">
                  {activities.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No notifications yet.</p>}
                  {activities.slice(0, 12).map((item) => (
                    <button key={item.id} type="button" onClick={() => !item.isRead && markNotificationRead(item.id)} className={`w-full rounded-lg border p-2.5 text-left transition-colors ${item.isRead ? 'border-slate-100 bg-white' : 'border-blue-100 bg-blue-50/70 hover:bg-blue-50'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs ${item.isRead ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'}`}>{item.desc}</p>
                        {!item.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" aria-label="Unread" />}
                      </div>
                      <p className="mt-1 text-[10px] text-slate-500">{item.time}</p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Personalized Owner Quick Chip */}
        <button
          onClick={onEditProfile}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 bg-slate-50/90 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-200 rounded-xl transition-all shadow-2xs group"
          title="Click to view/edit owner profile"
        >
          {ownerProfile?.profilePhoto ? (
            <img
              src={ownerProfile.profilePhoto}
              alt={ownerProfile.fullName}
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200/80 group-hover:scale-105 transition-transform"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fb = e.currentTarget.parentElement?.querySelector('.topbar-avatar-fallback');
                if (fb) {
                  fb.classList.remove('hidden');
                  fb.classList.add('flex');
                }
              }}
            />
          ) : null}
          <div
            className={`topbar-avatar-fallback w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs items-center justify-center shadow-xs ${
              ownerProfile?.profilePhoto ? 'hidden' : 'flex'
            }`}
          >
            {firstName[0]}
          </div>
          <div className="hidden md:block text-left">
            <span className="block text-xs font-bold text-slate-800 leading-tight">
              {firstName}
            </span>
            <span className="block text-[10px] font-medium text-slate-500">
              {ownerProfile?.role || 'Property Owner'}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            logoutOwner();
            navigate('/');
          }}
          className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-2.5 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50 sm:px-3"
          title="Log out of the admin account"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </button>
      </div>
    </header>
  );
};
