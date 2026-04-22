import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../store';
import { useI18n } from '../lib/i18n';
import { format, parse, isBefore, startOfToday, parseISO, addDays, getDay, isToday } from 'date-fns';
import { CheckCircle2, ChevronRight, Calendar as CalendarIcon, Clock, User, Scissors, ArrowLeft, Phone, MessageCircle } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import toast from 'react-hot-toast';
import { Appointment } from '../types';

export const ClientBooking = ({ onGoToAppointments }: { onGoToAppointments?: () => void }) => {
  const { services, professionals, publicSlots, appointments, addAppointment } = useAppStore();
  const { t, dateLocale } = useI18n();
  const [step, setStep] = useState(1);

  
  // Form State
  const [serviceId, setServiceId] = useState('');
  const [professionalId, setProfessionalId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Scroll to top on step change safely for old Android devices
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      // Fallback for older browsers that don't support ScrollToOptions object
      window.scrollTo(0, 0);
    }
  }, [step]);

  // Derived Values
  const selectedService = services.find(s => s.id === serviceId);
  const selectedProfessional = professionals.find(p => p.id === professionalId);

  // Filter professionals offering selected service
  const availableProfessionals = useMemo(() => {
    if (!serviceId) return [];
    return professionals.filter(p => Array.isArray(p.specialties) && p.specialties.includes(serviceId));
  }, [professionals, serviceId]);

  // Next 14 days for date selection
  const upcomingDays = useMemo(() => {
    const days = [];
    let current = startOfToday();
    for (let i = 0; i < 14; i++) {
       days.push(current);
       current = addDays(current, 1);
    }
    return days;
  }, []);

  // Filter available times
  const availableTimes = useMemo(() => {
    if (!professionalId || !date) return [];
    
    // Find professional availability
    const dateObj = parseISO(date);
    const dayOfWeek = getDay(dateObj); // 0 = Sunday, 1 = Monday...
    
    // JS getDay -> Monday is 1, Sunday is 0.
    if (!selectedProfessional || !selectedProfessional.availability || !Array.isArray(selectedProfessional.availability.days) || !selectedProfessional.availability.days.includes(dayOfWeek)) {
      return []; // Professional doesn't work this day
    }

    const { startHour, endHour } = selectedProfessional.availability;
    if (!startHour || !endHour) return [];

    const slots: string[] = [];
    
    let current = parse(startHour, 'HH:mm', dateObj);
    const end = parse(endHour, 'HH:mm', dateObj);
    const now = new Date();
    const isTodayFlag = isToday(dateObj);

    while (isBefore(current, end)) {
      const timeString = format(current, 'HH:mm');
      
      if (isTodayFlag) {
        const slotTime = parse(timeString, 'HH:mm', new Date());
        if (isBefore(slotTime, now)) {
          current = new Date(current.getTime() + 30 * 60000);
          continue;
        }
      }

      // Check conflicts
      const allSlotsToCheck = [...(publicSlots || []), ...(appointments || [])];
      const hasConflict = allSlotsToCheck.some(app => 
        app.professionalId === professionalId && 
        app.date === date && 
        app.time === timeString &&
        app.status !== 'Cancelado'
      );

      if (!hasConflict) {
        slots.push(timeString);
      }
      current = new Date(current.getTime() + 30 * 60000);
    }
    return slots;
  }, [professionalId, date, appointments, publicSlots, selectedProfessional]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!clientName || !clientPhone) {
      toast.error(t('booking.fill_data'));
      return;
    }

    const normalizedPhone = clientPhone.replace(/[^\d+]/g, '');
    if (!/^(?:\+?258)?8[2-7]\d{7}$/.test(normalizedPhone)) {
      toast.error(t('booking.invalid_phone'));
      return;
    }

    const newAppointment: Appointment = {
      id: `app_${Date.now()}`,
      clientName,
      clientPhone,
      serviceId,
      professionalId,
      date,
      time,
      status: 'Pendente',
      createdAt: new Date().toISOString()
    };

    try {
      toast.loading(t('booking.confirming'), { id: 'booking' });
      await addAppointment(newAppointment);

      // Save ID locally so client can track their own appointments
      try {
        const storedIds = localStorage.getItem('my_appointment_ids');
        const ids = storedIds ? JSON.parse(storedIds) : [];
        ids.push(newAppointment.id);
        localStorage.setItem('my_appointment_ids', JSON.stringify(ids));
      } catch (e) {
        console.warn("Could not save appointment ID to local storage");
      }

      setIsSuccess(true);
      toast.success(t('booking.success_toast'), { id: 'booking' });
    } catch (error) {
      toast.error(t('booking.error_toast'), { id: 'booking' });
    }
  };

  const resetForm = () => {
    setServiceId('');
    setProfessionalId('');
    setDate('');
    setTime('');
    setClientName('');
    setClientPhone('');
    setStep(1);
    setIsSuccess(false);
  };

  // SUCCESS SCREEN
  if (isSuccess) {
    const formattedDate = format(parseISO(date), 'dd/MM/yyyy');
    const serviceName = selectedService?.name || '';
    const profName = selectedProfessional?.name || '';
    
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 h-full min-h-screen bg-white md:bg-transparent pb-32 animate-in slide-in-from-bottom-8 fade-in duration-500">
        <div className="w-full max-w-md text-center flex flex-col items-center bg-white md:rounded-[32px] md:shadow-xl md:border md:border-tulip-100 p-8 pt-12 flex-1 md:flex-none justify-center">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-serif text-tulip-900 mb-3">{t('booking.success_title')}</h2>
          <p className="text-zinc-500 mb-8 leading-relaxed px-2 text-base" dangerouslySetInnerHTML={{
             __html: t('booking.success_desc', { 
               name: clientName, 
               service: serviceName.toLowerCase(), 
               professional: profName, 
               date: formattedDate, 
               time: time 
             })
          }} />
          <p className="text-zinc-500 mb-8 leading-relaxed px-2 text-base" dangerouslySetInnerHTML={{
             __html: t('booking.success_note')
          }} />
          
          <div className="w-full space-y-4 md:block hidden">
            <button 
              onClick={() => {
                resetForm();
                if (onGoToAppointments) onGoToAppointments();
              }}
              className="w-full py-4 text-white bg-tulip-600 font-semibold hover:bg-tulip-700 rounded-2xl transition"
            >
              {t('booking.view_appointments')}
            </button>
            <button 
              onClick={resetForm}
              className="w-full py-4 text-tulip-600 font-semibold hover:bg-tulip-50 rounded-2xl transition"
            >
              {t('booking.new_booking')}
            </button>
          </div>
        </div>
        
        {/* Mobile Sticky Bottom Section */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-zinc-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-full duration-500 delay-300 z-50 rounded-t-3xl">
          <div className="max-w-md mx-auto space-y-3">
            <button 
              onClick={() => {
                resetForm();
                if (onGoToAppointments) onGoToAppointments();
              }}
              className="w-full py-4 text-white bg-tulip-600 font-semibold active:bg-tulip-700 rounded-2xl transition"
            >
              {t('booking.view_appointments')}
            </button>
            <button 
              onClick={resetForm}
              className="w-full py-4 text-tulip-600 font-semibold active:bg-tulip-50 rounded-2xl transition"
            >
              {t('booking.new_booking')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fdf8fb] pb-32 relative">
      {/* Header Mobile Step Indicator */}
      <div className="bg-white px-4 md:px-6 py-4 shadow-sm sticky top-0 z-20 flex items-center gap-3">
         {step > 1 && (
           <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-tulip-50 transition text-tulip-900 shrink-0">
             <ArrowLeft size={24} />
           </button>
         )}
         <div className="flex-1">
           <p className="text-[10px] font-bold text-tulip-600 uppercase tracking-widest mb-0.5">{t('booking.step', { current: step, total: 5 })}</p>
           <h2 className="text-xl md:text-2xl font-serif font-semibold text-tulip-950 leading-tight">
             {step === 1 && t('booking.step1_title')}
             {step === 2 && t('booking.step2_title')}
             {step === 3 && t('booking.step3_title')}
             {step === 4 && t('booking.step4_title')}
             {step === 5 && t('booking.step5_title')}
           </h2>
         </div>
         {/* Simple visual progress pill */}
         <div className="hidden sm:flex bg-tulip-100 rounded-full h-2 w-24 overflow-hidden shrink-0">
            <div className="bg-tulip-500 h-full transition-all" style={{ width: `${(step / 5) * 100}%` }}></div>
         </div>
      </div>

      <div className="p-4 md:p-6 flex-1 max-w-2xl mx-auto w-full animate-in slide-in-from-bottom-4 fade-in duration-300">
        
        {/* STEP 1: SERVICE */}
        {step === 1 && (
          <div className="space-y-4">
            {services.map(service => (
              <button
                key={service.id}
                onClick={() => { setServiceId(service.id); handleNext(); }}
                className={cn(
                  "w-full text-left bg-white p-5 rounded-[24px] border-2 transition-all flex items-center gap-4",
                  serviceId === service.id ? "border-tulip-400 bg-tulip-50 shadow-md scale-[1.02]" : "border-transparent border-tulip-100 opacity-95 shadow-sm hover:border-tulip-200"
                )}
              >
                <div className="w-14 h-14 rounded-full bg-tulip-100 text-tulip-600 flex items-center justify-center shrink-0">
                  <Scissors size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-semibold text-tulip-950">{service.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                    <Clock size={16} /> {service.duration} min
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg md:text-xl font-bold text-tulip-700">{formatCurrency(service.price)}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* STEP 2: PROFESSIONAL */}
        {step === 2 && (
          <div className="space-y-4">
            {availableProfessionals.length > 0 ? (
              availableProfessionals.map(prof => (
                <button
                  key={prof.id}
                  onClick={() => { setProfessionalId(prof.id); handleNext(); }}
                  className={cn(
                    "w-full text-left bg-white p-5 rounded-[24px] border-2 transition-all flex items-center gap-5",
                    professionalId === prof.id ? "border-tulip-400 bg-tulip-50 shadow-md scale-[1.02]" : "border-transparent border-tulip-100 shadow-sm hover:border-tulip-200"
                  )}
                >
                  <img src={prof.photo} alt={prof.name} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover shadow-sm bg-tulip-50" />
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-semibold text-tulip-950">{prof.name}</h3>
                    <p className="text-sm text-zinc-500 mt-1">{t('booking.expert_available')}</p>
                  </div>
                  <ChevronRight className="text-tulip-300 shrink-0" size={28} />
                </button>
              ))
            ) : (
              <div className="text-center p-10 bg-white rounded-3xl border border-tulip-100 shadow-sm">
                <User size={48} className="text-tulip-200 mx-auto mb-4" />
                <p className="text-zinc-600 text-lg">{t('booking.no_professionals')}</p>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: DATE */}
        {step === 3 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 md:gap-4">
             {upcomingDays.map((d, index) => {
               const dateStr = format(d, 'yyyy-MM-dd');
               const dayOfWeek = getDay(d);
               const worksThisDay = selectedProfessional?.availability?.days?.includes(dayOfWeek);
               
               return (
                 <button
                   key={dateStr}
                   disabled={!worksThisDay}
                   onClick={() => { setDate(dateStr); handleNext(); }}
                   className={cn(
                     "flex flex-col items-center justify-center p-4 md:p-6 rounded-[24px] border-2 transition-all h-32 md:h-36 relative overflow-hidden",
                     !worksThisDay ? "opacity-40 cursor-not-allowed bg-zinc-50 border-transparent text-zinc-400" :
                     date === dateStr ? "border-tulip-500 bg-tulip-600 shadow-lg text-white scale-[1.02]" : "bg-white border-tulip-50 hover:border-tulip-300 shadow-sm"
                   )}
                 >
                   <span className={cn("text-xs md:text-sm uppercase tracking-widest font-semibold mb-2", date === dateStr ? "text-tulip-100" : "text-zinc-500")}>
                     {format(d, 'eee', { locale: dateLocale })}
                   </span>
                   <span className="text-3xl md:text-4xl font-bold font-serif leading-none mb-1">
                     {format(d, 'dd')}
                   </span>
                   <span className={cn("text-sm font-semibold", date === dateStr ? "text-tulip-100" : "text-tulip-600")}>
                     {format(d, 'MMM', { locale: dateLocale })}
                   </span>
                   {!worksThisDay && (
                     <div className="absolute inset-0 bg-zinc-50/50 flex items-center justify-center backdrop-blur-[1px]">
                       <span className="bg-zinc-800 text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">{t('booking.day_off')}</span>
                     </div>
                   )}
                 </button>
               )
             })}
          </div>
        )}

        {/* STEP 4: TIME */}
        {step === 4 && (
          <div className="bg-white p-6 md:p-8 rounded-[32px] border border-tulip-100 shadow-sm">
            <h3 className="text-center text-zinc-500 mb-8 font-medium text-lg">{t('booking.time_on')} <strong className="text-tulip-900">{format(parseISO(date), "MMM dd, yyyy", { locale: dateLocale })}</strong></h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 md:gap-4">
              {availableTimes.length > 0 ? (
                availableTimes.map(t => (
                  <button
                    key={t}
                    onClick={() => { setTime(t); handleNext(); }}
                    className={cn(
                      "py-4 md:py-5 rounded-[20px] border-2 font-mono text-lg md:text-xl font-semibold transition-all",
                      time === t ? "border-tulip-500 bg-tulip-600 text-white shadow-xl shadow-tulip-200 scale-105" : "bg-zinc-50 border-transparent text-tulip-900 hover:border-tulip-300 shadow-sm"
                    )}
                  >
                    {t}h
                  </button>
                ))
              ) : (
                <div className="col-span-3 sm:col-span-4 text-center py-10 bg-tulip-50 rounded-2xl">
                  <Clock className="mx-auto text-tulip-300 mb-3" size={32} />
                  <p className="text-tulip-800 font-medium">{t('booking.no_slots')}</p>
                  <button onClick={handleBack} className="mt-4 text-tulip-600 font-bold hover:underline">{t('booking.choose_another_date')}</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: CLIENT DETAILS */}
        {step === 5 && (
          <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-tulip-100 slide-in-from-bottom-8">
             <div className="space-y-6">
                <div>
                  <label className="block text-sm md:text-base font-semibold text-tulip-900 mb-3">{t('booking.your_name')}</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-tulip-400" size={24} />
                    <input 
                      type="text" 
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      placeholder="Ex: Joana Silva"
                      className="w-full pl-14 pr-6 h-16 md:h-20 bg-zinc-50 border border-tulip-100 rounded-3xl focus:outline-none focus:ring-2 focus:ring-tulip-400 focus:bg-white transition-all text-xl font-medium placeholder:font-normal placeholder:text-zinc-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm md:text-base font-semibold text-tulip-900 mb-3">{t('booking.your_phone')}</label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-tulip-400" size={24} />
                    <input 
                      type="tel" 
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      placeholder="+258 8X XXX XXXX"
                      className="w-full pl-14 pr-6 h-16 md:h-20 bg-zinc-50 border border-tulip-100 rounded-3xl focus:outline-none focus:ring-2 focus:ring-tulip-400 focus:bg-white transition-all text-xl font-mono placeholder:font-sans placeholder:font-normal placeholder:text-zinc-400"
                    />
                  </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar (only show on step 5 to mimic native Android bottom stickiness) */}
      {step === 5 && (
         <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-white border-t border-tulip-100 pb-safe z-30 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
           <div className="max-w-2xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="hidden md:block">
                 <p className="text-2xl font-bold text-tulip-900">{formatCurrency(selectedService?.price || 0)}</p>
                 <p className="text-sm font-medium text-zinc-500">{selectedService?.name}</p>
                 <p className="text-xs text-zinc-400 mt-1">{format(parseISO(date), 'dd/MM', { locale: dateLocale })} {t('booking.at')} {time} {t('booking.with')} {selectedProfessional?.name}</p>
              </div>
              <button 
                onClick={handleSubmit}
                disabled={!clientName || !clientPhone}
                className="w-full md:w-auto py-5 px-10 rounded-[20px] bg-tulip-600 text-white font-semibold text-xl hover:bg-tulip-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-tulip-200/50 active:scale-95"
              >
                {t('booking.confirm_booking')}
              </button>
           </div>
         </div>
      )}
    </div>
  );
};
