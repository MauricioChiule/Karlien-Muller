import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { useI18n } from '../lib/i18n';
import { format, parseISO, isToday, isBefore, startOfToday } from 'date-fns';
import { Users, CalendarClock, TrendingUp, Search, CheckCircle2, XCircle, Clock, Scissors, User } from 'lucide-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const { t, dateLocale } = useI18n();
  const { appointments, professionals, services, updateAppointmentStatus, removeAppointment } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');

  const todayAppointments = useMemo(() => {
    return appointments.filter((a) => isToday(parseISO(a.date)));
  }, [appointments]);

  const uniqueClientsToday = new Set(todayAppointments.map((a) => a.clientPhone)).size;

  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      const matchesSearch = app.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            app.clientPhone.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesDate = !dateFilter || app.date === dateFilter;
      
      return matchesSearch && matchesStatus && matchesDate;
    }).sort((a, b) => {
      // Sort by creation date DESC
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [appointments, searchTerm, statusFilter, dateFilter]);

  const handleStatusChange = async (id: string, newStatus: 'Pendente' | 'Confirmado' | 'Cancelado') => {
    updateAppointmentStatus(id, newStatus);
    toast.success(t('management_services.service_updated') || `Status alterado para ${newStatus}`);
  };

  const handleDelete = (id: string) => {
    removeAppointment(id);
    toast.success(t('management_services.service_removed') || 'Agendamento removido com sucesso.');
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Confirmado':
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold flex items-center gap-1 w-max"><CheckCircle2 size={12}/> {t('dashboard.confirm')}</span>;
      case 'Cancelado':
        return <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-1 w-max"><XCircle size={12}/> {t('dashboard.cancel')}</span>;
      default:
        return <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold flex items-center gap-1 w-max"><Clock size={12}/> {t('booking.status_pending') || 'Pendente'}</span>;
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto pb-24 md:pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-semibold text-tulip-900 mb-2">{t('nav.home') || 'Visão Geral'}</h1>
        <p className="text-zinc-500">{t('dashboard.overview') || 'Faça a gestão de todas as reservas do salão.'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-tulip-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-lilac-100 text-lilac-600 flex items-center justify-center">
              <CalendarClock size={20} />
            </div>
            <TrendingUp size={20} className="text-green-500" />
          </div>
          <p className="text-sm text-zinc-500 font-medium mb-1">{t('dashboard.total_appointments') || 'Total de Marcações'}</p>
          <h2 className="text-3xl font-bold text-tulip-950">{appointments.length}</h2>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-tulip-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-tulip-100 text-tulip-600 flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <p className="text-sm text-zinc-500 font-medium mb-1">{t('dashboard.clients_today') || 'Clientes Hoje'}</p>
          <h2 className="text-3xl font-bold text-tulip-950">{uniqueClientsToday}</h2>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-tulip-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-sm text-zinc-500 font-medium mb-1">{t('dashboard.pending_today') || 'Hoje Pendentes'}</p>
          <h2 className="text-3xl font-bold text-tulip-950">
            {todayAppointments.filter((a: any) => a.status === 'Pendente').length}
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-tulip-100 overflow-hidden flex flex-col">
        {/* Filters Bar */}
        <div className="p-4 md:p-6 border-b border-tulip-100 flex flex-col xl:flex-row gap-4 justify-between bg-zinc-50/50">
          <div className="relative flex-1 w-full max-w-none xl:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder={t('dashboard.search') || "Pesquisar cliente ou telemóvel..."} 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 md:py-2.5 bg-white border border-tulip-100 rounded-[16px] md:rounded-xl focus:outline-none focus:ring-2 focus:ring-tulip-300 transition-all text-base md:text-sm shadow-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
            <input 
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="w-full sm:flex-1 xl:flex-none px-3 py-3 md:py-2.5 bg-white border border-tulip-100 rounded-[16px] md:rounded-xl focus:outline-none focus:ring-2 focus:ring-tulip-300 transition-all text-base md:text-sm text-zinc-600 font-medium shadow-sm"
            />
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full sm:flex-1 xl:flex-none px-3 py-3 md:py-2.5 bg-white border border-tulip-100 rounded-[16px] md:rounded-xl focus:outline-none focus:ring-2 focus:ring-tulip-300 transition-all text-base md:text-sm text-zinc-600 font-medium shadow-sm"
            >
              <option value="all">{t('dashboard.status_all') || 'Status (Todos)'}</option>
              <option value="Pendente">Pendente</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden flex flex-col gap-4 p-4 bg-zinc-50/50">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map(app => {
              const service = services.find(s => s.id === app.serviceId);
              const professional = professionals.find(p => p.id === app.professionalId);
              const dateObj = parseISO(app.date);

              return (
                <div key={app.id} className="bg-white p-4 md:p-5 rounded-3xl border border-tulip-100 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-semibold text-base md:text-lg text-tulip-950 flex items-center gap-2 break-all sm:break-normal">
                        {app.clientName}
                      </h4>
                      <p className="text-xs md:text-sm text-zinc-500 font-mono mt-0.5">{app.clientPhone}</p>
                    </div>
                    <div className="shrink-0">{getStatusBadge(app.status)}</div>
                  </div>
                  
                  <div className="w-full h-px bg-tulip-50 my-1"></div>
                  
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-3 text-xs md:text-sm">
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-tulip-50 flex items-center justify-center shrink-0">
                         <Scissors size={14} className="text-tulip-500" />
                      </div>
                      <span className="font-semibold text-zinc-700">{service?.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs md:text-sm">
                       {professional?.photo ? (
                         <img src={professional.photo} alt={professional.name} className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover shrink-0" />
                       ) : (
                         <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-tulip-50 flex items-center justify-center shrink-0">
                           <User size={14} className="text-tulip-500" />
                         </div>
                       )}
                      <span className="font-medium text-zinc-600">{professional?.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs md:text-sm">
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-tulip-50 flex items-center justify-center shrink-0">
                        <Clock size={14} className="text-tulip-500" />
                      </div>
                      <span className="font-medium text-zinc-600">
                        {format(dateObj, 'PP', { locale: dateLocale })} {t('booking.at')} <strong className="text-tulip-900">{app.time}h</strong>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-2 pt-4 border-t border-tulip-50 flex-wrap sm:flex-nowrap">
                     {app.status === 'Pendente' && (
                        <button 
                          onClick={() => handleStatusChange(app.id, 'Confirmado')}
                          className="flex-1 w-full sm:w-auto py-3 bg-tulip-600 text-white rounded-xl text-xs md:text-sm font-semibold hover:bg-tulip-700 transition lg:flex-none lg:px-4"
                        >
                          {t('dashboard.confirm') || 'Confirmar'}
                        </button>
                      )}
                      {(app.status === 'Pendente' || app.status === 'Confirmado') && (
                        <button 
                          onClick={() => handleStatusChange(app.id, 'Cancelado')}
                          className="flex-1 w-full sm:w-auto py-3 bg-red-50 text-red-600 rounded-xl text-xs md:text-sm font-semibold hover:bg-red-100 transition lg:flex-none lg:px-4"
                        >
                          {t('dashboard.cancel') || 'Cancelar'}
                        </button>
                      )}
                      {app.status === 'Cancelado' && (
                        <button 
                          onClick={() => handleStatusChange(app.id, 'Pendente')}
                          className="flex-1 w-full sm:w-auto py-3 bg-zinc-100 text-zinc-600 rounded-xl text-xs md:text-sm font-semibold hover:bg-zinc-200 transition lg:flex-none lg:px-4"
                        >
                          {t('dashboard.reactivate') || 'Reativar'}
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleDelete(app.id)}
                        className="py-3 px-4 sm:flex-none bg-red-100 text-red-600 rounded-xl text-xs md:text-sm font-semibold hover:bg-red-200 transition w-full sm:w-auto mt-1 sm:mt-0"
                        title={t('dashboard.delete')}
                      >
                        {t('dashboard.delete') || 'Eliminar'}
                      </button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-10 text-zinc-500">
              {t('dashboard.no_results') || 'Nenhum agendamento encontrado.'}
            </div>
          )}
        </div>

        {/* Table View Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-tulip-50 text-tulip-900 border-b border-tulip-100">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider">{t('dashboard.client') || 'Cliente'}</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider">{t('dashboard.contact') || 'Contacto'}</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider">{t('dashboard.service') || 'Serviço'}</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider">{t('dashboard.professional') || 'Profissional'}</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider">{t('dashboard.date_time') || 'Data e Hora'}</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider">{t('dashboard.status') || 'Status'}</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider text-right">{t('dashboard.action') || 'Ação'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tulip-50">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map(app => {
                  const service = services.find(s => s.id === app.serviceId);
                  const professional = professionals.find(p => p.id === app.professionalId);
                  const dateObj = parseISO(app.date);

                  return (
                    <tr key={app.id} className="hover:bg-tulip-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-tulip-950">{app.clientName}</div>
                        <div className="text-xs text-zinc-400 mt-0.5">{t('dashboard.created_at')} {format(new Date(app.createdAt || new Date()), 'dd/MM, HH:mm')}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-zinc-600">{app.clientPhone}</td>
                      <td className="px-6 py-4 text-zinc-700 font-medium">{service?.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <img src={professional?.photo} alt="" className="w-6 h-6 rounded-full object-cover border border-zinc-200" />
                          <span className="text-zinc-700 font-medium">{professional?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-tulip-900">{format(dateObj, 'PP', { locale: dateLocale })}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">{app.time}h</div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {app.status === 'Pendente' && (
                            <button 
                              onClick={() => handleStatusChange(app.id, 'Confirmado')}
                              className="px-3 py-1.5 bg-tulip-600 text-white rounded-lg text-xs font-semibold hover:bg-tulip-700 transition"
                            >
                              {t('dashboard.confirm') || 'Confirmar'}
                            </button>
                          )}
                          {(app.status === 'Pendente' || app.status === 'Confirmado') && (
                            <button 
                              onClick={() => handleStatusChange(app.id, 'Cancelado')}
                              className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition"
                            >
                              {t('dashboard.cancel') || 'Cancelar'}
                            </button>
                          )}
                          {app.status === 'Cancelado' && (
                            <button 
                              onClick={() => handleStatusChange(app.id, 'Pendente')}
                              className="px-3 py-1.5 bg-zinc-100 text-zinc-600 rounded-lg text-xs font-semibold hover:bg-zinc-200 transition"
                            >
                              {t('dashboard.reactivate') || 'Reativar'}
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(app.id)}
                            className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-200 transition ml-1"
                            title={t('dashboard.delete')}
                          >
                            {t('dashboard.delete') || 'Eliminar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                    {t('dashboard.no_results') || 'Nenhum agendamento encontrado com os filtros atuais.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
