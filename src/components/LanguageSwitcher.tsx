import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';
import { ChevronDown, Check } from 'lucide-react';

export const LanguageSwitcher = ({ className }: { className?: string }) => {
  const { language, setLanguage, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'pt', labelKey: 'languages.pt', flag: '🇵🇹' },
    { code: 'en', labelKey: 'languages.en', flag: '🇬🇧' },
    { code: 'es', labelKey: 'languages.es', flag: '🇪🇸' },
    { code: 'fr', labelKey: 'languages.fr', flag: '🇫🇷' },
  ] as const;

  const currentLang = languages.find(l => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-tulip-200 shadow-sm transition-colors hover:bg-white"
      >
        <span className="text-base leading-none">{currentLang.flag}</span>
        <span className="text-xs md:text-sm font-bold text-tulip-950 uppercase">{currentLang.code}</span>
        <ChevronDown size={14} className="text-tulip-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-tulip-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code as any);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-2 hover:bg-tulip-50 hover:text-tulip-700 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg leading-none">{lang.flag}</span>
                <span className={cn("text-sm font-medium", language === lang.code ? "text-tulip-800" : "text-zinc-700")}>
                  {t(lang.labelKey)}
                </span>
              </div>
              {language === lang.code && <Check size={16} className="text-tulip-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

