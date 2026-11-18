import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Calculator,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Coins,
  Info,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { FinancialState, SustainabilityMetrics, VerdictType, ViewMode } from "../types/crisis";
import { formatEuro, formatIntegerInput } from "../utils/financialEngine";
import { SustainabilityScale } from "./SustainabilityScale";

interface SimulatorWorkspaceProps {
  inputs: FinancialState;
  metrics: SustainabilityMetrics;
  viewMode: ViewMode;
  activeStep: number;
  onChangeViewMode: (mode: ViewMode) => void;
  onChangeStep: (step: number) => void;
  onInputChange: (field: keyof FinancialState, rawValue: string) => void;
}

interface CurrencyInputProps {
  id: string;
  label: string;
  hint: string;
  tooltip: string;
  value: number;
  isTooltipOpen: boolean;
  onToggleTooltip: () => void;
  onChange: (value: string) => void;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  label,
  hint,
  tooltip,
  value,
  isTooltipOpen,
  onToggleTooltip,
  onChange,
}) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
    <div className="flex items-center justify-between gap-2">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-800"
      >
        <span>{label}</span>
        <button
          type="button"
          onClick={onToggleTooltip}
          aria-expanded={isTooltipOpen}
          aria-label={`Informazioni su ${label}`}
          className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors focus-visible:outline-2 focus-visible:outline-slate-900"
        >
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </label>
      <span className="font-mono text-[11px] text-slate-500">{hint}</span>
    </div>

    {isTooltipOpen && (
      <div className="mt-2.5 rounded-md border border-slate-800 bg-slate-900 p-3 text-xs leading-relaxed text-slate-100">
        {tooltip}
      </div>
    )}

    <div className="relative mt-2.5">
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-slate-400">
        €
      </span>
      <input
        type="text"
        inputMode="numeric"
        id={id}
        value={formatIntegerInput(value)}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="block w-full rounded-md border border-slate-300 bg-white py-2.5 pl-8 pr-12 font-mono tabular-nums text-sm font-semibold text-slate-950 focus:border-slate-900 focus:outline-hidden"
      />
      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 font-mono text-[11px] font-semibold text-slate-400">
        EUR
      </span>
    </div>
  </div>
);

function getVerdictStyles(verdict: VerdictType) {
  switch (verdict) {
    case "green":
      return {
        container: "border-emerald-300 bg-emerald-50 text-emerald-950",
        badge: "bg-emerald-600 text-white border-emerald-200",
      };
    case "yellow":
      return {
        container: "border-amber-300 bg-amber-50 text-amber-950",
        badge: "bg-amber-500 text-white border-amber-200",
      };
    case "red":
      return {
        container: "border-rose-300 bg-rose-50 text-rose-950",
        badge: "bg-rose-600 text-white border-rose-200",
      };
    default:
      return {
        container: "border-slate-200 bg-slate-50 text-slate-900",
        badge: "bg-slate-600 text-white border-slate-200",
      };
  }
}

function renderVerdictIcon(verdict: VerdictType) {
  switch (verdict) {
    case "green":
      return <CheckCircle2 className="h-5 w-5" aria-hidden="true" />;
    case "yellow":
      return <AlertTriangle className="h-5 w-5" aria-hidden="true" />;
    case "red":
      return <AlertCircle className="h-5 w-5" aria-hidden="true" />;
    default:
      return <Info className="h-5 w-5" aria-hidden="true" />;
  }
}

