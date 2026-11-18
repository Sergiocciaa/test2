import React from "react";
import { Check, CheckCircle2, ChevronRight, ExternalLink, FileText, Printer } from "lucide-react";
import { CCII_CHECKLIST_ITEMS } from "../utils/financialEngine";

interface ChecklistPanelProps {
  checklist: Record<string, boolean>;
  onToggleItem: (key: string) => void;
  onOpenReport: () => void;
}

export const ChecklistPanel: React.FC<ChecklistPanelProps> = ({
  checklist,
  onToggleItem,
  onOpenReport,
}) => {
  const completedCount = CCII_CHECKLIST_ITEMS.filter((item) => checklist[item.key]).length;
  const totalCount = CCII_CHECKLIST_ITEMS.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div id="kit-documentale" className="space-y-5">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-200 bg-slate-50 p-5">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <FileText className="h-4 w-4 text-slate-700 shrink-0" aria-hidden="true" />
              Kit Documentale Istanza CCII
            </h3>
            <span className="font-mono tabular-nums text-xs font-semibold text-slate-700">
              {completedCount}/{totalCount} · {percentage}%
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-600">
            Documenti essenziali per presentare l'istanza di Composizione Negoziata presso la Camera di Commercio.
          </p>

          <div
            className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Completamento documenti CCII"
          >
            <div
              className="h-full bg-slate-900 transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100 p-2">
          {CCII_CHECKLIST_ITEMS.map((item) => {
            const checked = Boolean(checklist[item.key]);
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onToggleItem(item.key)}
                id={`chk-btn-${item.key}`}
                aria-pressed={checked}
                className="flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                    checked
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-transparent"
                  }`}
                >
                  <Check className="h-3 w-3 stroke-[3]" aria-hidden="true" />
                </span>
                <span>
                  <span
                    className={`block text-xs font-semibold ${
                      checked ? "text-slate-500 line-through" : "text-slate-900"
                    }`}
                  >
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-normal text-slate-500">
                    {item.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {percentage === 100 && (
          <div className="border-t border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900">
            <p className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" aria-hidden="true" />
              Kit documentale completo
            </p>
            <p className="mt-1 leading-relaxed text-emerald-800">
              Tutti i documenti preliminari risultano pronti per il caricamento sulla piattaforma telematica camerale.
            </p>
          </div>
        )}
      </div>

      {/* Primary Action: Export Report */}
      <button
        type="button"
        onClick={onOpenReport}
        id="btn-trigger-pdf"
        className="flex w-full items-center justify-between rounded-xl border border-slate-900 bg-slate-950 p-4 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
      >
        <span className="flex items-center gap-2.5">
          <Printer className="h-4 w-4 text-amber-400 shrink-0" aria-hidden="true" />
          Esporta o Stampa Relazione di Valutazione
        </span>
        <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
      </button>

      {/* Official Chamber of Commerce Portal Link */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-800">
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-tight text-slate-900">
              Accesso al Portale Camerale CNC
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              L'istanza ufficiale di nomina dell'esperto indipendente si presenta tramite la piattaforma telematica nazionale delle Camere di Commercio.
            </p>
          </div>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-3.5">
          <a
            href="https://composizionenegoziata.camcom.it"
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-900 transition-colors hover:bg-slate-200"
          >
            Visita Piattaforma Nazionale CNC
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
};
