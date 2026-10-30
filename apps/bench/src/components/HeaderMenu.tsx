'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, ExternalLink, Settings } from 'lucide-react';
import { GitHubIcon } from './icons';
import { LanguageOptions } from './LanguageMenu';
import { useI18n } from '../i18n';

/**
 * Mobile-only header overflow menu. The desktop header keeps its inline
 * controls untouched; this component is hidden at `lg` and up.
 */
export function HeaderMenu({
  autoRun,
  setAutoRun,
}: {
  autoRun: boolean;
  setAutoRun: (value: boolean) => void;
}) {
  const { t } = useI18n();
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
    <div ref={containerRef} className="relative lg:hidden shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('header.settings')}
        className={`flex h-9 w-9 items-center justify-center rounded transition-colors ${
          open
            ? 'bg-slate-800 text-cyan-400'
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        }`}
      >
        <Settings className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t('header.settings')}
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-white/10 bg-[#111114] p-1.5 shadow-2xl"
        >
          <button
            type="button"
            role="menuitemcheckbox"
            aria-checked={autoRun}
            onClick={() => setAutoRun(!autoRun)}
            className="flex w-full items-center justify-between gap-2 rounded px-2.5 py-2 text-xs text-slate-300 transition-colors hover:bg-white/5"
          >
            <span>{t('header.autorun')}</span>
            <span
              aria-hidden="true"
              className={`relative h-4 w-7 rounded-full border transition-colors ${
                autoRun
                  ? 'border-cyan-700/50 bg-cyan-950'
                  : 'border-slate-700 bg-slate-800'
              }`}
            >
              <span
                className={`absolute top-0.5 left-[2px] h-3 w-3 rounded-full transition-all ${
                  autoRun
                    ? 'translate-x-full bg-cyan-400'
                    : 'bg-slate-400'
                }`}
              />
            </span>
          </button>

          <div className="my-1 h-px bg-white/5" />

          <div className="px-2.5 pt-1.5 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {t('language.label')}
          </div>
          <LanguageOptions onSelect={() => setOpen(false)} />

          <div className="my-1 h-px bg-white/5" />

          <a
            role="menuitem"
            href="https://quantumjsdocs.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-between gap-2 rounded px-2.5 py-2 text-xs text-slate-300 transition-colors hover:bg-white/5"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-slate-500" />
              {t('header.docs')}
            </span>
            <ExternalLink className="h-3 w-3 text-slate-600" />
          </a>

          <a
            role="menuitem"
            href="https://github.com/ljcamargo/quantumjs"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-between gap-2 rounded px-2.5 py-2 text-xs text-slate-300 transition-colors hover:bg-white/5"
          >
            <span className="flex items-center gap-2">
              <GitHubIcon className="h-3.5 w-3.5" />
              {t('header.github')}
            </span>
            <ExternalLink className="h-3 w-3 text-slate-600" />
          </a>
        </div>
      )}
    </div>
  );
}
