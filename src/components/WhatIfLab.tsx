import React from "react";
import { AlertCircle, AlertTriangle, Building2, CheckCircle2, RotateCcw } from "lucide-react";
import { SustainabilityMetrics, VerdictType } from "../types/crisis";
import { formatEuro } from "../utils/financialEngine";

interface WhatIfLabProps {
  metrics: SustainabilityMetrics;
  debtHaircutPercent: number;
  cashFlowOptimPercent: number;
  onChangeDebtHaircut: (val: number) => void;
  onChangeCashFlowOptim: (val: number) => void;
  onResetWhatIf: () => void;
}

function getVerdictBadgeClasses(verdict: VerdictType): string {
  switch (verdict) {
    case "green":
      return "text-emerald-400";
    case "yellow":
      return "text-amber-400";
    case "red":
      return "text-rose-400";
    default:
      return "text-slate-400";
  }
}

function renderVerdictIcon(verdict: VerdictType) {
  switch (verdict) {
    case "green":
      return <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" />;
    case "yellow":
      return <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" aria-hidden="true" />;
    case "red":
      return <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" aria-hidden="true" />;
    default:
      return null;
  }
}

export const WhatIfLab: React.FC<WhatIfLabProps> = ({
  metrics,
  debtHaircutPercent,
  cashFlowOptimPercent,
  onChangeDebtHaircut,
  onChangeCashFlowOptim,
  onResetWhatIf,
}) => {
  const hasSimulation = debtHaircutPercent > 0 || cashFlowOptimPercent > 0;

  return (
    <section
      id="laboratorio-what-if"
      className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-xs"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <Building2 className="h-5 w-5 text-amber-400 shrink-0" aria-hidden="true" />
          <h3 className="text-base font-bold tracking-tight text-white">
            Laboratorio Strategico What-If di Risanamento
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">
            Misure correttive CCII
          </span>
          {hasSimulation && (
            <button
              type="button"
              onClick={onResetWhatIf}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Azzera leve
            </button>
          )}
        </div>
      </div>

      <p className="mb-6 text-xs leading-relaxed text-slate-300">
        Simula l'effetto combinato di uno{" "}
        <strong className="font-semibold text-white">stralcio o ristrutturazione del debito</strong>{" "}
        e di un{" "}
        <strong className="font-semibold text-white">miglioramento dei margini operativi</strong>{" "}
        per verificare il rientro verso la zona di equilibrio.
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Slider 1 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 text-xs">
            <label htmlFor="slider-debt-haircut" className="font-semibold text-slate-200">
              Abbattimento debito (Stralcio / Accordo)
            </label>
            <span className="rounded bg-amber-400/15 px-2 py-0.5 font-mono tabular-nums font-bold text-amber-300">
              -{debtHaircutPercent}%
            </span>
          </div>
          <input
            id="slider-debt-haircut"
            type="range"
            min={0}
            max={50}
            step={5}
            value={debtHaircutPercent}
            onChange={(e) => onChangeDebtHaircut(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-amber-400"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>0% (Base)</span>
            <span>25%</span>
            <span>50% (Max)</span>
          </div>
        </div>

        {/* Slider 2 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 text-xs">
            <label htmlFor="slider-cashflow-optim" className="font-semibold text-slate-200">
              Ottimizzazione flussi (Margini / Taglio costi)
            </label>
            <span className="rounded bg-emerald-400/15 px-2 py-0.5 font-mono tabular-nums font-bold text-emerald-300">
              +{cashFlowOptimPercent}%
            </span>
          </div>
          <input
            id="slider-cashflow-optim"
            type="range"
            min={0}
            max={30}
            step={5}
            value={cashFlowOptimPercent}
            onChange={(e) => onChangeCashFlowOptim(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-400"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>0% (Base)</span>
            <span>+15%</span>
            <span>+30% (Max)</span>
          </div>
        </div>
      </div>

      {/* Comparison Block */}
      {hasSimulation && (
        <div className="mt-6 rounded-lg border border-slate-700 bg-slate-800/80 p-4 text-xs">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-300">
              Esito simulato post-manovra
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Confronto rispetto ai valori attuali
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="border-b border-slate-700 pb-3 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
              <div className="text-slate-400">Nuovo debito residuo</div>
              <div className="mt-1 font-mono tabular-nums text-sm font-bold text-amber-300">
                {formatEuro(metrics.adjustedDebt)}
              </div>
              <div className="mt-0.5 font-mono tabular-nums text-[11px] text-slate-400">
                Riduzione: {formatEuro(metrics.totalDebt - metrics.adjustedDebt)}
              </div>
            </div>

            <div className="border-b border-slate-700 pb-3 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
              <div className="text-slate-400">Nuovo flusso di cassa annuo</div>
              <div className="mt-1 font-mono tabular-nums text-sm font-bold text-emerald-300">
                {formatEuro(metrics.adjustedCashFlow)}
              </div>
              <div className="mt-0.5 font-mono tabular-nums text-[11px] text-slate-400">
                Variazione: +{formatEuro(metrics.adjustedCashFlow - metrics.baseCashFlow)}
              </div>
            </div>

            <div>
              <div className="text-slate-400">Nuova tempistica di rientro</div>
              <div className="mt-1 flex items-center gap-1.5">
                {renderVerdictIcon(metrics.adjustedVerdictType)}
                <span
                  className={`font-mono tabular-nums text-sm font-bold ${getVerdictBadgeClasses(
                    metrics.adjustedVerdictType
                  )}`}
                >
                  {metrics.verdictType === "empty"
                    ? "Dati mancanti"
                    : metrics.adjustedYears !== null
                    ? `${metrics.adjustedYears.toFixed(1)} anni`
                    : "Flusso negativo"}
                </span>
              </div>
              <div className="mt-0.5 font-mono tabular-nums text-[11px] text-slate-400">
                Prima:{" "}
                {metrics.verdictType === "empty"
                  ? "—"
                  : metrics.baseYears !== null
                  ? `${metrics.baseYears.toFixed(1)} anni`
                  : "Flusso negativo"}{" "}
                · {metrics.adjustedVerdictLabel}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
