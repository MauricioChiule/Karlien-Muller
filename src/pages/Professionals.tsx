import React, { useState } from 'react';
import { useAppStore } from '../store';
import { useI18n } from '../lib/i18n';
import { Scissors, User, Plus, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Professional } from '../types';
import toast from 'react-hot-toast';

export const Professionals = () => {
  const { t } = useI18n();
  const { professionals, services, appointments, addProfessional, updateProfessional, removeProfessional, isAdmin } = useAppStore();
  const [editingProf, setEditingProf] = useState<Professional | null | 'new'>(null);
  const [deletingProfId, setDeletingProfId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const daysOfWeek = [
    t('management_professionals.sun'),
    t('management_professionals.mon'),
    t('management_professionals.tue'),
    t('management_professionals.wed'),
    t('management_professionals.thu'),
    t('management_professionals.fri'),
    t('management_professionals.sat'),
  ];

  const requestDelete = (id: string) => {
    const isLinked = appointments.some(app => app.professionalId === id);
    if (isLinked) {
      toast.error(t('booking.error_toast')); // fallback
      return;
    }
    setDeletingProfId(id);
  };

  const confirmDelete = async () => {
    if (deletingProfId) {
      setIsSaving(true);
      try {
        await removeProfessional(deletingProfId);
        toast.success(t('management_professionals.prof_removed') || "Profissional removido com sucesso.");
        setDeletingProfId(null);
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
          <h1 className="text-3xl font-serif font-semibold text-tulip-900 mb-2">{t('nav.professionals') || 'Profissionais'}</h1>
          <p className="text-zinc-500">{t('management_professionals.subtitle')}</p>
        </div>
        <button 
          onClick={() => setEditingProf('new')}
          className="bg-tulip-600 hover:bg-tulip-700 text-white px-6 py-3 rounded-full font-medium shadow-sm transition-colors text-sm flex items-center justify-center gap-2">
          <Plus size={18} /> {t('management_professionals.add_professional')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {professionals.map((prof) => (
          <div key={prof.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-tulip-100 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-6">
              <img 
                src={prof.photo} 
                alt={prof.name} 
                className="w-20 h-20 rounded-[20px] object-cover border border-tulip-50 shadow-sm bg-tulip-50"
              />
              <div className="mt-1">
                <h3 className="text-lg font-serif font-semibold text-tulip-900">{prof.name}</h3>
                <div className="flex items-center gap-1 text-xs text-lilac-600 font-medium mt-1 uppercase tracking-wider">
                   <User size={12} /> Cabeleireira
                </div>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">{t('management_professionals.specialties')}</h4>
                <div className="flex flex-wrap gap-2">
                  {prof.specialties.map(specId => {
                    const serv = services.find(s => s.id === specId);
                    return serv ? (
                      <span key={specId} className="px-2 py-1 bg-tulip-50 text-tulip-700 rounded-lg text-xs font-medium border border-tulip-100/50">
                        {serv.name}
                      </span>
                    ) : null;
                  })}
                </div>
                {prof.specialties.length === 0 && (
                  <span className="text-sm text-zinc-400 italic">{t('management_professionals.no_services')}</span>
                )}
              </div>

              <div>
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 mt-4">{t('management_professionals.schedule')}</h4>
                <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                   <div className="flex gap-1 mb-2">
                     {daysOfWeek.map((day, idx) => (
                       <div 
                         key={idx} 
                         className={cn(
                           "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium",
                           prof.availability.days.includes(idx) 
                             ? "bg-lilac-100 text-lilac-700" 
                             : "text-zinc-300"
                         )}
                       >
                         {day.charAt(0)}
                       </div>
                     ))}
                   </div>
                   <div className="text-xs font-medium text-zinc-600 flex items-center gap-1.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                     {prof.availability.startHour} - {prof.availability.endHour}
                   </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6 pt-4 border-t border-tulip-50">
              <button 
                onClick={() => setEditingProf(prof)}
                className="flex-1 py-2 text-sm font-medium text-tulip-600 bg-tulip-50 hover:bg-tulip-100 rounded-xl transition-colors">
                {t('management_professionals.edit_prof')}
              </button>
              <button 
                onClick={() => requestDelete(prof.id)}
                className="py-2 px-4 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
                {t('dashboard.delete')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingProf && (
        <ProfessionalModal 
          prof={editingProf === 'new' ? null : editingProf} 
          onClose={() => setEditingProf(null)} 
          onSave={async (prof) => {
            if (!isAdmin) {
              toast.error("Acesso negado. Por favor, reinicie a sessão.");
              return;
            }
            
            setIsSaving(true);
            try {
              if (editingProf === 'new') {
                await addProfessional(prof);
                toast.success(t('management_professionals.prof_added') || "Profissional adicionada!");
              } else {
                await updateProfessional(prof);
                toast.success(t('management_professionals.prof_updated') || "Profissional atualizada!");
              }
              setEditingProf(null);
            } catch (error) {
              toast.error(t('booking.error_toast'));
            } finally {
              setIsSaving(false);
            }
          }}
          isSaving={isSaving}
        />
      )}

      {deletingProfId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 md:p-8 w-full max-w-sm shadow-xl border border-tulip-100 animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-serif text-tulip-900 mb-2 font-semibold">{t('management_professionals.confirm_delete')}</h3>
            <p className="text-zinc-600 mb-6">{t('management_professionals.confirm_delete_desc')}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeletingProfId(null)}
                className="flex-1 px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-medium transition-colors"
              >
                {t('dashboard.cancel')}
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
              >
                {t('management_professionals.confirm_delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfessionalModal = ({ prof, onClose, onSave, isSaving }: { prof: Professional | null, onClose: () => void, onSave: (p: Professional) => void, isSaving?: boolean }) => {
  const { services } = useAppStore();
  const { t } = useI18n();
  
  const [name, setName] = useState(prof?.name || '');
  const [photo, setPhoto] = useState(prof?.photo || '');
  const [specialties, setSpecialties] = useState<string[]>(prof?.specialties || []);
  const [days, setDays] = useState<number[]>(prof?.availability.days || [1, 2, 3, 4, 5]);
  const [startHour, setStartHour] = useState(prof?.availability.startHour || '09:00');
  const [endHour, setEndHour] = useState(prof?.availability.endHour || '18:00');

  const daysOfWeek = [
    t('management_professionals.sun'),
    t('management_professionals.mon'),
    t('management_professionals.tue'),
    t('management_professionals.wed'),
    t('management_professionals.thu'),
    t('management_professionals.fri'),
    t('management_professionals.sat'),
  ];

  const toggleDay = (idx: number) => {
    setDays(prev => 
      prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx].sort()
    );
  };

  const toggleSpecialty = (id: string) => {
    setSpecialties(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a URL for the image to draw on canvas instead of reading full buffer first
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
             ctx.drawImage(img, 0, 0, width, height);
             // Quality factor 0.7 for JPEG compression to ensure the base64 string is tiny
             const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
             setPhoto(dataUrl);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t('booking.fill_data'));
      return;
    }
    if (days.length === 0) {
      toast.error(t('booking.fill_data'));
      return;
    }
    
    // Default placeholder photo if empty
    const finalPhoto = photo.trim() || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80';

    onSave({
      id: prof?.id || `p_${Date.now()}`,
      name,
      photo: finalPhoto,
      specialties,
      availability: {
        days,
        startHour,
        endHour
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] p-6 md:p-8 w-full max-w-lg shadow-xl border border-tulip-100 max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif text-tulip-900">{prof ? t('management_professionals.edit_prof') : t('management_professionals.new_prof')}</h2>
          <button onClick={onClose} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors text-zinc-500">
             <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-tulip-900 mb-2 ml-1">{t('management_professionals.prof_name')}</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-tulip-50 border border-tulip-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-tulip-300 transition-all font-medium"
              placeholder="ex: Marta Silva"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-tulip-900 mb-2 ml-1">{t('management_professionals.prof_photo')}</label>
            <div className="flex items-center gap-4">
              {photo && (
                <img 
                  src={photo} 
                  alt="Preview" 
                  className="w-16 h-16 rounded-2xl object-cover border border-tulip-100 bg-tulip-50 shrink-0" 
                />
              )}
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*"
                  id="fotoProfissional"
                  onChange={handlePhotoUpload}
                  className="w-full text-sm text-zinc-500 file:cursor-pointer file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-tulip-50 file:text-tulip-700 hover:file:bg-tulip-100 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-tulip-900 mb-2 ml-1">{t('management_professionals.specialties')}</label>
            <div className="flex flex-wrap gap-2">
              {services.map(service => (
                <button
                  type="button"
                  key={service.id}
                  onClick={() => toggleSpecialty(service.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors",
                    specialties.includes(service.id)
                      ? "bg-tulip-100 border-tulip-300 text-tulip-800"
                      : "bg-white border-zinc-200 text-zinc-500 hover:border-tulip-200"
                  )}
                >
                  {service.name}
                </button>
              ))}
              {services.length === 0 && <span className="text-sm text-zinc-400">{t('management_professionals.no_services_yet')}</span>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-tulip-900 mb-2 ml-1">{t('management_professionals.working_days')}</label>
            <div className="flex gap-2">
              {daysOfWeek.map((day, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => toggleDay(idx)}
                  className={cn(
                    "w-10 h-10 rounded-full flex flex-col items-center justify-center text-xs font-semibold border transition-all",
                    days.includes(idx)
                      ? "bg-lilac-500 border-lilac-500 text-white shadow-sm"
                      : "bg-white border-zinc-200 text-zinc-400 hover:border-lilac-200"
                  )}
                >
                  {day.charAt(0)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-tulip-900 mb-2 ml-1">{t('management_professionals.start_time')}</label>
              <input 
                type="time" 
                lang="pt-PT"
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className="w-full px-4 py-3 bg-tulip-50 border border-tulip-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-tulip-300 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-tulip-900 mb-2 ml-1">{t('management_professionals.end_time')}</label>
              <input 
                type="time" 
                lang="pt-PT"
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                className="w-full px-4 py-3 bg-tulip-50 border border-tulip-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-tulip-300 transition-all font-medium"
              />
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={isSaving}
            className="mt-6 w-full bg-tulip-600 hover:bg-tulip-700 text-white rounded-full py-4 px-6 font-medium transition-all disabled:opacity-50"
          >
            {isSaving ? t('common.loading') : (prof ? t('management_services.save_changes') : t('management_professionals.create_prof'))}
          </button>
        </form>
      </div>
    </div>
  );
};
