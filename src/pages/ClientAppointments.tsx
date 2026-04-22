import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { useI18n } from '../lib/i18n';
import { Calendar, Clock, User, CheckCircle2, XCircle, FileText, Search, Scissors, Shield } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Appointment } from '../types';
import toast from 'react-hot-toast';

export const ClientAppointments = () => {
  const { t, dateLocale } = useI18n();
  const { services, professionals, isAdmin, appointments: adminAppointments } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Appointment[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // If Admin, they see everything from the store. If Client, they see only results from their query.
  const displayAppointments = useMemo(() => {
    if (isAdmin) return adminAppointments;
    return searchResults;
  }, [isAdmin, adminAppointments, searchResults]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const term = searchTerm.trim();
    if (term.length < 3) {
      toast.error(t('client_appointments.min_chars') || "Escreva pelo menos 3 caracteres.");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      // Find appointments with EXACT name
      const q = query(
        collection(db, 'appointments'),
        where('clientName', '==', term)
      );
      
      const querySnapshot = await getDocs(q);
      const results: Appointment[] = [];
      querySnapshot.forEach((doc) => {
        results.push(doc.data() as Appointment);
      });

      // Also try searching by phone if input isNumeric
      if (/^\d+$/.test(term.replace(/\D/g, ''))) {
        const qPhone = query(
          collection(db, 'appointments'),
          where('clientPhone', '==', term)
        );
        const phoneSnapshot = await getDocs(qPhone);
        phoneSnapshot.forEach((doc) => {
          const data = doc.data() as Appointment;
          if (!results.find(r => r.id === data.id)) {
            results.push(data);
          }
        });
      }

      setSearchResults(results.sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time).getTime();
        const dateB = new Date(b.date + 'T' + b.time).getTime();
        return dateB - dateA;
      }));

      if (results.length === 0) {
        toast.error(t('client_appointments.no_results_found') || "Nenhum agendamento encontrado.");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(t('booking.error_toast'));
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Confirmado':
        return <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold flex items-center gap-1.5 w-max uppercase tracking-wider"><CheckCircle2 size={12}/> {t('dashboard.confirm') || 'Confirmado'}</span>;
      case 'Cancelado':
        return <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-[10px] font-bold flex items-center gap-1.5 w-max uppercase tracking-wider"><XCircle size={12}/> {t('dashboard.cancel') || 'Cancelado'}</span>;
      default:
        return <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold flex items-center gap-1.5 w-max uppercase tracking-wider"><Clock size={12}/> {status}</span>;
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#fdf8fb] pb-32">
      <div className="p-4 md:p-8 max-w-2xl mx-auto w-full">
        <div className="mb-6 md:mb-10 text-center mt-2 md:mt-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-tulip-100 text-tulip-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Shield size={24} className="md:w-8 md:h-8" />
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-tulip-950 mb-2">{t('client_appointments.title') || 'Consulta Privada'}</h1>
            <p className="text-zinc-500 text-sm md:text-base leading-relaxed">{t('client_appointments.private_subtitle') || 'Insira o seu nome exato para visualizar as suas marcações confidenciais.'}</p>
        </div>

        {/* Search Bar - Responsive Flex Layout */}
        <form onSubmit={handleSearch} className="mb-8 md:mb-12">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-tulip-400" size={20} />
              <input 
                type="text" 
                placeholder={t('client_appointments.search_placeholder_exact') || "Nome completo..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-tulip-100 rounded-[22px] focus:outline-none focus:border-tulip-400 focus:ring-4 focus:ring-tulip-100/30 transition-all text-base md:text-lg shadow-sm"
                disabled={isSearching}
              />
            </div>
            <button 
              type="submit"
              disabled={isSearching}
              className="bg-tulip-600 hover:bg-tulip-700 disabled:bg-tulip-300 text-white px-6 md:px-8 py-4 rounded-[22px] font-bold shadow-md active:scale-[0.98] transition-all text-base md:text-lg whitespace-nowrap flex items-center justify-center gap-2"
            >
              {isSearching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Search size={20} />}
              {t('client_appointments.search') || 'Consultar'}
            </button>
          </div>
        </form>

        <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {displayAppointments.length > 0 ? (
                displayAppointments.map(app => {
                    const prof = professionals.find(p => p.id === app.professionalId);
                    const service = services.find(s => s.id === app.serviceId);
                    const dateObj = parseISO(app.date);

                    return (
                        <div key={app.id} className="bg-white p-5 md:p-8 rounded-[28px] border border-tulip-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-5 md:gap-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                <div className="flex-1 w-full">
                                    <h3 className="font-bold text-xl md:text-2xl text-tulip-950 mb-1 leading-tight break-words">{app.clientName}</h3>
                                    <div className="flex items-center gap-2 text-tulip-600 font-semibold text-sm md:text-base">
                                      <Scissors size={16} className="shrink-0" />
                                      <span className="truncate">{service?.name}</span>
                                    </div>
                                </div>
                                <div className="shrink-0 w-full sm:w-auto flex justify-start sm:justify-end">{getStatusBadge(app.status)}</div>
                            </div>
                            
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-tulip-100/50 to-transparent"></div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                <div className="bg-tulip-50/40 p-4 rounded-[20px] border border-tulip-100/30">
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-tulip-400 mb-2">{t('dashboard.date_time') || 'Data e Hora'}</p>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                      <div className="flex items-center gap-2 font-bold text-zinc-800 text-sm md:text-base">
                                        <Calendar size={14} className="text-tulip-500" />
                                        <span>{format(dateObj, 'PP', { locale: dateLocale })}</span>
                                      </div>
                                      <div className="flex items-center gap-2 font-bold text-zinc-800 text-sm md:text-base">
                                        <Clock size={14} className="text-tulip-500" />
                                        <span>{app.time}h</span>
                                      </div>
                                    </div>
                                </div>
                                <div className="bg-tulip-50/40 p-4 rounded-[20px] border border-tulip-100/30">
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-tulip-400 mb-2">{t('dashboard.professional') || 'Profissional'}</p>
                                    <div className="flex items-center gap-3">
                                        <img src={prof?.photo} alt={prof?.name} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                                        <span className="font-bold text-zinc-800 text-sm md:text-base">{prof?.name}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : hasSearched && !isSearching ? (
                <div className="text-center py-16 bg-white rounded-[28px] border border-dashed border-tulip-200 flex flex-col items-center px-6">
                    <div className="w-16 h-16 bg-tulip-50 rounded-full flex items-center justify-center mb-5 text-tulip-200">
                      <FileText size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-800 mb-2">{t('client_appointments.no_results_found') || 'Nenhum agendamento encontrado.'}</h3>
                    <p className="text-zinc-500 text-sm max-w-xs mx-auto leading-relaxed">
                      {t('client_appointments.check_exact_name') || 'Verifique se escreveu o nome exato da reserva.'}
                    </p>
                </div>
            ) : null}
        </div>
      </div>
    </div>
  );
};