export const SimulatorWorkspace: React.FC<SimulatorWorkspaceProps> = ({
  inputs,
  metrics,
  viewMode,
  activeStep,
  onChangeViewMode,
  onChangeStep,
  onInputChange,
}) => {
  const [selectedTooltip, setSelectedTooltip] = useState<string | null>(null);

  const toggleTooltip = (key: string) => {
    setSelectedTooltip((prev) => (prev === key ? null : key));
  };

  const verdictStyles = getVerdictStyles(metrics.verdictType);

  if (viewMode === "expert") {
    return (
      <div
        id="expert-container"
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-xs"
      >
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
          <div>
            <span className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-amber-700">
              Modalità Pannello Esperto
            </span>
            <h3 className="mt-0.5 flex items-center gap-2 text-base font-bold text-slate-950">
              <Calculator className="h-5 w-5 text-slate-700" aria-hidden="true" />
              Controllo Diretto dei Parametri
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onChangeViewMode("wizard")}
            id="switch-back-wizard"
            className="self-start text-xs font-semibold text-slate-700 underline underline-offset-4 hover:text-slate-950 transition-colors"
          >
            Torna al percorso guidato
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left: Debts */}
          <div className="space-y-3.5">
            <h4 className="flex items-center justify-between border-b border-slate-100 pb-1.5 font-mono text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>1. Debito Ristrutturabile</span>
              <Coins className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
            </h4>

            <div>
              <label
                htmlFor="exp-debitiFornitori"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Debiti verso Fornitori (€)
              </label>
              <input
                type="text"
                inputMode="numeric"
                id="exp-debitiFornitori"
                value={formatIntegerInput(inputs.debitiFornitori)}
                onChange={(e) => onInputChange("debitiFornitori", e.target.value)}
                placeholder="0"
                className="block w-full rounded-md border border-slate-300 px-3 py-2 font-mono tabular-nums text-xs font-semibold text-slate-950 focus:border-slate-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label
                htmlFor="exp-debitiBancari"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Debiti Finanziari / Bancari (€)
              </label>
              <input
                type="text"
                inputMode="numeric"
                id="exp-debitiBancari"
                value={formatIntegerInput(inputs.debitiBancari)}
                onChange={(e) => onInputChange("debitiBancari", e.target.value)}
                placeholder="0"
                className="block w-full rounded-md border border-slate-300 px-3 py-2 font-mono tabular-nums text-xs font-semibold text-slate-950 focus:border-slate-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label
                htmlFor="exp-debitiFiscali"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Debiti Fiscali e Previdenziali (€)
              </label>
              <input
                type="text"
                inputMode="numeric"
                id="exp-debitiFiscali"
                value={formatIntegerInput(inputs.debitiFiscali)}
                onChange={(e) => onInputChange("debitiFiscali", e.target.value)}
                placeholder="0"
                className="block w-full rounded-md border border-slate-300 px-3 py-2 font-mono tabular-nums text-xs font-semibold text-slate-950 focus:border-slate-900 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-between rounded-md bg-slate-100 p-3 text-xs">
              <span className="font-semibold text-slate-700">Debito totale:</span>
              <span className="font-mono tabular-nums font-bold text-slate-950">
                {formatEuro(metrics.totalDebt)}
              </span>
            </div>
          </div>

          {/* Right: Cash flows */}
          <div className="space-y-3.5">
            <h4 className="flex items-center justify-between border-b border-slate-100 pb-1.5 font-mono text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>2. Flussi Economici Annuali</span>
              <TrendingUp className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
            </h4>

            <div>
              <label
                htmlFor="exp-fatturatoAnnuo"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Fatturato Annuo Stimato (€)
              </label>
              <input
                type="text"
                inputMode="numeric"
                id="exp-fatturatoAnnuo"
                value={formatIntegerInput(inputs.fatturatoAnnuo)}
                onChange={(e) => onInputChange("fatturatoAnnuo", e.target.value)}
                placeholder="0"
                className="block w-full rounded-md border border-slate-300 px-3 py-2 font-mono tabular-nums text-xs font-semibold text-slate-950 focus:border-slate-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label
                htmlFor="exp-costiOperativi"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Costi Operativi Annuali (€)
              </label>
              <input
                type="text"
                inputMode="numeric"
                id="exp-costiOperativi"
                value={formatIntegerInput(inputs.costiOperativi)}
                onChange={(e) => onInputChange("costiOperativi", e.target.value)}
                placeholder="0"
                className="block w-full rounded-md border border-slate-300 px-3 py-2 font-mono tabular-nums text-xs font-semibold text-slate-950 focus:border-slate-900 focus:outline-hidden"
              />
            </div>

            <div
              className={`flex items-center justify-between rounded-md border p-3 text-xs ${
                metrics.baseCashFlow > 0
                  ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                  : "border-rose-200 bg-rose-50 text-rose-950"
              }`}
            >
              <span className="font-semibold">Flusso di cassa disponibile:</span>
              <span className="font-mono tabular-nums font-bold">
                {formatEuro(metrics.baseCashFlow)}
              </span>
            </div>
          </div>
        </div>

        {/* Live Verdict Banner in Expert View */}
        <div className={`rounded-lg border p-4 ${verdictStyles.container}`}>
          <div className="flex items-start gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${verdictStyles.badge}`}
            >
              {renderVerdictIcon(metrics.verdictType)}
            </div>
            <div>
              <div className="font-mono text-[11px] font-bold uppercase tracking-wider opacity-80">
                {metrics.verdictLabel}
              </div>
              <h4 className="text-sm font-bold">{metrics.verdictTitle}</h4>
              <p className="mt-1 text-xs leading-relaxed opacity-90">
                {metrics.verdictDescription}
              </p>
            </div>
          </div>
        </div>

        <SustainabilityScale
          years={metrics.baseYears}
          verdictType={metrics.verdictType}
          cashFlow={metrics.baseCashFlow}
        />
      </div>
    );
  }

  return (
    <div
      id="wizard-container"
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs"
    >
      {/* Step Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 font-mono text-xs font-bold text-white">
            {activeStep}
          </span>
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-800">
            {activeStep === 1 && "Fase 1 di 3 · Posizione Debitoria"}
            {activeStep === 2 && "Fase 2 di 3 · Flusso di Cassa"}
            {activeStep === 3 && "Fase 3 di 3 · Diagnosi Preliminare"}
          </span>
        </div>

        <div className="flex items-center gap-1.5" role="tablist" aria-label="Fasi simulazione">
          {[1, 2, 3].map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => onChangeStep(step)}
              aria-label={`Vai alla fase ${step}`}
              aria-selected={activeStep === step}
              role="tab"
              className={`h-2.5 rounded-full transition-all ${
                activeStep === step ? "w-8 bg-slate-900" : "w-2.5 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
              className="space-y-5"
            >
              <div className="border-b border-slate-100 pb-3">
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-950">
                  <Coins className="h-5 w-5 text-amber-600" aria-hidden="true" />
                  Posizione Debitoria Complessiva
                </h3>
                <p className="mt-1 text-xs text-slate-600">
                  Indica l'ammontare dei debiti scaduti o da ristrutturare ai sensi dell'art. 12 CCII.
                </p>
              </div>

              <div className="space-y-4">
                <CurrencyInput
                  id="debitiFornitori"
                  label="1. Debiti verso Fornitori (€)"
                  hint="Scaduti o prorogati"
                  tooltip="Comprende tutti i debiti scaduti verso fornitori di beni, materie prime, energia e servizi, al netto di piani di rientro già formalizzati."
                  value={inputs.debitiFornitori}
                  isTooltipOpen={selectedTooltip === "fornitori"}
                  onToggleTooltip={() => toggleTooltip("fornitori")}
                  onChange={(val) => onInputChange("debitiFornitori", val)}
                />

                <CurrencyInput
                  id="debitiBancari"
                  label="2. Debiti Finanziari e Bancari (€)"
                  hint="Linee, mutui, leasing"
                  tooltip="Include affidamenti a revoca utilizzati, rate scadute o quota capitale in ristrutturazione di mutui chirografari/ipotecari e leasing."
                  value={inputs.debitiBancari}
                  isTooltipOpen={selectedTooltip === "banche"}
                  onToggleTooltip={() => toggleTooltip("banche")}
                  onChange={(val) => onInputChange("debitiBancari", val)}
                />

                <CurrencyInput
                  id="debitiFiscali"
                  label="3. Debiti Fiscali e Previdenziali (€)"
                  hint="AdE, INPS, INAIL"
                  tooltip="Importi iscritti a ruolo, debiti IVA o imposte scadute e contributi INPS/INAIL non ancora oggetto di rateazione regolare."
                  value={inputs.debitiFiscali}
                  isTooltipOpen={selectedTooltip === "fiscali"}
                  onToggleTooltip={() => toggleTooltip("fiscali")}
                  onChange={(val) => onInputChange("debitiFiscali", val)}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-900 p-4 text-slate-100">
                <div>
                  <span className="block font-mono text-[11px] uppercase tracking-wider text-slate-400">
                    Subtotale esposizione
                  </span>
                  <span className="text-base font-bold text-white">Debito Totale Residuo</span>
                </div>
                <span
                  id="wizard-debt-total"
                  className="font-mono tabular-nums text-xl font-bold text-amber-400"
                >
                  {formatEuro(metrics.totalDebt)}
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => onChangeStep(2)}
                  id="btn-next-step-1"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  Prosegui ai Flussi
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
              className="space-y-5"
            >
              <div className="border-b border-slate-100 pb-3">
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-950">
                  <TrendingUp className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                  Flussi di Cassa e Margini Operativi
                </h3>
                <p className="mt-1 text-xs text-slate-600">
                  Inserisci ricavi e costi operativi annui stimati per calcolare la capacità di rimborso.
                </p>
              </div>

              <div className="space-y-4">
                <CurrencyInput
                  id="fatturatoAnnuo"
                  label="Fatturato Annuo Stimato (€)"
                  hint="Ricavi caratteristici"
                  tooltip="Totale dei ricavi operativi annui previsti in via prudenziale per i prossimi 12 mesi, al netto dell'IVA."
                  value={inputs.fatturatoAnnuo}
                  isTooltipOpen={selectedTooltip === "fatturato"}
                  onToggleTooltip={() => toggleTooltip("fatturato")}
                  onChange={(val) => onInputChange("fatturatoAnnuo", val)}
                />

                <CurrencyInput
                  id="costiOperativi"
                  label="Costi Operativi Annuali (€)"
                  hint="Merci, personale, servizi"
                  tooltip="Somma delle uscite ricorrenti di gestione tipica: acquisti, personale, locazioni, utenze, servizi e oneri correnti."
                  value={inputs.costiOperativi}
                  isTooltipOpen={selectedTooltip === "costi"}
                  onToggleTooltip={() => toggleTooltip("costi")}
                  onChange={(val) => onInputChange("costiOperativi", val)}
                />
              </div>

              <div
                className={`flex items-center justify-between rounded-lg border p-4 ${
                  metrics.baseCashFlow > 0
                    ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                    : "border-rose-200 bg-rose-50 text-rose-950"
                }`}
              >
                <div>
                  <span className="block font-mono text-[11px] uppercase tracking-wider opacity-80">
                    Autofinanziamento netto annuo
                  </span>
                  <span className="text-sm font-bold">
                    Flusso di Cassa Disponibile (EBITDA approssimato)
                  </span>
                </div>
                <span
                  id="wizard-cashflow-total"
                  className={`font-mono tabular-nums text-xl font-bold ${
                    metrics.baseCashFlow > 0 ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {formatEuro(metrics.baseCashFlow)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => onChangeStep(1)}
                  id="btn-back-to-step-1"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Indietro
                </button>

                <button
                  type="button"
                  onClick={() => onChangeStep(3)}
                  id="btn-next-step-2"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  Calcola Verdetto
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          )}

          {activeStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 pb-3">
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-950">
                  <ShieldCheck className="h-5 w-5 text-slate-800" aria-hidden="true" />
                  Esito del Test di Sostenibilità
                </h3>
                <p className="mt-1 text-xs text-slate-600">
                  Valutazione basata sul rapporto tra debito ristrutturabile e flussi di cassa operativi annui.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs sm:grid-cols-2">
                <div>
                  <div className="font-mono text-[11px] uppercase text-slate-500">
                    Indebitamento Totale (A)
                  </div>
                  <div className="mt-1 font-mono tabular-nums text-base font-bold text-slate-950">
                    {formatEuro(metrics.totalDebt)}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[11px] uppercase text-slate-500">
                    Flusso di Cassa Annuo (B)
                  </div>
                  <div className="mt-1 font-mono tabular-nums text-base font-bold text-slate-950">
                    {formatEuro(metrics.baseCashFlow)}
                  </div>
                </div>
              </div>

              <div
                id="verdict-banner-display"
                className={`rounded-lg border p-5 ${verdictStyles.container}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-4 ${verdictStyles.badge}`}
                  >
                    {renderVerdictIcon(metrics.verdictType)}
                  </div>
                  <div>
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider opacity-80">
                      {metrics.verdictLabel}
                    </span>
                    <h4 className="mt-0.5 text-base font-bold tracking-tight">
                      {metrics.verdictTitle}
                    </h4>
                    <p className="mt-2 text-xs leading-relaxed opacity-90">
                      {metrics.verdictDescription}
                    </p>
                  </div>
                </div>
              </div>

              <SustainabilityScale
                years={metrics.baseYears}
                verdictType={metrics.verdictType}
                cashFlow={metrics.baseCashFlow}
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onChangeStep(2)}
                  id="btn-back-to-step-2"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Modifica Flussi
                </button>

                <button
                  type="button"
                  onClick={() => onChangeViewMode("expert")}
                  id="btn-goto-expert"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  Apri Pannello Esperto Live
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
