import React from "react";
import { Lock, Printer, Scale } from "lucide-react";

interface HeaderProps {
  onOpenReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenReport }) => {
  return (
    <div className="print:hidden">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Zone 1: Single-line brand mark */}
          <a
            href="#simulatore"
            className="flex items-center gap-2.5 text-slate-950 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900 rounded-sm"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-amber-400">
              <Scale className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-base font-bold tracking-tight">Pre-Check Crisi</span>
          </a>

          {/* Zone 2: Concise single-line navigation links */}
          <nav
            aria-label="Navigazione principale"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <a
              href="#simulatore"
              className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Simulatore
            </a>
            <a
              href="#laboratorio-what-if"
              className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Simulazione Risanamento
            </a>
            <a
              href="#kit-documentale"
              className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Kit Documentale
            </a>
            <a
              href="#normativa-ccii"
              className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Normativa CCII
            </a>
          </nav>

          {/* Zone 3: Single primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onOpenReport}
              id="header-export-report"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              <Printer className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
              Esporta Report
            </button>
          </div>
        </div>
      </header>

      {/* Privacy & client-side guarantee strip */}
      <div className="border-b border-slate-800 bg-slate-950 text-slate-200">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-xs sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" aria-hidden="true" />
            <p className="leading-relaxed">
              <strong className="font-semibold text-white">Elaborazione locale al 100%:</strong>{" "}
              nessun dato economico viene inviato a server esterni o salvato su database.
            </p>
          </div>
          <span className="hidden lg:inline text-xs font-mono text-slate-400">
            Test Pratico di Sostenibilità · d.lgs. 14/2019 (CCII)
          </span>
        </div>
      </div>
    </div>
  );
};
