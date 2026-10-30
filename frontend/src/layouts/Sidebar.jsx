import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, BedDouble, Users, ReceiptIndianRupee, Wrench, FileText, BellRing, User, Settings, LogOut, Building } from 'lucide-react';
import { useSmartRent } from '../context/SmartRentContext';

export const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Rooms', path: '/rooms', icon: BedDouble },
  { name: 'People', path: '/tenants', icon: Users },
  { name: 'Payments', path: '/rent', icon: ReceiptIndianRupee },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const moreItems = [
  { name: 'Properties', path: '/properties', icon: Building2 },
  { name: 'Maintenance', path: '/maintenance', icon: Wrench },
  { name: 'Receipts', path: '/receipts', icon: FileText },
  { name: 'Reminders', path: '/reminders', icon: BellRing },
  { name: 'Profile', path: '/profile', icon: User },
];

export const Sidebar = ({ onCloseMobile, onEditProfile }) => {
  const { ownerProfile, logoutOwner } = useSmartRent();
  const navigate = useNavigate();
  const links = (items) => items.map(({ name, path, icon: Icon }) => <NavLink key={path} to={path} onClick={onCloseMobile} end={path === '/'} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${isActive ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}><Icon className="h-[17px] w-[17px] shrink-0"/><span>{name}</span></NavLink>);
  const initials = (ownerProfile?.fullName || 'Owner').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  return <aside className="relative z-30 flex h-screen w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white">
    <div>
      <div className="flex h-[68px] items-center border-b border-slate-100 px-5"><NavLink to="/" onClick={onCloseMobile} className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-700 text-white"><Building size={18}/></span><span><span className="block text-base font-semibold tracking-tight text-slate-900">Rent<span className="text-emerald-700">Smart</span></span><span className="block text-[10px] uppercase tracking-wide text-slate-400">Property management</span></span></NavLink></div>
      <nav className="space-y-1 overflow-y-auto px-3 py-5"><p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Workspace</p>{links(navItems)}<div className="mt-5 border-t border-slate-100 pt-4"><p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">More</p>{links(moreItems)}</div></nav>
    </div>
    <div className="border-t border-slate-100 bg-slate-50/50 p-3"><div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2"><button onClick={onEditProfile} className="flex min-w-0 flex-1 items-center gap-2.5 text-left" title="Edit owner profile">{ownerProfile?.profilePhoto ? <img src={ownerProfile.profilePhoto} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover"/> : <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-700 text-xs font-semibold text-white">{initials}</span>}<span className="min-w-0"><span className="block truncate text-xs font-semibold text-slate-800">{ownerProfile?.fullName || 'Property owner'}</span><span className="block truncate text-[10px] text-slate-500">{ownerProfile?.businessName || 'Account'}</span></span></button><button onClick={() => { logoutOwner(); navigate('/'); onCloseMobile?.(); }} title="Log out" aria-label="Log out" className="rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><LogOut size={16}/></button></div></div>
  </aside>;
};
