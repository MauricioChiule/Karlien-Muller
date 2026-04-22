import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { useI18n } from '../lib/i18n';
import { Calendar, Clock, User, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const ClientAppointments = () => {
  const { t, dateLocale } = useI18n();
  const { publicSlots, services, professionals } = useAppStore();
  const [myAppIds, setMyAppIds] = useState<string[]>([]);

  useEffect(() => {
    // We now securely store only the IDs of the appointments the user created on this device.
    const storedIds = localStorage.getItem('my_appointment_ids');
    if (storedIds) {
      try {
        setMyAppIds(JSON.parse(storedIds));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Use public slots to see the status of our apps
  const myAppointments = myAppIds.map(appId => {
    return publicSlots.find(slot => slot.appId === appId);
  }).filter(Boolean);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Confirmado':
        return <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1.5 w-max"><CheckCircle2 size={14}/> {t('dashboard.confirm') || 'Confirmado'}</span>;
      case 'Cancelado':
        return <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1.5 w-max"><XCircle size={14}/> {t('dashboard.cancel') || 'Cancelado'}</span>;
      default:
        return <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold flex items-center gap-1.5 w-max"><Clock size={14}/> {status}</span>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fdf8fb] pb-32">
      <div className="p-4 md:p-8 max-w-2xl mx-auto w-full">
        <div className="mb-8 mt-4 text-center">
            <div className="w-16 h-16 bg-tulip-100 text-tulip-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} />
            </div>
            <h1 className="text-3xl font-serif font-bold text-tulip-950 mb-3">{t('client_appointments.title')}</h1>
            <p className="text-zinc-500">{t('client_appointments.subtitle')}</p>
        </div>

        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {myAppointments.length > 0 ? (
                myAppointments.map(slot => {
                    if (!slot) return null;
                    const prof = professionals.find(p => p.id === slot.professionalId);
                    const dateObj = parseISO(slot.date);

                    return (
                        <div key={slot.id} className="bg-white p-5 rounded-[24px] border border-tulip-100 shadow-sm flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="pr-4">
                                    <h3 className="font-bold text-lg text-tulip-950">{t('client_appointments.appointment')}</h3>
                                    <p className="text-sm text-zinc-500 mt-1 capitalize">{t('client_appointments.ref')}: {slot.appId.slice(0, 8)}...</p>
                                </div>
                                <div>{getStatusBadge(slot.status)}</div>
                            </div>
                            
                            <div className="w-full h-px bg-tulip-50"></div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-tulip-400" />
                                    <span className="font-semibold text-zinc-700">{format(dateObj, 'PP', { locale: dateLocale })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-tulip-400" />
                                    <span className="font-semibold text-zinc-700">{slot.time}h</span>
                                </div>
                                <div className="flex items-center gap-2 col-span-2">
                                    <User size={16} className="text-tulip-400" />
                                    <span className="text-zinc-600">{t('dashboard.professional')}: <strong className="text-zinc-800">{prof?.name}</strong></span>
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="text-center py-12 bg-white rounded-[24px] border border-tulip-100 flex flex-col items-center">
                    <FileText className="w-12 h-12 text-zinc-300 mb-3" />
                    <p className="text-zinc-500 text-lg">{t('client_appointments.no_results')}</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
