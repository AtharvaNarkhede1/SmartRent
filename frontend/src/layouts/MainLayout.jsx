import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../components/common/ToastContainer';
import { AddPropertyModal } from '../components/modals/AddPropertyModal';
import { AddRoomModal } from '../components/modals/AddRoomModal';
import { AddTenantModal } from '../components/modals/AddTenantModal';
import { RecordPaymentModal } from '../components/modals/RecordPaymentModal';
import { AddMaintenanceModal } from '../components/modals/AddMaintenanceModal';
import { AddBookingModal } from '../components/modals/AddBookingModal';
import { AddTransactionModal } from '../components/modals/AddTransactionModal';
import { ConfigureQrModal } from '../components/modals/ConfigureQrModal';
import { EditOwnerProfileModal } from '../components/modals/EditOwnerProfileModal';
import { LandingPage } from '../pages/LandingPage';
import { useSmartRent } from '../context/SmartRentContext';

export const MainLayout = () => {
  const { isAuthenticated } = useSmartRent();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'addProperty' | 'addRoom' | 'addTenant' | 'editProfile' | etc.
  const [modalPayload, setModalPayload] = useState(null);

  const handleOpenModal = (modalName, payload = null) => {
    setActiveModal(modalName);
    setModalPayload(payload);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setModalPayload(null);
  };

  // If owner is not logged in, render the personalized Landing & Private Access Portal
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="relative flex h-dvh w-screen overflow-hidden bg-slate-50">

      {/* Desktop Permanent Sidebar */}
      <div className="hidden lg:block shrink-0 h-full">
        <Sidebar onEditProfile={() => handleOpenModal('editProfile')} />
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-64 max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <Sidebar
              onCloseMobile={() => setMobileOpen(false)}
              onEditProfile={() => handleOpenModal('editProfile')}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative z-10 flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          onOpenMobile={() => setMobileOpen(true)}
          onOpenModal={handleOpenModal}
          onEditProfile={() => handleOpenModal('editProfile')}
        />

        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <div className="mx-auto max-w-[1440px] space-y-6">
            <Outlet
              context={{
                onOpenModal: handleOpenModal,
                onEditProfile: () => handleOpenModal('editProfile')
              }}
            />
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <AddPropertyModal
        isOpen={activeModal === 'addProperty' || activeModal === 'editProperty'}
        onClose={handleCloseModal}
        property={activeModal === 'editProperty' ? modalPayload : null}
      />
      <AddRoomModal
        isOpen={activeModal === 'addRoom' || activeModal === 'editRoom'}
        onClose={handleCloseModal}
        room={activeModal === 'editRoom' ? modalPayload : null}
      />
      <AddTenantModal
        isOpen={activeModal === 'addTenant'}
        onClose={handleCloseModal}
      />
      <RecordPaymentModal
        isOpen={activeModal === 'addPayment'}
        onClose={handleCloseModal}
        preselectedRecord={modalPayload}
      />
      <AddMaintenanceModal
        isOpen={activeModal === 'addMaintenance'}
        onClose={handleCloseModal}
      />
      <AddBookingModal
        isOpen={activeModal === 'addBooking' || activeModal === 'editBooking'}
        onClose={handleCloseModal}
        booking={activeModal === 'editBooking' ? modalPayload : null}
      />
      <AddTransactionModal
        isOpen={activeModal === 'addTransaction'}
        onClose={handleCloseModal}
      />
      <ConfigureQrModal
        isOpen={activeModal === 'configureQr'}
        onClose={handleCloseModal}
      />
      <EditOwnerProfileModal
        isOpen={activeModal === 'editProfile'}
        onClose={handleCloseModal}
      />

      {/* Toast Feedback Alerts */}
      <ToastContainer />
    </div>
  );
};
