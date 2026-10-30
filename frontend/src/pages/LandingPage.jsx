import React, { useState } from 'react';
import {
  Building,
  Building2,
  BedDouble,
  Users,
  ReceiptIndianRupee,
  Wrench,
  BellRing,
  Sun,
  Moon,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  MapPin,
  Phone,
  Mail,
  Lock,
  User,
  X
} from 'lucide-react';
import { useSmartRent } from '../context/SmartRentContext';

export const LandingPage = () => {
  const { ownerProfile, properties, rooms, loginOwner } = useSmartRent();

  // Dark / Light Mode state persisted in localStorage
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('sr_landing_theme');
    return saved === 'dark';
  });

  // Owner login modal state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('sr_landing_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    loginOwner({ email: loginEmail, password: loginPassword });
  };

  const scrollToSection = (id) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const ownerFirstName = ownerProfile?.fullName?.split(' ')[0] || 'Rajesh';
  const totalProps = properties?.length || ownerProfile?.numProperties || 9;
  const totalRooms = rooms?.length || 52;

  // Consistent 1440px wide content wrapper class across all sections
  const containerClass = 'max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10';

  return (
    <div
      className={`min-h-screen transition-colors duration-200 font-sans relative overflow-x-hidden ${
        isDark ? 'dark bg-[#0B132B] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      {/* Subtle CalcPro Ambient Background Decorative Circles */}
      <div
        className={`ambient-orb-1 pointer-events-none transition-opacity duration-300 ${
          isDark ? 'opacity-30' : 'opacity-70'
        }`}
      />
      <div
        className={`ambient-orb-2 pointer-events-none transition-opacity duration-300 ${
          isDark ? 'opacity-20' : 'opacity-60'
        }`}
      />

      {/* ==================================================
          1. NAVIGATION BAR (Clean, polished, sticky, 76-80px height, full-width 1440px container)
          ================================================== */}
      <nav
        className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-200 ${
          isDark
            ? 'bg-[#0B132B]/95 border-slate-800/90 shadow-sm shadow-black/20'
            : 'bg-white/95 border-slate-200/90 shadow-xs'
        }`}
      >
        <div className={`${containerClass} h-20 flex items-center justify-between gap-4`}>
          {/* LEFT: SmartRent Logo (Card Container) */}
          <div
            onClick={() => scrollToSection('home')}
            className={`flex items-center gap-3 px-3 py-1.5 rounded-2xl border transition-all duration-200 cursor-pointer group shrink-0 ${
              isDark
                ? 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
                : 'bg-slate-50/80 border-slate-200/80 hover:bg-white hover:shadow-xs'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform duration-200">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight flex items-center gap-1">
                <span className={isDark ? 'text-white' : 'text-slate-900'}>Smart</span>
                <span className="text-blue-600">Rent</span>
              </span>
              <span
                className={`block text-[10px] font-bold uppercase tracking-wider -mt-0.5 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Private Property Management
              </span>
            </div>
          </div>

          {/* CENTER: Navigation Links */}
          <div className="hidden md:flex items-center gap-10 lg:gap-12 text-sm font-semibold tracking-wide">
            <button
              onClick={() => scrollToSection('home')}
              className={`transition-colors hover:text-blue-600 ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className={`transition-colors hover:text-blue-600 ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className={`transition-colors hover:text-blue-600 ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('about-owner')}
              className={`transition-colors hover:text-blue-600 ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              About Owner
            </button>
          </div>

          {/* RIGHT: Theme Toggle & Owner Login CTA */}
          <div className="flex items-center gap-3">
            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`p-2.5 rounded-xl border transition-all duration-200 shadow-xs hover:scale-105 active:scale-95 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-750 hover:border-slate-600'
                  : 'bg-white border-slate-200 text-slate-750 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Owner Login Button */}
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 hover:-translate-y-0.5 transition-all duration-150"
            >
              <span>Owner Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* ==================================================
          2. HERO SECTION (Wide, balanced, optimal space usage)
          ================================================== */}
      <section id="home" className="pt-12 sm:pt-16 pb-16 relative z-10">
        <div className={containerClass}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
            {/* Left Column: Headline & Action Buttons */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border shadow-2xs ${
                  isDark
                    ? 'bg-blue-950/70 border-blue-800/80 text-blue-300'
                    : 'bg-blue-50 border-blue-200/90 text-blue-700'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Dedicated To {ownerProfile.businessName || 'Sharma Properties'}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight leading-tight">
                Smart Property Management, <br />
                <span className="text-blue-600">Made Simple.</span>
              </h1>

              <p
                className={`text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                Everything you need to manage properties, rooms, tenants, rent and maintenance in one place.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 hover:shadow-lg transition-all"
                >
                  <span>Owner Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => scrollToSection('features')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                    isDark
                      ? 'bg-[#1C2541] hover:bg-slate-800 text-slate-200 border-slate-700'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
                  }`}
                >
                  <span>Explore Features</span>
                </button>
              </div>
            </div>

            {/* Right Column: Visual Property-Management Card (Full width in column) */}
            <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
              <div
                className={`w-full max-w-xl lg:max-w-none rounded-3xl border p-6 sm:p-7 shadow-xl relative overflow-hidden transition-all duration-200 ${
                  isDark
                    ? 'bg-[#1C2541] border-slate-700/80 shadow-black/40'
                    : 'bg-white border-blue-100 shadow-blue-500/5'
                }`}
              >
                {/* Header inside card */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base leading-tight">
                        {ownerProfile.businessName || 'Sharma Properties'}
                      </h3>
                      <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {ownerProfile.city || 'Pune, Maharashtra'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border shadow-2xs ${
                      isDark
                        ? 'bg-blue-950/70 border-blue-800/80 text-blue-300'
                        : 'bg-blue-50 border-blue-200/90 text-blue-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-400/30 animate-pulse" />
                    Live System
                  </span>
                </div>

                {/* 4 Mini Stat Blocks */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3.5 py-5">
                  <div
                    className={`p-3.5 rounded-xl border ${
                      isDark ? 'bg-[#131D38] border-slate-800' : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                      Properties
                    </span>
                    <p className="text-xl sm:text-2xl font-extrabold text-blue-600 mt-1">{totalProps}</p>
                    <span className="text-[11px] text-slate-400">Active Buildings</span>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl border ${
                      isDark ? 'bg-[#131D38] border-slate-800' : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                      Total Rooms
                    </span>
                    <p className="text-xl sm:text-2xl font-extrabold text-blue-600 mt-1">{totalRooms}</p>
                    <span className="text-[11px] text-slate-400">Inventory Units</span>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl border ${
                      isDark ? 'bg-[#131D38] border-slate-800' : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                      Occupancy
                    </span>
                    <p className="text-xl sm:text-2xl font-extrabold text-blue-600 mt-1">60%</p>
                    <span className="text-[11px] text-emerald-600 font-medium">Optimal Yield</span>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl border ${
                      isDark ? 'bg-[#131D38] border-slate-800' : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                      Collections
                    </span>
                    <p className="text-xl sm:text-2xl font-extrabold text-blue-600 mt-1">₹30,000</p>
                    <span className="text-[11px] text-slate-400">Reconciled</span>
                  </div>
                </div>

                {/* Owner Signature Bar at bottom of card */}
                <div
                  className={`pt-3.5 border-t flex items-center justify-between text-xs ${
                    isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        ownerProfile.profilePhoto ||
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={ownerProfile.fullName}
                      className="w-7 h-7 rounded-full object-cover border border-blue-200"
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {ownerProfile.fullName || 'Rajesh Sharma'}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-2xs ${
                      isDark
                        ? 'bg-blue-950/70 border-blue-800/80 text-blue-300'
                        : 'bg-blue-50 border-blue-200/90 text-blue-700'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Single Owner
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          3. HOW IT WORKS (Full-width 1440px container, 3 cards)
          ================================================== */}
      <section
        id="how-it-works"
        className={`py-16 sm:py-20 border-y transition-colors duration-200 ${
          isDark ? 'bg-[#0E1736] border-slate-800' : 'bg-white/80 border-slate-200/80'
        }`}
      >
        <div className={`${containerClass} space-y-12`}>
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              How It Works
            </h2>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Three simple steps to manage your entire property business with ease.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Step 01 */}
            <div
              className={`p-8 sm:p-9 rounded-3xl border transition-all duration-300 group hover:-translate-y-1 shadow-xs hover:shadow-md flex flex-col justify-between ${
                isDark
                  ? 'bg-[#1C2541] border-slate-700/80 hover:border-blue-500/80'
                  : 'bg-white border-slate-200/90 hover:border-blue-300 hover:shadow-blue-500/5'
              }`}
            >
              <div>
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-black text-lg flex items-center justify-center mb-6 shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform duration-200">
                  01
                </div>
                <h3 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white mb-2">Login</h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Access your private SmartRent dashboard securely anytime.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div
              className={`p-8 sm:p-9 rounded-3xl border transition-all duration-300 group hover:-translate-y-1 shadow-xs hover:shadow-md flex flex-col justify-between ${
                isDark
                  ? 'bg-[#1C2541] border-slate-700/80 hover:border-blue-500/80'
                  : 'bg-white border-slate-200/90 hover:border-blue-300 hover:shadow-blue-500/5'
              }`}
            >
              <div>
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-black text-lg flex items-center justify-center mb-6 shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform duration-200">
                  02
                </div>
                <h3 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white mb-2">Manage</h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Manage properties, rooms, tenants and rent agreements in one dashboard.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div
              className={`p-8 sm:p-9 rounded-3xl border transition-all duration-300 group hover:-translate-y-1 shadow-xs hover:shadow-md flex flex-col justify-between ${
                isDark
                  ? 'bg-[#1C2541] border-slate-700/80 hover:border-blue-500/80'
                  : 'bg-white border-slate-200/90 hover:border-blue-300 hover:shadow-blue-500/5'
              }`}
            >
              <div>
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-black text-lg flex items-center justify-center mb-6 shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform duration-200">
                  03
                </div>
                <h3 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white mb-2">Stay Updated</h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Track payments, maintenance and important reminders automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          4. FEATURES (Full-width 1440px container, 6 cards)
          ================================================== */}
      <section id="features" className="py-16 sm:py-20 relative z-10">
        <div className={`${containerClass} space-y-12`}>
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Essential Features
            </h2>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Built purely for single-owner operations with zero unnecessary corporate clutter.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1: Property Management */}
            <div
              className={`p-7 sm:p-8 rounded-3xl border transition-all duration-300 group hover:-translate-y-1.5 flex flex-col justify-between min-h-[210px] ${
                isDark
                  ? 'bg-[#1C2541] border-slate-700/80 shadow-md shadow-black/20 hover:border-blue-500/80 hover:shadow-xl hover:shadow-black/40'
                  : 'bg-white border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5'
              }`}
            >
              <div>
                <div
                  className={`w-13 h-13 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 shadow-2xs border ${
                    isDark
                      ? 'bg-blue-950/70 border-blue-900/60 text-blue-400'
                      : 'bg-blue-50 border-blue-100 text-blue-600'
                  }`}
                >
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Property Management
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Register and track your residential complexes, villas, and co-living assets.
                </p>
              </div>
            </div>

            {/* Card 2: Room Management */}
            <div
              className={`p-7 sm:p-8 rounded-3xl border transition-all duration-300 group hover:-translate-y-1.5 flex flex-col justify-between min-h-[210px] ${
                isDark
                  ? 'bg-[#1C2541] border-slate-700/80 shadow-md shadow-black/20 hover:border-blue-500/80 hover:shadow-xl hover:shadow-black/40'
                  : 'bg-white border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5'
              }`}
            >
              <div>
                <div
                  className={`w-13 h-13 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 shadow-2xs border ${
                    isDark
                      ? 'bg-blue-950/70 border-blue-900/60 text-blue-400'
                      : 'bg-blue-50 border-blue-100 text-blue-600'
                  }`}
                >
                  <BedDouble className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Room Management
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Oversee single and sharing room allotment, bed capacities, and instant vacates.
                </p>
              </div>
            </div>

            {/* Card 3: Tenant Management */}
            <div
              className={`p-7 sm:p-8 rounded-3xl border transition-all duration-300 group hover:-translate-y-1.5 flex flex-col justify-between min-h-[210px] ${
                isDark
                  ? 'bg-[#1C2541] border-slate-700/80 shadow-md shadow-black/20 hover:border-blue-500/80 hover:shadow-xl hover:shadow-black/40'
                  : 'bg-white border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5'
              }`}
            >
              <div>
                <div
                  className={`w-13 h-13 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 shadow-2xs border ${
                    isDark
                      ? 'bg-blue-950/70 border-blue-900/60 text-blue-400'
                      : 'bg-blue-50 border-blue-100 text-blue-600'
                  }`}
                >
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Tenant Management
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Maintain resident profiles, KYC verification documents, and contact logs.
                </p>
              </div>
            </div>

            {/* Card 4: Rent Tracking */}
            <div
              className={`p-7 sm:p-8 rounded-3xl border transition-all duration-300 group hover:-translate-y-1.5 flex flex-col justify-between min-h-[210px] ${
                isDark
                  ? 'bg-[#1C2541] border-slate-700/80 shadow-md shadow-black/20 hover:border-blue-500/80 hover:shadow-xl hover:shadow-black/40'
                  : 'bg-white border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5'
              }`}
            >
              <div>
                <div
                  className={`w-13 h-13 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 shadow-2xs border ${
                    isDark
                      ? 'bg-blue-950/70 border-blue-900/60 text-blue-400'
                      : 'bg-blue-50 border-blue-100 text-blue-600'
                  }`}
                >
                  <ReceiptIndianRupee className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Rent Tracking
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Track expected monthly rent, record payments, and download digital receipts.
                </p>
              </div>
            </div>

            {/* Card 5: Maintenance */}
            <div
              className={`p-7 sm:p-8 rounded-3xl border transition-all duration-300 group hover:-translate-y-1.5 flex flex-col justify-between min-h-[210px] ${
                isDark
                  ? 'bg-[#1C2541] border-slate-700/80 shadow-md shadow-black/20 hover:border-blue-500/80 hover:shadow-xl hover:shadow-black/40'
                  : 'bg-white border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5'
              }`}
            >
              <div>
                <div
                  className={`w-13 h-13 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 shadow-2xs border ${
                    isDark
                      ? 'bg-blue-950/70 border-blue-900/60 text-blue-400'
                      : 'bg-blue-50 border-blue-100 text-blue-600'
                  }`}
                >
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Maintenance
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Log repair requests, assign staff, and track expenses until resolution.
                </p>
              </div>
            </div>

            {/* Card 6: Reminders */}
            <div
              className={`p-7 sm:p-8 rounded-3xl border transition-all duration-300 group hover:-translate-y-1.5 flex flex-col justify-between min-h-[210px] ${
                isDark
                  ? 'bg-[#1C2541] border-slate-700/80 shadow-md shadow-black/20 hover:border-blue-500/80 hover:shadow-xl hover:shadow-black/40'
                  : 'bg-white border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5'
              }`}
            >
              <div>
                <div
                  className={`w-13 h-13 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 shadow-2xs border ${
                    isDark
                      ? 'bg-blue-950/70 border-blue-900/60 text-blue-400'
                      : 'bg-blue-50 border-blue-100 text-blue-600'
                  }`}
                >
                  <BellRing className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Reminders
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Send automated due notices, overdue follow-ups, and lease expiry alerts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          5. ABOUT THE OWNER (Full-width 1440px container, aligned with other sections)
          ================================================== */}
      <section
        id="about-owner"
        className={`py-16 sm:py-20 border-t transition-colors duration-200 ${
          isDark ? 'bg-[#0E1736] border-slate-800' : 'bg-white/80 border-slate-200/80'
        }`}
      >
        <div className={`${containerClass} space-y-10`}>
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              About the Owner
            </h2>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              The property portfolio owner managing this private SmartRent installation.
            </p>
          </div>

          <div
            className={`w-full p-7 sm:p-9 lg:p-10 rounded-3xl border shadow-md flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-10 transition-all ${
              isDark ? 'bg-[#1C2541] border-slate-700' : 'bg-white border-blue-100 shadow-blue-500/5'
            }`}
          >
            {/* Profile Photo */}
            <div className="relative shrink-0">
              <img
                src={
                  ownerProfile.profilePhoto ||
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
                }
                alt={ownerProfile.fullName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-white shadow-md ring-4 ring-blue-500/20"
                onError={(e) => {
                  e.target.src =
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
                }}
              />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center border-2 border-white shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Profile Info */}
            <div className="space-y-3 text-center md:text-left flex-1 min-w-0">
              <div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                  {ownerProfile.fullName || 'Rajesh Sharma'}
                </h3>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-2xs ${
                      isDark
                        ? 'bg-blue-950/70 border-blue-800/80 text-blue-300'
                        : 'bg-blue-50 border-blue-200/90 text-blue-700'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    {ownerProfile.role || 'Property Owner'}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-2xs ${
                      isDark
                        ? 'bg-blue-950/70 border-blue-800/80 text-blue-300'
                        : 'bg-blue-50 border-blue-200/90 text-blue-700'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    {ownerProfile.businessName || 'Sharma Properties'}
                  </span>
                </div>
              </div>

              {ownerProfile.city && (
                <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs sm:text-sm text-slate-500">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{ownerProfile.city}</span>
                </div>
              )}

              <p
                className={`text-xs sm:text-sm lg:text-base leading-relaxed pt-1 italic max-w-3xl ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                "{ownerProfile.bio || 'Managing properties with a simple and organized approach.'}"
              </p>

              {/* Direct Owner Contact Line */}
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-5 text-xs sm:text-sm font-medium">
                {ownerProfile.phone && (
                  <a
                    href={`tel:${ownerProfile.phone}`}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{ownerProfile.phone}</span>
                  </a>
                )}
                {ownerProfile.email && (
                  <a
                    href={`mailto:${ownerProfile.email}`}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>{ownerProfile.email}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          6. FOOTER (Clean 4-column structured full-width footer)
          ================================================== */}
      <footer
        className={`pt-16 pb-12 border-t text-xs transition-colors duration-200 ${
          isDark
            ? 'bg-[#080E21] border-slate-800/90 text-slate-400'
            : 'bg-white border-slate-200/90 text-slate-600 shadow-xs'
        }`}
      >
        <div className={containerClass}>
          {/* Main 4 Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12">
            {/* Column 1: SMARTRENT */}
            <div className="space-y-4">
              <div
                onClick={() => scrollToSection('home')}
                className={`inline-flex items-center gap-3 px-3 py-1.5 rounded-2xl border transition-all duration-200 cursor-pointer group shrink-0 ${
                  isDark
                    ? 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
                    : 'bg-slate-50/80 border-slate-200/80 hover:bg-white hover:shadow-xs'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform duration-200">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-bold tracking-tight flex items-center gap-1">
                    <span className={isDark ? 'text-white' : 'text-slate-900'}>Smart</span>
                    <span className="text-blue-600">Rent</span>
                  </span>
                  <span
                    className={`block text-[10px] font-bold uppercase tracking-wider -mt-0.5 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Private Property Management
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Dedicated personal property management system engineered exclusively for {ownerProfile.fullName || 'Rajesh Sharma'}'s portfolio.
              </p>
            </div>

            {/* Column 2: QUICK LINKS */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                Quick Links
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <button
                    onClick={() => scrollToSection('home')}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('how-it-works')}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                  >
                    How It Works
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('features')}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('about-owner')}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                  >
                    About Owner
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: OWNER */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                Owner
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  {ownerProfile.fullName || 'Rajesh Sharma'}
                </p>
                <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {ownerProfile.businessName || 'Sharma Properties'}
                </p>
                <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {ownerProfile.city || 'Pune, Maharashtra'}
                </p>
              </div>
            </div>

            {/* Column 4: CONTACT */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                Contact
              </h4>
              <div className="space-y-2.5 text-xs sm:text-sm">
                {ownerProfile.email && (
                  <a
                    href={`mailto:${ownerProfile.email}`}
                    className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 break-all"
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{ownerProfile.email}</span>
                  </a>
                )}
                {ownerProfile.phone && (
                  <a
                    href={`tel:${ownerProfile.phone}`}
                    className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{ownerProfile.phone}</span>
                  </a>
                )}
                <p className="text-[11px] text-slate-400 pt-1">
                  Direct portfolio owner communication
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Divider & Copyright */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© 2026 SmartRent. All rights reserved.</p>
            <p className="font-medium text-slate-500 dark:text-slate-400">
              Private Property Management System
            </p>
          </div>
        </div>
      </footer>

      {/* ==================================================
          7. OWNER LOGIN MODAL (Single Owner Access Portal)
          ================================================== */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowLoginModal(false)}
          />

          {/* Modal Container */}
          <div
            className={`relative rounded-3xl border w-full max-w-md p-6 sm:p-8 z-10 shadow-2xl transition-all ${
              isDark ? 'bg-[#1C2541] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Owner Login</h3>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Private portal for {ownerProfile.fullName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowLoginModal(false)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 pt-5">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Owner Email / Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 text-xs border rounded-xl focus:outline-none focus:border-blue-500 transition-colors ${
                      isDark
                        ? 'bg-[#131D38] border-slate-700 text-white focus:bg-[#0B132B]'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  PIN / Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 text-xs border rounded-xl focus:outline-none focus:border-blue-500 transition-colors ${
                      isDark
                        ? 'bg-[#131D38] border-slate-700 text-white focus:bg-[#0B132B]'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Owner Login →</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
