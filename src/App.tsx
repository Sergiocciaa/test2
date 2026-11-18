import React, { useMemo, useState } from "react";
import { BookOpen, RefreshCw, Scale } from "lucide-react";
import { ChecklistPanel } from "./components/ChecklistPanel";
import { Header } from "./components/Header";
import { ReportModal } from "./components/ReportModal";
import { SimulatorWorkspace } from "./components/SimulatorWorkspace";
import { WhatIfLab } from "./components/WhatIfLab";
import { FinancialState, ScenarioPreset, ViewMode } from "./types/crisis";
import {
  calculateSustainability,
  CCII_CHECKLIST_ITEMS,
  DEFAULT_FINANCIAL_STATE,
  EMPTY_FINANCIAL_STATE,
  SCENARIO_PRESETS,
} from "./utils/financialEngine";

const INITIAL_CHECKLIST: Record<string, boolean> = Object.fromEntries(
  CCII_CHECKLIST_ITEMS.map((item) => [item.key, false])
);

export default function App() {
  const [inputs, setInputs] = useState<FinancialState>(DEFAULT_FINANCIAL_STATE);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [viewMode, setViewMode] = useState<ViewMode>("wizard");
  const [debtHaircutPercent, setDebtHaircutPercent] = useState<number>(0);
  const [cashFlowOptimPercent, setCashFlowOptimPercent] = useState<number>(0);
  const [checklist, setChecklist] = useState<Record<string, boolean>>(INITIAL_CHECKLIST);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  const metrics = useMemo(
    () => calculateSustainability(inputs, debtHaircutPercent, cashFlowOptimPercent),
    [inputs, debtHaircutPercent, cashFlowOptimPercent]
  );

  const handleInputChange = (field: keyof FinancialState, rawValue: string) => {
    const digitsOnly = rawValue.replace(/\D/g, "");
    const numericValue = digitsOnly ? parseInt(digitsOnly, 10) : 0;
    setInputs((prev) => ({
      ...prev,
      [field]: Math.max(0, numericValue),
    }));
  };

  const applyPreset = (preset: ScenarioPreset) => {
    setInputs(preset.data);
    setDebtHaircutPercent(0);
    setCashFlowOptimPercent(0);
    if (viewMode === "wizard" && activeStep === 3) {
      setActiveStep(1);
    }
  };

  const toggleChecklistItem = (key: string) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const resetAll = () => {
    setInputs(EMPTY_FINANCIAL_STATE);
    setDebtHaircutPercent(0);
    setCashFlowOptimPercent(0);
    setActiveStep(1);
  };

  const handleChangeViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === "expert") {
      setActiveStep(3);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      <Header onOpenReport={() => setShowExportModal(true)} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 print:hidden">
        {/* Intro, Workspace Controls & Presets */}
        <section
          id="simulatore"
          className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-xs"
        >
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
            <div className="max-w-2xl">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                <BookOpen className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
                <span>Codice della Crisi d'Impresa e dell'Insolvenza</span>
                <span aria-hidden="true">·</span>
                <span>Linee guida ministeriali</span>
              </div>
              <h1 className="text-balance text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Test Pratico di Sostenibilità Economica
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Calcola il rapporto tra l'indebitamento da ristrutturare e il flusso di cassa annuo stimato per verificare in autonomia l'opportunità di accedere alla{" "}
                <strong className="font-semibold text-slate-900">
                  Composizione Negoziata della Crisi
                </strong>
                .
              </p>

              {/* Workspace mode toolbar */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1"
                  role="group"
                  aria-label="Modalità di visualizzazione"
                >
                  <button
                    type="button"
                    onClick={() => handleChangeViewMode("wizard")}
                    id="toggle-wizard-view"
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                      viewMode === "wizard"
                        ? "bg-white text-slate-950 shadow-xs"
                        : "text-slate-600 hover:text-slate-950"
                    }`}
                  >
                    Percorso Guidato
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChangeViewMode("expert")}
                    id="toggle-expert-view"
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                      viewMode === "expert"
                        ? "bg-white text-slate-950 shadow-xs"
                        : "text-slate-600 hover:text-slate-950"
                    }`}
                  >
                    Pannello Esperto Live
                  </button>
                </div>

                <button
                  type="button"
                  onClick={resetAll}
                  id="reset-button-top"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors whitespace-nowrap"
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  Azzera dati
                </button>
              </div>
            </div>

            {/* Scenario Presets */}
            <div className="w-full shrink-0 rounded-lg border border-slate-200 bg-slate-50 p-4 lg:max-w-md">
              <span className="mb-2.5 block font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Scenari aziendali di esempio
              </span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {SCENARIO_PRESETS.map((preset) => {
                  const isActive =
                    inputs.debitiFornitori === preset.data.debitiFornitori &&
                    inputs.debitiBancari === preset.data.debitiBancari &&
                    inputs.debitiFiscali === preset.data.debitiFiscali &&
                    inputs.fatturatoAnnuo === preset.data.fatturatoAnnuo &&
                    inputs.costiOperativi === preset.data.costiOperativi;

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      id={`preset-btn-${preset.id}`}
                      className={`flex flex-col justify-between rounded-lg border p-3 text-left text-xs transition-colors ${
                        isActive
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-slate-200 bg-white text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <div>
                        <div className="truncate font-bold tracking-tight">
                          {preset.name}
                        </div>
                        <div
                          className={`mt-1 line-clamp-2 text-[11px] leading-snug ${
                            isActive ? "text-slate-300" : "text-slate-500"
                          }`}
                        >
                          {preset.tag}
                        </div>
                      </div>
                      <span
                        className={`mt-2.5 block self-end font-mono text-[11px] font-medium ${
                          isActive ? "text-amber-400" : "text-slate-600"
                        }`}
                      >
                        Carica →
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Main 2-column grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-7">
            <SimulatorWorkspace
              inputs={inputs}
              metrics={metrics}
              viewMode={viewMode}
              activeStep={activeStep}
              onChangeViewMode={handleChangeViewMode}
              onChangeStep={setActiveStep}
              onInputChange={handleInputChange}
            />

            <WhatIfLab
              metrics={metrics}
              debtHaircutPercent={debtHaircutPercent}
              cashFlowOptimPercent={cashFlowOptimPercent}
              onChangeDebtHaircut={setDebtHaircutPercent}
              onChangeCashFlowOptim={setCashFlowOptimPercent}
              onResetWhatIf={() => {
                setDebtHaircutPercent(0);
                setCashFlowOptimPercent(0);
              }}
            />
          </div>

          <div className="lg:col-span-5">
            <ChecklistPanel
              checklist={checklist}
              onToggleItem={toggleChecklistItem}
              onOpenReport={() => setShowExportModal(true)}
            />
          </div>
        </div>

        {/* Legal Reference Box */}
        <section
          id="normativa-ccii"
          className="mx-auto mt-10 max-w-4xl rounded-xl border border-slate-200 bg-white p-6 shadow-xs"
        >
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold tracking-tight text-slate-950">
            <Scale className="h-5 w-5 text-slate-700" aria-hidden="true" />
            Inquadramento Giuridico: Art. 12 CCII e Test di Sostenibilità
          </h2>
          <div className="grid grid-cols-1 gap-6 text-xs leading-relaxed text-slate-600 md:grid-cols-2">
            <div className="space-y-3">
              <p>
                La <strong>Composizione Negoziata della Crisi</strong> è un percorso stragiudiziale e volontario introdotto dal d.lgs. n. 14/2019 (Codice della Crisi d'Impresa e dell'Insolvenza) che consente alle imprese in squilibrio economico-finanziario di avviare trattative assistite da un{" "}
                <strong>esperto indipendente</strong> nominato tramite la Camera di Commercio.
              </p>
              <p>
                Il <strong>Test Pratico di Sostenibilità</strong> stima in via preliminare il grado di complessità del risanamento confrontando l'indebitamento complessivo con la capacità annua di generazione di cassa.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900">
                Misure protettive del patrimonio e risanamento
              </h3>
              <p>
                Con l'istanza di accesso, l'imprenditore può richiedere l'applicazione di{" "}
                <strong>misure protettive</strong> per sospendere azioni esecutive o cautelari individuali sul patrimonio aziendale durante lo svolgimento delle trattative.
              </p>
              <p>
                Quando l'indicatore segnala una tensione finanziaria elevata, l'attivazione tempestiva dello strumento riduce il rischio di aggravamento del dissesto e tutela la continuità aziendale.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-14 border-t border-slate-200 bg-white py-8 print:hidden">
        <div className="mx-auto max-w-7xl space-y-2 px-4 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
          <p className="font-semibold text-slate-700">
            Pre-Check Crisi · Simulatore gratuito e interamente locale del Test di Sostenibilità CCII
          </p>
          <p>
            Riferimento normativo: Codice della Crisi d'Impresa e dell'Insolvenza (d.lgs. 12 gennaio 2019, n. 14 e s.m.i.)
          </p>
          <p className="mx-auto max-w-2xl text-slate-500">
            Avvertenza: i risultati della simulazione hanno finalità orientativa e non sostituiscono la consulenza professionale né la valutazione ufficiale camerale.
          </p>
        </div>
      </footer>

      <ReportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        inputs={inputs}
        metrics={metrics}
        debtHaircutPercent={debtHaircutPercent}
        cashFlowOptimPercent={cashFlowOptimPercent}
        checklist={checklist}
      />
    </div>
  );
}
