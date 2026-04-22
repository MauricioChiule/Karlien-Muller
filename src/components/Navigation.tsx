import React from 'react';
import { Home, Users, Scissors, CalendarPlus, CalendarDays, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useI18n } from '../lib/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem = ({ icon, label, isActive, onClick }: NavItemProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300",
        isActive 
          ? "bg-tulip-100 text-tulip-700 shadow-sm" 
          : "text-zinc-500 hover:bg-tulip-50 hover:text-tulip-600"
      )}
    >
      <div className={cn("p-1.5 rounded-xl", isActive ? "bg-white/60" : "")}>
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </button>
  );
};

export const Sidebar = ({ 
  currentView, 
  setCurrentView,
  onLogout
}: { 
  currentView: string; 
  setCurrentView: (view: string) => void;
  onLogout: () => void;
}) => {
  const { t } = useI18n();

  return (
    <aside className="hidden h-screen w-72 flex-col border-r border-tulip-100 bg-white/80 p-6 glass-panel md:flex sticky top-0">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 text-tulip-100 shadow-lg shadow-tulip-200 border-2 border-tulip-200 shrink-0">
          <span className="font-serif text-xl tracking-wider pr-0.5">KM</span>
        </div>
        <div>
          <h1 className="text-xl font-serif font-thin text-tulip-900 tracking-tight leading-tight">
            karlien Muller<span className="font-semibold">-hair</span>
          </h1>
          <p className="text-[9px] font-bold text-tulip-600/80 tracking-widest uppercase mt-0.5">Hair &bull; Beauty</p>
        </div>
      </div>

      <div className="mb-6 px-2">
        <LanguageSwitcher />
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        <NavItem 
          icon={<Home size={20} />} 
          label={t('nav.dashboard')} 
          isActive={currentView === 'dashboard'} 
          onClick={() => setCurrentView('dashboard')} 
        />
        <NavItem 
          icon={<CalendarDays size={20} />} 
          label={t('nav.calendar')} 
          isActive={currentView === 'calendar'} 
          onClick={() => setCurrentView('calendar')} 
        />
        <NavItem 
          icon={<CalendarPlus size={20} />} 
          label={t('nav.new_reservation')} 
          isActive={currentView === 'book'} 
          onClick={() => setCurrentView('book')} 
        />
        
        <div className="mt-8 mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {t('nav.management')}
        </div>
        <NavItem 
          icon={<Users size={20} />} 
          label={t('nav.professionals')} 
          isActive={currentView === 'professionals'} 
          onClick={() => setCurrentView('professionals')} 
        />
        <NavItem 
          icon={<Scissors size={20} />} 
          label={t('nav.services')} 
          isActive={currentView === 'services'} 
          onClick={() => setCurrentView('services')} 
        />
        <NavItem 
          icon={<Users size={20} />} 
          label={t('nav.customers')} 
          isActive={currentView === 'customers'} 
          onClick={() => setCurrentView('customers')} 
        />
      </nav>

      <div className="pt-6 border-t border-tulip-100 mt-auto">
        <button 
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-500 font-medium hover:bg-zinc-50 transition-colors"
        >
          {t('nav.exit')}
        </button>
      </div>
    </aside>
  );
};

export const MobileNav = ({ 
  currentView, 
  setCurrentView,
  onLogout
}: { 
  currentView: string; 
  setCurrentView: (view: string) => void;
  onLogout: () => void;
}) => {
  const { t } = useI18n();

  const navItems = [
    { id: 'dashboard', icon: Home, label: t('nav.home') },
    { id: 'calendar', icon: CalendarDays, label: t('nav.calendar') },
    { id: 'book', icon: CalendarPlus, label: t('nav.book') },
    { id: 'customers', icon: Users, label: t('nav.customers') },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-tulip-100 bg-white/90 p-2 pb-safe md:hidden">
      <div className="flex justify-around items-center relative">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-xl transition-all w-20 min-h-[50px]",
                isActive ? "text-tulip-600" : "text-zinc-400"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-full mb-1 transition-all",
                isActive ? "bg-tulip-100" : "bg-transparent"
              )}>
                <Icon size={20} className={isActive ? "text-tulip-600" : ""} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={onLogout}
          className="flex flex-col items-center justify-center p-3 rounded-xl transition-all w-20 min-h-[50px] text-zinc-400"
        >
          <div className="p-1.5 rounded-full mb-1 transition-all bg-transparent">
            <LogOut size={20} />
          </div>
          <span className="text-[10px] font-medium">{t('nav.exit') || 'Sair'}</span>
        </button>
      </div>
    </div>
  );
};
