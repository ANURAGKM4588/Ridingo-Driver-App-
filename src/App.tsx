import React, { useState } from 'react';
import { ChevronLeft, Bell, X } from 'lucide-react';
import type { TabType, ServiceItem, VehicleOption, Booking, DriverProfile } from './types';
import { MOCK_SERVICES, MOCK_VEHICLES, MOCK_BOOKINGS, MOCK_NOTIFICATIONS } from './data/mockData';

// Layout & Components
import { HeaderBar } from './components/HeaderBar';
import { FloatingNav } from './components/FloatingNav';

// Views
import { HomeView } from './views/HomeView';
import { BookingsView } from './views/BookingsView';
import { LiveTrackingView } from './views/LiveTrackingView';
import { WalletView } from './views/WalletView';
import { ProfileView } from './views/ProfileView';

// Modals & Sub-screens
import { BookingFlowModal } from './views/BookingFlowModal';
import { BookingConfirmationView } from './views/BookingConfirmationView';
import { BookingReviewScreen } from './views/BookingReviewScreen';
import { InvoicePaymentScreen } from './views/InvoicePaymentScreen';
import { PaymentSettingsView } from './views/PaymentSettingsView';
import { SupportChatView } from './views/SupportChatView';
import { LanguageRegionSettingsView } from './views/LanguageRegionSettingsView';
import { NotificationsView } from './views/NotificationsView';
import { DriverProfileModal } from './views/DriverProfileModal';
import { AuthView } from './views/AuthView';
import { LanguageCode } from './data/translations';
import { RegionCode } from './data/currencies';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en-us');
  const [currentRegion, setCurrentRegion] = useState<RegionCode>('in');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOption>(MOCK_VEHICLES[0]);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(MOCK_BOOKINGS[0]);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [userProfile, setUserProfile] = useState({
    name: 'Alexander Vance',
    email: 'alexander.vance@executive.com',
    phone: '+1 (555) 019-2834',
  });

  // View / Modal Flags
  const [isBookingFlowOpen, setIsBookingFlowOpen] = useState<boolean>(false);
  const [selectedServiceForFlow, setSelectedServiceForFlow] = useState<ServiceItem | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  
  // Booking Review & Invoice Screen State
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState<boolean>(false);
  const [isPaymentSettingsOpen, setIsPaymentSettingsOpen] = useState<boolean>(false);
  const [isSupportChatOpen, setIsSupportChatOpen] = useState<boolean>(false);
  const [isLanguageSettingsOpen, setIsLanguageSettingsOpen] = useState<boolean>(false);
  const [bookingDraft, setBookingDraft] = useState<any>(null);

  // Driver Profile Modal State
  const [driverModalProfile, setDriverModalProfile] = useState<DriverProfile | null>(null);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState<boolean>(false);

  // Auth View Modal State - Open by default so Login screen appears first
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(true);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');
  const [authKey, setAuthKey] = useState<number>(0);

  // Handlers
  const handleSelectService = (service: ServiceItem) => {
    setSelectedServiceForFlow(service);
    setIsBookingFlowOpen(true);
  };

  const handleStartBooking = (params: any) => {
    setBookingDraft(params);
    setIsReviewOpen(true);
  };

  const handleBookingConfirmed = (newBooking: Booking) => {
    setBookings([newBooking, ...bookings]);
    setActiveBooking(newBooking);
    setConfirmedBooking(newBooking);
    setIsBookingFlowOpen(false);
    setIsReviewOpen(false);
    setIsInvoiceOpen(false);
    setIsConfirmationOpen(true);
  };

  const handleOpenDriverProfile = (driver: DriverProfile) => {
    setDriverModalProfile(driver);
    setIsDriverModalOpen(true);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen h-screen w-full bg-slate-900 md:bg-slate-950 flex items-center justify-center selection:bg-[#fcd502] overflow-hidden p-0 md:p-3">
      {/* Sleek Mobile App Container for All Mobile Devices, iPhone Notch, iPads & Desktop */}
      <div className="w-full max-w-md h-full md:h-[94vh] max-h-screen md:rounded-[44px] bg-white flex flex-col relative shadow-2xl border-x md:border border-slate-200/80 overflow-hidden">
        {/* Global Header Bar */}
        {activeTab === 'home' && !isReviewOpen && !isInvoiceOpen && !isConfirmationOpen && !isPaymentSettingsOpen && !isSupportChatOpen && !isLanguageSettingsOpen && (
          <HeaderBar
            userName={userProfile.name}
            unreadNotificationsCount={unreadCount}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onOpenProfile={() => setActiveTab('profile')}
          />
        )}

        {/* Main Content Area based on Active Tab or Views */}
        {(() => {
          const isFullView = isReviewOpen || isInvoiceOpen || isConfirmationOpen || isPaymentSettingsOpen || isSupportChatOpen || isLanguageSettingsOpen || activeTab === 'wallet' || activeTab === 'bookings';
          // Home tab uses pt-0 — greeting handles its own top spacing.
          // Other tabs use pt-3.5 for standard content padding.
          const topPad = activeTab === 'home' ? 'pt-0' : 'pt-3.5';
          return (
            <main className={`flex-1 relative flex flex-col min-h-0 w-full ${isFullView ? 'p-0 overflow-hidden' : `px-4 ${topPad} pb-24 overflow-y-auto scrollbar-none`}`}>
              {isLanguageSettingsOpen ? (
                <LanguageRegionSettingsView
                  onBack={() => setIsLanguageSettingsOpen(false)}
                  currentLanguage={currentLanguage}
                  onLanguageChange={(lang) => setCurrentLanguage(lang)}
                  currentRegion={currentRegion}
                  onRegionChange={(reg) => setCurrentRegion(reg)}
                />
              ) : isSupportChatOpen ? (
                <SupportChatView onBack={() => setIsSupportChatOpen(false)} />
              ) : isPaymentSettingsOpen ? (
                <PaymentSettingsView onBack={() => setIsPaymentSettingsOpen(false)} />
              ) : isReviewOpen && bookingDraft ? (
                <BookingReviewScreen
                  draft={bookingDraft}
                  onBack={() => setIsReviewOpen(false)}
                  onConfirm={() => {
                    setIsReviewOpen(false);
                    setIsInvoiceOpen(true);
                  }}
                  currentRegion={currentRegion}
                />
              ) : isInvoiceOpen && bookingDraft ? (
                <InvoicePaymentScreen
                  bookingDraft={bookingDraft}
                  onBack={() => {
                    setIsInvoiceOpen(false);
                    setIsReviewOpen(true);
                  }}
                  onConfirmPayment={(finalBooking) => {
                    setIsInvoiceOpen(false);
                    handleBookingConfirmed(finalBooking);
                  }}
                  onCloseToBookings={(pendingBooking) => {
                    setIsInvoiceOpen(false);
                    setBookings([pendingBooking, ...bookings]);
                    setActiveBooking(pendingBooking);
                    setActiveTab('bookings');
                  }}
                  currentRegion={currentRegion}
                />
              ) : isConfirmationOpen && confirmedBooking ? (
                <BookingConfirmationView
                  booking={confirmedBooking}
                  onTrackDriver={() => {
                    setIsConfirmationOpen(false);
                    setActiveTab('activity');
                  }}
                  onClose={() => setIsConfirmationOpen(false)}
                  currentRegion={currentRegion}
                />
              ) : (
                <>
                  {activeTab === 'home' && (
                    <HomeView
                      key={authKey}
                      userName={userProfile.name}
                      onSelectService={handleSelectService}
                      onSelectVehicle={setSelectedVehicle}
                      selectedVehicle={selectedVehicle}
                      onStartBooking={handleStartBooking}
                      onOpenDriverProfile={handleOpenDriverProfile}
                      recentBookings={bookings}
                      recentBooking={bookings[0]}
                      onViewAllBookings={() => setActiveTab('bookings')}
                      onRepeatBooking={(b) => {
                        setSelectedVehicle(b.vehicle);
                        setIsBookingFlowOpen(true);
                      }}
                      currentLanguage={currentLanguage}
                      currentRegion={currentRegion}
                    />
                  )}

                  {activeTab === 'bookings' && (
                    <BookingsView
                      bookings={bookings}
                      onRepeatBooking={(b) => {
                        setSelectedVehicle(b.vehicle);
                        setIsBookingFlowOpen(true);
                      }}
                      onOpenDriverProfile={handleOpenDriverProfile}
                      currentRegion={currentRegion}
                    />
                  )}

                  {activeTab === 'activity' && (
                    <LiveTrackingView
                      booking={activeBooking}
                      onOpenDriverProfile={handleOpenDriverProfile}
                      onCancelRide={() => {
                        if (confirm("Are you sure you want to cancel this chauffeur booking?")) {
                          setActiveBooking(null);
                          alert("Booking cancelled.");
                        }
                      }}
                    />
                  )}

                  {activeTab === 'wallet' && <WalletView currentRegion={currentRegion} />}

                  {activeTab === 'profile' && (
                    <ProfileView
                      userName={userProfile.name}
                      userEmail={userProfile.email}
                      userPhone={userProfile.phone}
                      onOpenWallet={() => setIsPaymentSettingsOpen(true)}
                      onOpenSupport={() => setIsSupportChatOpen(true)}
                      onOpenLanguage={() => setIsLanguageSettingsOpen(true)}
                      onOpenAuth={(mode = 'login') => {
                        setAuthInitialMode(mode);
                        setIsAuthOpen(true);
                      }}
                      currentLanguage={currentLanguage}
                      currentRegion={currentRegion}
                    />
                  )}
                </>
              )}
            </main>
          );
        })()}

        {/* Floating Bottom Navigation - Hidden during review, payment, dispatch, support chat, settings & confirmation screens */}
        {!isReviewOpen && !isInvoiceOpen && !isConfirmationOpen && !isBookingFlowOpen && !isPaymentSettingsOpen && !isSupportChatOpen && !isLanguageSettingsOpen && (
          <FloatingNav activeTab={activeTab} onTabChange={setActiveTab} currentLanguage={currentLanguage} />
        )}

        {/* 8-Step Interactive Booking Flow Wizard Modal */}
        <BookingFlowModal
          isOpen={isBookingFlowOpen}
          onClose={() => setIsBookingFlowOpen(false)}
          initialService={selectedServiceForFlow}
          initialVehicle={selectedVehicle}
          onBookingConfirmed={handleBookingConfirmed}
        />

        {/* Driver Profile Modal */}
        <DriverProfileModal
          driver={driverModalProfile}
          isOpen={isDriverModalOpen}
          onClose={() => setIsDriverModalOpen(false)}
        />

        {/* Right-Slide Notification Drawer Panel */}
        {isNotificationsOpen && (
          <div className="absolute inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
            {/* Dark Backdrop overlay click to dismiss */}
            <div
              className="absolute inset-0"
              onClick={() => setIsNotificationsOpen(false)}
            />

            {/* Right Slide Panel Container */}
            <div className="relative w-[340px] max-w-full h-full bg-[#FAFAFA] shadow-2xl flex flex-col z-10 animate-slide-left border-l border-slate-200/80">
              {/* Minimal Single-Line Drawer Top Header with Downward Safe Padding */}
              <div className="px-4 pt-7 pb-3 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">Notifications</h3>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#fcd502] text-[#121212] text-[10px] font-black">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setNotifications(notifications.map((n) => ({ ...n, read: true })))}
                  className="text-[11px] font-extrabold text-[#a18200] hover:underline whitespace-nowrap cursor-pointer"
                >
                  Mark all read
                </button>
              </div>

              {/* Scrollable Notification List */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 scrollbar-none relative">
                <NotificationsView
                  notifications={notifications}
                  hideHeader={true}
                  onMarkAllRead={() => {
                    setNotifications(notifications.map((n) => ({ ...n, read: true })));
                  }}
                />
              </div>

              {/* Thumb-Friendly Bottom Round Transparent Close Icon Button */}
              <div className="p-3 bg-transparent flex justify-center pb-5">
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="w-11 h-11 rounded-full bg-slate-900/10 hover:bg-slate-900/20 backdrop-blur-md border border-slate-300/80 text-slate-800 flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-lg"
                  aria-label="Close Notifications"
                >
                  <X className="w-5 h-5 text-slate-900 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Auth View Modal (Login & Sign Up) */}
        {isAuthOpen && (
          <AuthView
            onClose={() => setIsAuthOpen(false)}
            initialMode={authInitialMode}
            onSuccess={(userData) => {
              setUserProfile({
                name: userData.name || 'Alexander Vance',
                email: userData.email || 'alexander.vance@executive.com',
                phone: userData.phone || '+1 (555) 019-2834',
              });
              setAuthKey((prev) => prev + 1);
              setIsAuthOpen(false);
              setActiveTab('home');
            }}
            currentLanguage={currentLanguage}
          />
        )}
      </div>
    </div>
  );
}

export default App;
