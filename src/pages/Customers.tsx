import React, { useState } from 'react';
import { useAppStore } from '../store';
import { useI18n } from '../lib/i18n';
import { User, Phone, FileText, Plus, X, Search, Calendar, Edit2, Trash2, History } from 'lucide-react';
import { cn } from '../lib/utils';
import { Customer, Appointment } from '../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const Customers = () => {
  const { t } = useI18n();
  const { customers, appointments, services, professionals, addCustomer, updateCustomer, removeCustomer, isAdmin } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null | 'new'>(null);
  const [viewingHistory, setViewingHistory] = useState<Customer | null>(null);
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const confirmDelete = async () => {
    if (deletingCustomerId) {
      setIsSaving(true);
      try {
        await removeCustomer(deletingCustomerId);
        toast.success(t('management_customers.customer_removed'));
        setDeletingCustomerId(null);
      } catch (e) {
        toast.error(t('booking.error_toast'));
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto pb-24 md:pb-10 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-tulip-900 mb-2">{t('nav.customers')}</h1>
          <p className="text-zinc-500">{t('management_customers.subtitle')}</p>
        </div>
        <button 
          onClick={() => setEditingCustomer('new')}
          className="bg-tulip-600 hover:bg-tulip-700 text-white px-6 py-3 rounded-full font-medium shadow-sm transition-colors text-sm flex items-center justify-center gap-2">
          <Plus size={18} /> {t('management_customers.add_customer')}
        </button>
      </div>

      <div className="mb-8 relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        <input 
          type="text"
          placeholder={t('management_customers.search_placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-tulip-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-tulip-300 transition-all font-medium shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-tulip-100 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-tulip-50 border border-tulip-100 flex items-center justify-center text-tulip-600">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-semibold text-tulip-900">{customer.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                    <Phone size={12} /> {customer.phone}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              {customer.notes && (
                <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    <FileText size={12} /> {t('management_customers.customer_notes')}
                  </div>
                  <p className="text-sm text-zinc-600 line-clamp-3 italic">"{customer.notes}"</p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-zinc-400 font-medium px-1">
                <span className="flex items-center gap-1">
                   <Calendar size={12} /> {t('dashboard.total_appointments')}: {customer.appointmentHistory.length}
                </span>
                {customer.createdAt && (
                  <span>{t('dashboard.created_at')}: {customer.createdAt.split('T')[0]}</span>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-6 pt-4 border-t border-tulip-50">
              <button 
                onClick={() => setViewingHistory(customer)}
                className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-lilac-600 bg-lilac-50 hover:bg-lilac-100 rounded-xl transition-colors flex-1"
                title={t('management_customers.history')}
              >
                <History size={14} /> {t('management_customers.history')}
              </button>
              <button 
                onClick={() => setEditingCustomer(customer)}
                className="p-2 text-tulip-600 bg-tulip-50 hover:bg-tulip-100 rounded-xl transition-colors"
                title={t('management_customers.edit_customer')}
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => setDeletingCustomerId(customer.id)}
                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                title={t('dashboard.delete')}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[32px] border border-dashed border-tulip-200">
             <div className="w-16 h-16 bg-tulip-50 rounded-full flex items-center justify-center mx-auto mb-4 text-tulip-300">
               <User size={32} />
             </div>
             <p className="text-zinc-500 font-medium">{t('management_customers.no_customers')}</p>
          </div>
        )}
      </div>

      {editingCustomer && (
        <CustomerModal 
          customer={editingCustomer === 'new' ? null : editingCustomer} 
          onClose={() => setEditingCustomer(null)} 
          onSave={async (c) => {
            if (!isAdmin) {
              toast.error("Acesso negado. Por favor, reinicie a sessão.");
              return;
            }
            
            setIsSaving(true);
            try {
              if (editingCustomer === 'new') {
                await addCustomer(c);
                toast.success(t('management_customers.customer_added'));
              } else {
                await updateCustomer(c);
                toast.success(t('management_customers.customer_updated'));
              }
              setEditingCustomer(null);
            } catch (error) {
              toast.error(t('booking.error_toast'));
            } finally {
              setIsSaving(false);
            }
          }}
          isSaving={isSaving}
        />
      )}

      {viewingHistory && (
        <HistoryModal 
          customer={viewingHistory} 
          appointments={appointments}
          services={services}
          professionals={professionals}
          onClose={() => setViewingHistory(null)} 
        />
      )}

      {deletingCustomerId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 md:p-8 w-full max-w-sm shadow-xl border border-tulip-100 animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-serif text-tulip-900 mb-2 font-semibold">{t('management_customers.confirm_delete')}</h3>
            <p className="text-zinc-600 mb-6">{t('management_customers.confirm_delete_desc')}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeletingCustomerId(null)}
                className="flex-1 px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-medium transition-colors"
              >
                {t('dashboard.cancel')}
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
              >
                {t('dashboard.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CustomerModal = ({ customer, onClose, onSave, isSaving }: { customer: Customer | null, onClose: () => void, onSave: (c: Customer) => void, isSaving?: boolean }) => {
  const { t } = useI18n();
  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [notes, setNotes] = useState(customer?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error(t('booking.fill_data'));
      return;
    }
    
    onSave({
      id: customer?.id || `cust_${Date.now()}`,
      name,
      phone,
      notes,
      appointmentHistory: customer?.appointmentHistory || [],
      createdAt: customer?.createdAt || new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] p-6 md:p-8 w-full max-w-lg shadow-xl border border-tulip-100 max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif text-tulip-900">{customer ? t('management_customers.edit_customer') : t('management_customers.new_customer')}</h2>
          <button onClick={onClose} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors text-zinc-500">
             <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-tulip-900 mb-2 ml-1">{t('management_customers.customer_name')}</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-tulip-50 border border-tulip-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-tulip-300 transition-all font-medium"
              placeholder="Ex: Joana Silva"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-tulip-900 mb-2 ml-1">{t('management_customers.customer_phone')}</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-tulip-50 border border-tulip-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-tulip-300 transition-all font-medium"
              placeholder="Ex: 841234567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-tulip-900 mb-2 ml-1">{t('management_customers.customer_notes')}</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-tulip-50 border border-tulip-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-tulip-300 transition-all font-medium resize-none"
              placeholder="Preferências, alergias ou observações sobre serviços anteriores..."
            />
          </div>

          <button 
            type="submit"
            disabled={isSaving}
            className="mt-6 w-full bg-tulip-600 hover:bg-tulip-700 text-white rounded-full py-4 px-6 font-medium transition-all disabled:opacity-50"
          >
            {isSaving ? t('common.loading') : (customer ? t('management_services.save_changes') : t('management_customers.create_customer'))}
          </button>
        </form>
      </div>
    </div>
  );
};

const HistoryModal = ({ customer, appointments, services, professionals, onClose }: { 
  customer: Customer, 
  appointments: Appointment[],
  services: any[],
  professionals: any[],
  onClose: () => void 
}) => {
  const { t } = useI18n();
  
  // Find all appointments associated with this customer
  // We can search by ID in history OR by matching phone/name
  const history = appointments.filter(app => 
    customer.appointmentHistory.includes(app.id) || 
    (app.clientPhone.replace(/\s+/g, '') === customer.phone.replace(/\s+/g, ''))
  ).sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] p-6 md:p-8 w-full max-w-2xl shadow-xl border border-tulip-100 max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-serif text-tulip-900">{t('management_customers.history')}</h2>
            <p className="text-zinc-500 text-sm font-medium">{customer.name} &bull; {customer.phone}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors text-zinc-500">
             <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((app) => {
                const service = services.find(s => s.id === app.serviceId);
                const prof = professionals.find(p => p.id === app.professionalId);
                
                return (
                  <div key={app.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-tulip-100 flex items-center justify-center text-tulip-600 shrink-0">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-zinc-800">{service?.name || app.serviceId}</div>
                        <div className="text-xs text-zinc-500 font-medium">
                          {format(new Date(app.date), 'dd/MM/yyyy')} &bull; {app.time} &bull; {prof?.name || app.professionalId}
                        </div>
                      </div>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      app.status === 'Confirmado' ? "bg-green-100 text-green-700" :
                      app.status === 'Cancelado' ? "bg-red-100 text-red-700" : 
                      "bg-tulip-100 text-tulip-700"
                    )}>
                      {app.status}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
               <History size={48} className="mx-auto text-zinc-200 mb-4" />
               <p className="text-zinc-400 font-medium">{t('management_customers.no_history')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
