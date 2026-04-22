import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { useI18n } from '../lib/i18n';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Scissors } from 'lucide-react';
import { cn } from '../lib/utils';

export const CalendarView = () => {
  const { t, dateLocale } = useI18n();
  const { appointments, professionals, services } = useAppStore() as any;
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedProfId, setSelectedProfId] = useState<string>('all');
  
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  
  const dayAppointments = useMemo(() => {
    return appointments
      .filter((a: any) => a.date === selectedDateStr && (selectedProfId === 'all' || a.professionalId === selectedProfId))
      .sort((a: any, b: any) => a.time.localeCompare(b.time));
  }, [appointments, selectedDateStr, selectedProfId]);

  // Generate slots from 08:00 to 19:30
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let i = 0; i < 24; i++) {
       const hour = Math.floor(i / 2) + 8;
       const isHalf = i % 2 !== 0;
       slots.push(`${hour.toString().padStart(2, '0')}:${isHalf ? '30' : '00'}`);
    }
    return slots;
  }, []);

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto pb-28 md:pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-tulip-900 mb-2">{t('nav.calendar') || 'Agenda'}</h1>
          <p className="text-zinc-500 flex items-center gap-2">
             <CalendarIcon size={16} /> 
             {format(selectedDate, "PP", { locale: dateLocale })}
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-white rounded-full p-1 border border-tulip-100 shadow-sm w-max">
          <button 
            onClick={() => setSelectedDate(prev => addDays(prev, -7))}
            className="p-2 hover:bg-tulip-50 rounded-full text-zinc-500 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium px-4">{t('calendar.this_week') || 'Esta Semana'}</span>
          <button 
            onClick={() => setSelectedDate(prev => addDays(prev, 7))}
            className="p-2 hover:bg-tulip-50 rounded-full text-zinc-500 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-6">
        {weekDays.map(day => {
          const isSelected = isSameDay(day, selectedDate);
          const hasAppts = appointments.some((a: any) => a.date === format(day, 'yyyy-MM-dd') && (selectedProfId === 'all' || a.professionalId === selectedProfId));
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "flex flex-col items-center justify-center py-3 md:py-4 rounded-xl border transition-all text-center",
                isSelected 
                  ? "bg-tulip-600 border-tulip-600 text-white shadow-md shadow-tulip-200 scale-105 z-10" 
                  : "bg-white border-tulip-100 hover:border-tulip-300 hover:bg-tulip-50"
              )}
            >
              <span className={cn(
                "text-[10px] md:text-xs font-semibold uppercase mb-1",
                isSelected ? "text-tulip-100" : "text-zinc-400"
              )}>
                {format(day, 'E', { locale: dateLocale })}
              </span>
              <span className={cn(
                "text-lg font-bold md:text-xl leading-none",
                isSelected ? "text-white" : "text-tulip-900"
              )}>
                {format(day, 'd')}
              </span>
              <div className="mt-1.5 h-1.5">
                {hasAppts && !isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full bg-tulip-400 mx-auto"></div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Professional Filter */}
      <div className="mb-6 flex overflow-x-auto no-scrollbar gap-2 pb-2">
        <button
          onClick={() => setSelectedProfId('all')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all whitespace-nowrap",
            selectedProfId === 'all' ? "bg-tulip-900 border-tulip-900 text-white shadow-sm" : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
          )}
        >
          <User size={16} /> {t('calendar.whole_team') || 'Equipa Completa'}
        </button>
        {professionals.map((p: any) => (
          <button
            key={p.id}
            onClick={() => setSelectedProfId(p.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap",
              selectedProfId === p.id ? "bg-lilac-600 border-lilac-600 text-white shadow-sm" : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            )}
          >
            <img src={p.photo} alt={p.name} className="w-5 h-5 rounded-full object-cover bg-zinc-100" />
            {p.name}
          </button>
        ))}
      </div>

      {/* Timeline View */}
      <div className="bg-white rounded-[24px] shadow-sm border border-tulip-100 overflow-hidden">
        <div className="p-4 border-b border-tulip-50 flex items-center justify-between bg-zinc-50/50">
          <h3 className="font-serif font-semibold text-tulip-900">{t('calendar.today_schedule') || 'Horários de Hoje'}</h3>
          <div className="text-xs font-semibold bg-tulip-100 text-tulip-700 px-3 py-1 rounded-full">
            {dayAppointments.length} {t('calendar.appointments', { count: dayAppointments.length }) || 'agendamentos'}
          </div>
        </div>

        <div className="flex flex-col bg-white">
          {timeSlots.map((timeString, idx) => {
            const apts = dayAppointments.filter((a: any) => a.time === timeString);
            
            // For a compact view, only render half hours if there are appointments inside them
            const isHalfHour = timeString.endsWith(':30');
            if (isHalfHour && apts.length === 0) return null;

            return (
              <div key={timeString} className={cn("flex min-h-[70px] border-b border-zinc-50 relative group", idx === timeSlots.length - 1 && "border-b-0")}>
                {/* Time Label */}
                <div className="w-16 md:w-24 flex-shrink-0 pt-3 border-r border-zinc-100 text-right pr-3 md:pr-4">
                  <span className={cn("text-xs font-mono font-medium", isHalfHour ? "text-zinc-300" : "text-zinc-600")}>
                    {timeString}
                  </span>
                </div>
                
                {/* Appointments Content Area */}
                <div className="flex-1 p-2 md:p-3 flex flex-col xl:flex-row gap-2 relative transition-colors">
                  {apts.length === 0 ? (
                     <div className="opacity-0 group-hover:opacity-100 text-[10px] uppercase font-bold text-zinc-300 tracking-wider h-full flex items-center pl-2 pt-1 transition-opacity">
                       {t('calendar.free_slot') || 'Horário Livre'}
                     </div>
                  ) : (
                    apts.map((apt: any) => {
                      const service = services.find((s: any) => s.id === apt.serviceId);
                      const professional = professionals.find((p: any) => p.id === apt.professionalId);
                      const isPending = apt.status === 'Pendente';
                      const isCanceled = apt.status === 'Cancelado';
                      
                      const profColors = [
                        "bg-blue-50 border-blue-200 border-l-blue-500",
                        "bg-fuchsia-50 border-fuchsia-200 border-l-fuchsia-500",
                        "bg-tulip-50 border-tulip-200 border-l-tulip-500",
                        "bg-emerald-50 border-emerald-200 border-l-emerald-500"
                      ];
                      // Assign color based on professional ID
                      let colorClass = "bg-zinc-50 border-zinc-200 border-l-zinc-500";
                      if (professional?.id) {
                         const cid = professional.id.charCodeAt(professional.id.length - 1) % profColors.length;
                         colorClass = profColors[cid];
                      }

                      return (
                        <div 
                          key={apt.id} 
                          className={cn(
                            "flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-xl border border-l-[4px] shadow-sm xl:flex-1",
                            colorClass,
                            isCanceled && "opacity-60 grayscale border-l-zinc-300"
                          )}
                        >
                          <div className="flex items-start md:items-center gap-3">
                             {/* Status dot */}
                             <div className={cn(
                               "w-2 h-2 rounded-full mt-1.5 md:mt-0 shrink-0",
                               apt.status === 'Confirmado' ? 'bg-green-500' :
                               isPending ? 'bg-orange-400' : 'bg-red-500'
                             )}></div>
                             <div>
                               <p className="font-semibold text-zinc-900 leading-tight">
                                 {apt.clientName}
                               </p>
                               <span className="text-[10px] font-mono text-zinc-600 block mt-0.5">{apt.clientPhone}</span>
                             </div>
                          </div>
                          
                          <div className="mt-3 sm:mt-0 ml-5 sm:ml-auto flex items-center gap-4 text-xs font-medium">
                            <div className="flex items-center gap-1.5 text-zinc-700 bg-white/50 px-2 py-1 rounded-md">
                              <Scissors size={12} className="opacity-60" />
                              <span className="truncate max-w-[120px]">{service?.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-zinc-700 bg-white/50 pr-2 rounded-full overflow-hidden">
                              <img src={professional?.photo} className="w-5 h-5 object-cover bg-zinc-200" />
                              <span className="truncate max-w-[80px]">{professional?.name.split(' ')[0]}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};
