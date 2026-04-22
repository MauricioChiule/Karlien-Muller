import React, { useState, Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './store';
import { I18nProvider, useI18n } from './lib/i18n';
import { Sidebar, MobileNav } from './components/Navigation';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { Landing } from './pages/Landing';
import { ArrowLeft, Scissors } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { logoutGoogle } from './lib/firebase';

// Lazy loaded routes for ultra-fast First Contentful Paint
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const ClientBooking = lazy(() => import('./pages/ClientBooking').then(m => ({ default: m.ClientBooking })));
const ClientAppointments = lazy(() => import('./pages/ClientAppointments').then(m => ({ default: m.ClientAppointments })));
const Professionals = lazy(() => import('./pages/Professionals').then(m => ({ default: m.Professionals })));
const ServicesPage = lazy(() => import('./pages/Services').then(m => ({ default: m.ServicesPage })));
const Customers = lazy(() => import('./pages/Customers').then(m => ({ default: m.Customers })));
const CalendarView = lazy(() => import('./pages/CalendarView').then(m => ({ default: m.CalendarView })));

const FallbackLoader = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-10 h-full w-full min-h-[50vh]">
    <div className="w-12 h-12 rounded-full border-4 border-tulip-100 border-t-tulip-500 animate-spin mb-4"></div>
    <p className="text-zinc-500 font-medium animate-pulse">A carregar...</p>
  </div>
);

function AppContent() {
  const { t } = useI18n();
  const [appMode, setAppMode] = useState<'landing' | 'client' | 'admin'>('landing');
  const [currentView, setCurrentView] = useState('dashboard');

  const handleLogout = async () => {
    if (appMode === 'admin') {
      try {
        await logoutGoogle();
      } catch (e) {
        console.error("Logout failed", e);
      }
    }
    setAppMode('landing');
  };

  if (appMode === 'landing') {
    return <Landing onSelectMode={setAppMode} />;
  }

  if (appMode === 'client') {
    return (
      <div className="flex flex-col min-h-screen bg-[#fdf8fb] font-sans text-zinc-800">
        <header className="bg-white/80 glass-panel border-b border-tulip-100 p-4 md:px-8 sticky top-0 z-10 flex justify-between items-center shadow-sm">
           <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 text-tulip-100 shadow-sm border border-tulip-200">
               <span className="font-serif text-lg tracking-wider pr-0.5">KM</span>
             </div>
             <h1 className="text-xl font-serif font-thin text-tulip-900 hidden sm:block">
               karlien Muller<span className="font-semibold">-hair</span>
             </h1>
           </div>
           
           <div className="flex items-center gap-2 md:gap-4">
             <LanguageSwitcher />
             <div className="hidden sm:flex items-center gap-2">
               <button 
                 onClick={() => setCurrentView('book')}
                 className={`text-sm font-semibold transition-colors px-3 py-2 rounded-lg ${currentView === 'book' ? 'text-tulip-700 bg-tulip-50' : 'text-zinc-500 hover:text-tulip-600'}`}
               >
                 {t('nav.book')}
               </button>
               <button 
                 onClick={() => setCurrentView('my-appointments')}
                 className={`text-sm font-semibold transition-colors px-3 py-2 rounded-lg ${currentView === 'my-appointments' ? 'text-tulip-700 bg-tulip-50' : 'text-zinc-500 hover:text-tulip-600'}`}
               >
                 {t('nav.appointments')}
               </button>
             </div>

             <div className="w-px h-6 bg-zinc-200 mx-1 md:mx-2 hidden sm:block"></div>

             <button 
               onClick={handleLogout}
               className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-tulip-600 transition-colors bg-white px-4 py-2 rounded-full border border-tulip-100"
             >
               <ArrowLeft size={16} /> <span className="hidden sm:inline">{t('nav.logout')}</span>
             </button>
           </div>
        </header>

        <main className="flex-1 w-full relative">
          <Suspense fallback={<FallbackLoader />}>
            {currentView === 'my-appointments' ? <ClientAppointments /> : <ClientBooking onGoToAppointments={() => setCurrentView('my-appointments')} />}
          </Suspense>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#fdf8fb] overflow-hidden font-sans text-zinc-800">
      {/* Mobile Top Header (only visible on small screens) */}
      <header className="md:hidden bg-white/80 glass-panel border-b border-tulip-100 p-4 sticky top-0 z-10 flex justify-between items-center shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 text-tulip-100 shadow-sm border border-tulip-200">
            <span className="font-serif text-lg tracking-wider pr-0.5">KM</span>
          </div>
        </div>
        <LanguageSwitcher />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout} />
        
        <main className="flex-1 overflow-y-auto w-full relative">
          <Suspense fallback={<FallbackLoader />}>
            {currentView === 'dashboard' && <Dashboard />}
            {currentView === 'calendar' && <CalendarView />}
            {currentView === 'book' && <ClientBooking />}
            {currentView === 'professionals' && <Professionals />}
            {currentView === 'services' && <ServicesPage />}
            {currentView === 'customers' && <Customers />}
          </Suspense>
        </main>
      </div>

      <MobileNav 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onLogout={handleLogout}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <AppProvider>
          <AppContent />
          <Toaster 
            position="top-center" 
            toastOptions={{
              style: {
                borderRadius: '100px',
                background: '#fff',
                color: '#3f3f46',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #fce7f3',
              },
            }}
          />
        </AppProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}
