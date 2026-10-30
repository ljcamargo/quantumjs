'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, Languages } from 'lucide-react';

import { LANGUAGE_OPTIONS, useI18n } from '../i18n';

/**
 * The three-way language preference list, shared by the desktop popover and
 * the mobile gear menu.
 */
export function LanguageOptions({ onSelect }: { onSelect?: () => void }) {
  const { preference, setPreference, locale, localeLabel, t } = useI18n();

  return (
    <div className="space-y-0.5">
      {LANGUAGE_OPTIONS.map((option) => {
        const active = preference === option;
        const label =
          option === 'auto' ? t('language.auto') : localeLabel(option);

        return (
          <button
            key={option}
            type="button"
            role="menuitemradio"
            aria-checked={active}
            onClick={() => {
              setPreference(option);
              onSelect?.();
            }}
            className={`flex w-full items-center justify-between gap-2 rounded px-2.5 py-2 text-left text-xs transition-colors hover:bg-white/5 ${
              active ? 'text-cyan-300' : 'text-slate-300'
            }`}
          >
            <span className="whitespace-nowrap">{label}</span>
            <span className="flex items-center gap-1.5">
              {option === 'auto' && preference === 'auto' && (
                <span className="text-[9px] text-slate-500">
                  {localeLabel(locale)}
                </span>
              )}
              {active && <Check className="h-3.5 w-3.5 text-cyan-400" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Desktop language selector. Mobile uses the section inside <HeaderMenu>.
 */
export function LanguageMenu() {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative hidden lg:block shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('language.label')}
        title={t('language.label')}
        className="h-7 px-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-[10px] font-bold rounded transition-all flex items-center gap-1.5"
      >
        <Languages className="w-3 h-3" />
        {locale.toUpperCase()}
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t('language.label')}
          className="absolute right-0 top-full z-50 mt-2 w-52 rounded-lg border border-white/10 bg-[#111114] p-1.5 shadow-2xl"
        >
          <div className="px-2.5 pt-1.5 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {t('language.label')}
          </div>
          <LanguageOptions onSelect={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
