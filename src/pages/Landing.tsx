import React, { useState } from 'react';
import { Scissors, CalendarHeart, UserCog, ArrowRight, X, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '../lib/i18n';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

const ADMIN_PASSWORD = "123456"; // depois você pode mudar

function verificarAcesso(senhaDigitada: string) {
  if (senhaDigitada === ADMIN_PASSWORD) {
    return true;
  } else {
    return false;
  }
}

export const Landing = ({ onSelectMode }: { onSelectMode: (mode: 'client' | 'admin') => void }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const { t } = useI18n();

  const handleAdminAuth = () => {
    setShowPasswordModal(true);
  };

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificarAcesso(passwordInput)) {
      toast.success(t('landing.welcome'), { id: 'auth' });
      setShowPasswordModal(false);
      onSelectMode('admin');
    } else {
      toast.error(t('landing.incorrect_password'), { id: 'auth' });
      setPasswordInput('');
    }
  };

  return (
    <div className="flex min-h-screen bg-tulip-50 relative">
      <div className="absolute top-4 right-4 z-40">
        <LanguageSwitcher />
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 md:p-8 w-full max-w-sm shadow-xl border border-tulip-100 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif text-tulip-900 flex items-center gap-2">
                <Lock size={20} className="text-tulip-400" /> {t('landing.access')}
              </h2>
              <button 
                onClick={() => setShowPasswordModal(false)} 
                className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors text-zinc-500"
              >
                 <X size={20} />
              </button>
            </div>
            <form onSubmit={submitPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-tulip-900 mb-2 ml-1">{t('landing.team_password')}</label>
                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 bg-tulip-50 border border-tulip-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-tulip-300 transition-all font-medium text-center text-lg tracking-[0.3em]"
                  placeholder="******"
                  autoFocus
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-lilac-600 hover:bg-lilac-700 text-white rounded-full py-3.5 px-6 font-medium transition-all"
              >
                {t('landing.enter')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Left/Top Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-tulip-900">
        <img 
          src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1600&q=80" 
          alt="Karlien Muller-hair Salon" 
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-tulip-950/80 via-transparent to-transparent flex flex-col justify-end p-16">
          <h2 className="text-4xl font-serif text-white mb-4" dangerouslySetInnerHTML={{ __html: t('landing.slogan') }}></h2>
          <p className="text-tulip-100 text-lg max-w-md">
            {t('landing.slogan_desc')}
          </p>
        </div>
      </div>

      {/* Right/Bottom Content Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-tulip-200/40 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-lilac-200/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-md w-full relative z-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 text-tulip-100 shadow-xl shadow-tulip-200/50 mb-6 mx-auto lg:mx-0 border-2 border-tulip-200">
            <span className="font-serif text-2xl tracking-wider pr-1">KM</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif font-thin text-tulip-950 mb-1 text-center lg:text-left tracking-tight">
            karlien Muller<span className="text-tulip-700 font-normal">-hair</span>
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-tulip-600/80 text-center lg:text-left mb-10">
            Hair &bull; Beauty &bull; Confidence
          </p>
          
          <p className="text-zinc-500 text-center lg:text-left mb-8 text-lg">
            {t('landing.how_to_access')}
          </p>

          <div className="space-y-4">
            {/* Client Option */}
            <button 
              type="button"
              onClick={() => onSelectMode('client')}
              onTouchEnd={(e) => {
                e.preventDefault();
                onSelectMode('client');
              }}
              className="block w-full cursor-pointer touch-manipulation group bg-white p-6 rounded-[24px] border border-tulip-100 shadow-sm hover:shadow-md hover:border-tulip-300 active:scale-[0.98] transition-all focus:outline-none focus:ring-4 focus:ring-tulip-200 relative z-20"
            >
              <div className="flex items-center gap-6 text-left pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-tulip-50 text-tulip-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <CalendarHeart size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-serif font-semibold text-tulip-900 mb-1">{t('landing.i_am_client')}</h3>
                  <p className="text-sm text-zinc-500">{t('landing.client_desc')}</p>
                </div>
                <div className="text-tulip-300 group-hover:text-tulip-600 group-hover:translate-x-1 transition-all">
                  <ArrowRight size={24} />
                </div>
              </div>
            </button>

            {/* Admin Option */}
            <button 
              type="button"
              onClick={handleAdminAuth}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleAdminAuth();
              }}
              className="block w-full cursor-pointer touch-manipulation group bg-white/60 p-6 rounded-[24px] border border-transparent shadow-sm hover:bg-white hover:border-lilac-200 hover:shadow-md active:scale-[0.98] transition-all focus:outline-none focus:ring-4 focus:ring-lilac-200 relative z-20"
            >
              <div className="flex items-center gap-6 text-left pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-lilac-50 text-lilac-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <UserCog size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-serif font-semibold text-tulip-900 mb-1">{t('landing.i_am_team')}</h3>
                  <p className="text-sm text-zinc-500">{t('landing.team_desc')}</p>
                </div>
                <div className="text-lilac-300 group-hover:text-lilac-600 group-hover:translate-x-1 transition-all">
                  <ArrowRight size={24} />
                </div>
              </div>
            </button>
          </div>
          
          <div className="mt-16 text-center lg:text-left text-xs font-medium text-zinc-400 uppercase tracking-widest">
            {t('landing.location')} &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
};
