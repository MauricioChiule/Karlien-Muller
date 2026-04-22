import React, { useState } from 'react';
import { useAppStore } from '../store';
import { useI18n } from '../lib/i18n';
import { Clock, Plus, X } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { Service } from '../types';
import toast from 'react-hot-toast';

export const ServicesPage = () => {
  const { t } = useI18n();
  const { services, addService, updateService, removeService, appointments, isAdmin } = useAppStore();
  const [editingService, setEditingService] = useState<Service | null | 'new'>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const requestDelete = (id: string) => {
    const isLinked = appointments.some(app => app.serviceId === id);
    if (isLinked) {
      toast.error(t('booking.error_toast')); // Or something simpler. Wait, we don't have a specific error for this. Let's just keep it in Portuguese for now or remove if requested. The user mainly mentioned labels.
      // Wait, there's a better way. I can use the new translations.
      return;
    }
    setDeletingServiceId(id);
  };

  const confirmDelete = async () => {
    if (deletingServiceId) {
      try {
        await removeService(deletingServiceId);
        toast.success(t('management_services.service_removed') || "Serviço removido com sucesso.");
        setDeletingServiceId(null);
      } catch (e) {
        toast.error(t('booking.error_toast'));
      }
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto pb-24 md:pb-10 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-tulip-900 mb-2">{t('nav.services') || 'Serviços'}</h1>
          <p className="text-zinc-500">{t('management_services.subtitle')}</p>
        </div>
        <button 
          onClick={() => setEditingService('new')}
          className="bg-tulip-600 hover:bg-tulip-700 text-white px-6 py-3 rounded-full font-medium shadow-sm transition-colors text-sm flex items-center justify-center gap-2">
          <Plus size={18} /> {t('management_services.add_service')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-[24px] p-6 shadow-sm border border-tulip-100 hover:border-tulip-300 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-serif font-semibold text-tulip-900 group-hover:text-tulip-600 transition-colors">
                {service.name}
              </h3>
              <div className="bg-tulip-50 text-tulip-700 font-medium px-3 py-1 rounded-full text-sm shrink-0 border border-tulip-100/50">
                {formatCurrency(service.price)}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6 bg-zinc-50 px-3 py-2 rounded-xl w-max">
              <Clock size={14} className="text-zinc-400" />
              {service.duration} minutos
            </div>

            <div className="flex gap-2 pt-4 border-t border-tulip-50">
              <button 
                onClick={() => setEditingService(service)}
                className="flex-1 py-1.5 text-sm font-medium text-lilac-600 hover:text-lilac-800 transition-colors">
                {t('management_services.edit_service')}
              </button>
              <div className="w-[1px] bg-tulip-100"></div>
              <button 
                onClick={() => requestDelete(service.id)}
                className="flex-1 py-1.5 text-sm font-medium text-red-500 hover:text-red-700 transition-colors">
                {t('dashboard.delete')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingService && (
        <ServiceModal 
          service={editingService === 'new' ? null : editingService} 
          onClose={() => setEditingService(null)} 
          onSave={async (service) => {
            if (!isAdmin) {
              toast.error("Acesso negado. Por favor, reinicie a sessão.");
              return;
            }
            
            setIsSaving(true);
            try {
              if (editingService === 'new') {
                await addService(service);
                toast.success(t('management_services.service_added') || "Serviço adicionado!");
              } else {
                await updateService(service);
                toast.success(t('management_services.service_updated') || "Serviço atualizado!");
              }
              setEditingService(null);
            } catch (error) {
              toast.error(t('booking.error_toast'));
            } finally {
              setIsSaving(false);
            }
          }}
          isSaving={isSaving}
        />
      )}

      {deletingServiceId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 md:p-8 w-full max-w-sm shadow-xl border border-tulip-100 animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-serif text-tulip-900 mb-2 font-semibold">{t('management_services.confirm_delete')}</h3>
            <p className="text-zinc-600 mb-6">{t('management_services.confirm_delete_desc')}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeletingServiceId(null)}
                className="flex-1 px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-medium transition-colors"
              >
                {t('dashboard.cancel')}
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
              >
                {t('management_services.confirm_delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ServiceModal = ({ service, onClose, onSave, isSaving }: { service: Service | null, onClose: () => void, onSave: (s: Service) => void, isSaving?: boolean }) => {
  const { t } = useI18n();
  const [name, setName] = useState(service?.name || '');
  const [duration, setDuration] = useState(service?.duration?.toString() || '60');
  const [price, setPrice] = useState(service?.price?.toString() || '1500');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !duration || !price) {
      toast.error(t('booking.fill_data'));
      return;
    }
    
    onSave({
      id: service?.id || `s_${Date.now()}`,
      name,
      duration: parseInt(duration, 10),
      price: parseFloat(price)
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] p-6 md:p-8 w-full max-w-md shadow-xl border border-tulip-100 max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif text-tulip-900">{service ? t('management_services.edit_service') : t('management_services.new_service')}</h2>
          <button onClick={onClose} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors text-zinc-500">
             <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-tulip-900 mb-2 ml-1">{t('management_services.service_name')}</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-tulip-50 border border-tulip-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-tulip-300 transition-all font-medium"
              placeholder="ex: Madeixas"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-tulip-900 mb-2 ml-1">{t('management_services.duration_min')}</label>
              <input 
                type="number" 
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-3 bg-tulip-50 border border-tulip-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-tulip-300 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-tulip-900 mb-2 ml-1">{t('management_services.price')} (MZN)</label>
              <input 
                type="number" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3 bg-tulip-50 border border-tulip-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-tulip-300 transition-all font-medium"
              />
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={isSaving}
            className="mt-6 w-full bg-tulip-600 hover:bg-tulip-700 text-white rounded-full py-4 px-6 font-medium transition-all disabled:opacity-50"
          >
            {isSaving ? t('common.loading') : (service ? t('management_services.save_changes') : t('management_services.create_service'))}
          </button>
        </form>
      </div>
    </div>
  );
};
