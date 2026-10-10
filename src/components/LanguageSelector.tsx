import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { languageNames, type LanguageCode } from '../i18n/translations';

export const LanguageSelector: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('matchboard_lang') as LanguageCode;
    if (saved && languageNames[saved]) {
      setCurrentLang(saved);
    } else {
      // Auto-detect browser language
      const browserLang = navigator.language?.slice(0, 2) as LanguageCode;
      if (browserLang && languageNames[browserLang]) {
        setCurrentLang(browserLang);
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectLanguage = (code: LanguageCode) => {
    setCurrentLang(code);
    setIsOpen(false);
    localStorage.setItem('matchboard_lang', code);
    window.dispatchEvent(new CustomEvent('matchboard:lang-change', { detail: { lang: code } }));
  };

  const currentInfo = languageNames[currentLang];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select language"
        className="group flex items-center justify-center gap-1.5 px-2.5 py-2 sm:px-3 sm:py-2 rounded-xl border transition-all duration-200
          bg-white/80 border-slate-200/90 text-slate-700 hover:border-[#55A9A0] hover:text-[#287A74] hover:shadow-luxury
          dark:bg-[#131A20]/90 dark:border-slate-800 dark:text-slate-200 dark:hover:border-[#AEEED3]/50 dark:hover:text-[#AEEED3]"
      >
        <span className="text-base leading-none select-none">{currentInfo.flag}</span>
        
        {/* Desktop full label */}
        <span className="hidden md:inline font-medium text-xs tracking-wide">
          {currentInfo.label}
        </span>

        {/* Mobile/Tablet icon-only constraint: Show only 2-letter uppercase badge */}
        <span className="md:hidden font-mono font-bold text-xs uppercase tracking-wider text-[#287A74] dark:text-[#AEEED3]">
          {currentLang}
        </span>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#287A74] dark:text-[#AEEED3]' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-44 py-1.5 rounded-xl border z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150
            bg-white/95 border-slate-200 shadow-xl
            dark:bg-[#131A20]/95 dark:border-slate-800 dark:shadow-2xl dark:shadow-black/60"
        >
          {(Object.entries(languageNames) as [LanguageCode, typeof currentInfo][]).map(([code, { label, flag }]) => {
            const isSelected = code === currentLang;
            return (
              <button
                key={code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => selectLanguage(code)}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-colors text-left
                  ${isSelected
                    ? 'bg-[#FFF8B0]/50 text-[#287A74] font-semibold dark:bg-[#AEEED3]/10 dark:text-[#AEEED3]'
                    : 'text-slate-700 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{flag}</span>
                  <span>{label}</span>
                  <span className="text-[10px] font-mono uppercase opacity-50">({code})</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#287A74] dark:text-[#AEEED3]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
