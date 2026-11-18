import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  Scale,
  FileText,
  Calculator,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
  AlertTriangle,
  Download,
  Info,
  ExternalLink,
  Coins,
  Building,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  ArrowRight,
  Maximize2,
  FileSpreadsheet,
  Check,
  Printer
} from "lucide-react";

// Types for financial configuration
interface FinancialState {
  debitiFornitori: number;
  debitiBancari: number;
  debitiFiscali: number;
  fatturatoAnnuo: number;
  costiOperativi: number;
}

interface ScenarioPreset {
  name: string;
  description: string;
  data: FinancialState;
  tag: string;
}

export default function App() {
  // --- STATE ---
  const [inputs, setInputs] = useState<FinancialState>({
    debitiFornitori: 120000,
    debitiBancari: 250000,
    debitiFiscali: 80000,
    fatturatoAnnuo: 1200000,
    costiOperativi: 1080000,
  });

  const [activeStep, setActiveStep] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"wizard" | "expert">("wizard");
  const [selectedTooltip, setSelectedTooltip] = useState<string | null>(null);
  
  // What-If Simulation adjustments
  const [debtHaircutPercent, setDebtHaircutPercent] = useState<number>(0); // 0% to 50% discount
  const [cashFlowOptimPercent, setCashFlowOptimPercent] = useState<number>(0); // 0% to 30% increase

  // Document checklist state
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    bilanci: false,
    visura: false,
    creditori: false,
    pianoRisanamento: false,
    debitoTributario: false,
    debitoPrevidenziale: false,
    flussiCassa: false,
  });

  // Share or Print modal state
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // --- SCENARIO PRESETS INDEX ---
  const PRESETS: ScenarioPreset[] = [
    {
      name: "PMI Manifatturiera",
      tag: "Squilibrio Temporaneo",
      description: "Fatturato solido ma con debiti accumulati post-emergenza. Flusso di cassa positivo ma insufficiente a breve termine.",
      data: {
        debitiFornitori: 110000,
        debitiBancari: 240000,
        debitiFiscali: 100000,
        fatturatoAnnuo: 1300000,
        costiOperativi: 1180000, // Cash flow 120k on 450k debt -> ~3.75 anni
      }
    },
    {
      name: "Ristorazione & Servizi",
      tag: "Tensione Finanziaria Grave",
      description: "Margini operativi compressi dal rincaro energetico e forte accumulo di debiti fiscali a lungo termine.",
      data: {
        debitiFornitori: 80000,
        debitiBancari: 140000,
        debitiFiscali: 130000,
        fatturatoAnnuo: 480000,
        costiOperativi: 445000, // Cash flow 35k on 350k debt -> 10 anni
      }
    },
    {
      name: "Società Artigiana",
      tag: "Situazione in Equilibrio",
      description: "Piccola impresa con debito residuo contenuto, in fase di ripartenza con margini in miglioramento.",
      data: {
        debitiFornitori: 25000,
        debitiBancari: 45000,
        debitiFiscali: 15000,
        fatturatoAnnuo: 350000,
        costiOperativi: 295000, // Cash flow 55k on 85k debt -> ~1.55 anni
      }
    }
  ];

  // --- FINANCIAL ENGINE ---
  const totalsAndIndicators = useMemo(() => {
    const { debitiFornitori, debitiBancari, debitiFiscali, fatturatoAnnuo, costiOperativi } = inputs;

    // Standard Math
    const totalDebt = Math.max(0, debitiFornitori + debitiBancari + debitiFiscali);
    const baseCashFlow = fatturatoAnnuo - costiOperativi;

    // Simulation Math (What-If adjustments applied)
    const adjustedDebt = Math.max(0, totalDebt * (1 - debtHaircutPercent / 100));
    const adjustedCashFlow = baseCashFlow > 0 ? baseCashFlow * (1 + cashFlowOptimPercent / 100) : baseCashFlow;

    // Base indicators
    let baseYears = 0;
    if (baseCashFlow <= 0) {
      baseYears = -1; // Negative cash flow
    } else {
      baseYears = totalDebt / baseCashFlow;
    }

    // Adjusted indicators
    let adjustedYears = 0;
    if (adjustedCashFlow <= 0) {
      adjustedYears = -1;
    } else {
      adjustedYears = adjustedDebt / adjustedCashFlow;
    }

    // Determine Base Semaphor Thresholds
    let verdictType: "green" | "yellow" | "red" = "green";
    let verdictText = "";
    let descriptionText = "";

    if (baseCashFlow <= 0) {
      verdictType = "red";
      verdictText = "Semaforo Rosso: Tensione Finanziaria Grave";
      descriptionText = "Il flusso di cassa corrente è negativo o pari a zero. L'azienda genera perdite operative e non ha margini di liquidità residui per sostenere i debiti accumulati. È indispensabile un piano di ristrutturazione profondo e l'assistenza urgente di un esperto indipendente.";
    } else if (baseYears <= 2) {
      verdictType = "green";
      verdictText = "Semaforo Verde: Situazione Gestibile";
      descriptionText = "I debiti esistenti sono interamente ripianabili in meno di 2 anni tramite il flusso di cassa annuo. La situazione è sotto controllo ed è solvibile con le normali operazioni correttive del management. Non sussistono al momento segnali di crisi conclamata.";
    } else if (baseYears > 2 && baseYears <= 5) {
      verdictType = "yellow";
      verdictText = "Semaforo Giallo: Squilibrio Finanziario";
      descriptionText = "Il tempo teorico di risanamento è compreso tra 2 e 5 anni. Pur non trovandosi in insolvenza irreversibile, l'impresa manifesta uno squilibrio strutturale. È l'ottimo candidato ideale per attivare in via preventiva lo strumento protettivo della 'Composizione Negoziata della Crisi' presso la Camera di Commercio.";
    } else {
      verdictType = "red";
      verdictText = "Semaforo Rosso: Tensione Finanziaria Grave";
      descriptionText = "Il rientro dal debito richiede più di 5 anni di interi flussi operativi aziendali. La pressione finanziaria complessiva rischia di pregiudicare la continuità aziendale se non corretta tempestivamente. Si raccomanda di avviare immediatamente un'analisi approfondita con l'ausilio delle misure protettive del patrimonio.";
    }

    // Determine Adjusted Semaphor Thresholds
    let adjustedVerdictType: "green" | "yellow" | "red" = "green";
    if (adjustedCashFlow <= 0) {
      adjustedVerdictType = "red";
    } else if (adjustedYears <= 2) {
      adjustedVerdictType = "green";
    } else if (adjustedYears > 2 && adjustedYears <= 5) {
      adjustedVerdictType = "yellow";
    } else {
      adjustedVerdictType = "red";
    }

    return {
      totalDebt,
      baseCashFlow,
      baseYears,
      verdictType,
      verdictText,
      descriptionText,

      // Adjusted attributes
      adjustedDebt,
      adjustedCashFlow,
      adjustedYears,
      adjustedVerdictType,
    };
  }, [inputs, debtHaircutPercent, cashFlowOptimPercent]);

  // Document checklist counters
  const checklistCount = Object.values(checklist).filter(Boolean).length;
  const checklistTotal = Object.keys(checklist).length;
  const checklistPercentage = Math.round((checklistCount / checklistTotal) * 100);

  // --- ACTIONS ---
  const applyPreset = (preset: ScenarioPreset) => {
    setInputs(preset.data);
    setDebtHaircutPercent(0);
    setCashFlowOptimPercent(0);
    if (activeStep === 3) {
      setActiveStep(1);
    }
  };

  const handleInputChange = (field: keyof FinancialState, value: string) => {
    const numValue = Math.max(0, parseInt(value.replace(/\D/g, "")) || 0);
    setInputs(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const toggleChecklist = (key: string) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const resetAll = () => {
    setInputs({
      debitiFornitori: 0,
      debitiBancari: 0,
      debitiFiscali: 0,
      fatturatoAnnuo: 0,
      costiOperativi: 0,
    });
    setDebtHaircutPercent(0);
    setCashFlowOptimPercent(0);
    setActiveStep(1);
  };

  // Helper formatting currency
  const formatEuro = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      
      {/* 1. STATE WATERMARK HEADER (Humble & Highly Institutional) */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-slate-900 text-amber-500 shadow-sm" id="brand-logo">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-medium">
                Unione Italiana Camere di Commercio, Industria e Artigianato
              </div>
              <h1 className="text-lg font-bold text-slate-950 tracking-tight flex items-center gap-2">
                Pre-Check Crisi <span className="text-slate-400 font-normal">|</span> <span className="text-slate-600 text-sm font-medium">Test di Sostenibilità Economica</span>
              </h1>
            </div>
          </div>
          
          {/* Top Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("wizard")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                viewMode === "wizard"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              id="toggle-wizard-view"
            >
              Percorso Guidato
            </button>
            <button
              onClick={() => {
                setViewMode("expert");
                setActiveStep(3); // Go to results immediately since all inputs are shown together
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                viewMode === "expert"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              id="toggle-expert-view"
            >
              Pannello Esperto (Live)
            </button>
            <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>
            <button
              onClick={resetAll}
              className="px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-all flex items-center gap-1.5"
              id="reset-button-top"
              title="Azzera tutti i dati inseriti"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Azzera</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. CONFIDENTIALITY BANNER */}
      <div className="bg-slate-950 text-slate-100 border-b border-slate-850" id="confidentiality-banner">
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-500/10 text-amber-400 p-1 rounded-sm">
              <Lock className="h-3.5 w-3.5 shrink-0" />
            </div>
            <p className="text-slate-300 leading-relaxed">
              <span className="font-semibold text-white">🔒 Test 100% Anonimo e Sicuro.</span> Nessun dato economico o anagrafico viene inviato ai server, memorizzato o condiviso. Tutti i calcoli avvengono in tempo reale all'interno del tuo browser web.
            </p>
          </div>
          <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-850 text-slate-400 font-mono text-[10px]">
            CCII Art. 12 • Normativa Ministeriale
          </span>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Scenarios and Instructive Overview Banner */}
        <section className="mb-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[11px] font-mono font-medium mb-2.5">
                <BookOpen className="h-3.5 w-3.5 text-slate-600" />
                Linee Guida Ministeriali
              </div>
              <h2 className="text-xl font-bold text-slate-950 tracking-tight">
                Simulatore dell'Indice di Sostenibilità Economica
              </h2>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                Questo algoritmo traduce il <span className="font-semibold text-slate-900">Test di Sostenibilità</span> previsto dal Ministero della Giustizia. Estrapola il rapporto tra l'indebitamento ristrutturabile e il margine operativo di cassa annuo per definire l'accessibilità alla <strong>Composizione Negoziata della Crisi</strong>.
              </p>
            </div>

            {/* Presets Grid */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/80 w-full lg:max-w-md shrink-0">
              <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                Popola i dati all'istante (Scenario d'Esempio)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {PRESETS.map((preset) => {
                  const isActive = 
                    inputs.debitiFornitori === preset.data.debitiFornitori &&
                    inputs.debitiBancari === preset.data.debitiBancari &&
                    inputs.debitiFiscali === preset.data.debitiFiscali &&
                    inputs.fatturatoAnnuo === preset.data.fatturatoAnnuo &&
                    inputs.costiOperativi === preset.data.costiOperativi;

                  return (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className={`text-left p-2.5 rounded border transition-all text-xs flex flex-col justify-between ${
                        isActive
                          ? "bg-slate-950 text-white border-slate-950 shadow-xs"
                          : "bg-white text-slate-850 hover:bg-slate-100 border-slate-200"
                      }`}
                      id={`preset-btn-${preset.name.toLowerCase().replace(/\s/g, "-")}`}
                    >
                      <div>
                        <div className="font-bold tracking-tight truncate">{preset.name}</div>
                        <div className={`text-[9px] mt-0.5 line-clamp-1 ${isActive ? "text-slate-300" : "text-slate-555"}`}>
                          {preset.tag}
                        </div>
                      </div>
                      <span className={`block text-[9px] font-mono mt-2 self-end ${isActive ? "text-amber-400" : "text-slate-500"}`}>
                        Carica →
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 3. CORE CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COLUMN 1: Inputs & Wizard Engine (7 columns) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* WIZARD CARD PANEL */}
            {viewMode === "wizard" ? (
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden" id="wizard-container">
                {/* Steps Navigation Bar */}
                <div className="border-b border-slate-150 bg-slate-50/50 px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white font-mono">
                      {activeStep}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider font-mono">
                      {activeStep === 1 && "Fase 1 di 3: Posizione Debitoria"}
                      {activeStep === 2 && "Fase 2 di 3: Flusso di Cassa e Margini"}
                      {activeStep === 3 && "Fase 3 di 3: Elaborazione Diagnostica"}
                    </span>
                  </div>
                  
                  {/* Step dots */}
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((s) => (
                      <button
                        key={s}
                        onClick={() => setActiveStep(s)}
                        className={`h-2.5 rounded-full transition-all ${
                          activeStep === s ? "w-8 bg-slate-900" : "w-2.5 bg-slate-200"
                        }`}
                        aria-label={`Vai al passo ${s}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Step contents */}
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    
                    {/* STEP 1: DEBIT POSITION */}
                    {activeStep === 1 && (
                      <motion.div
                        key="step-debts"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-5"
                      >
                        <div className="border-b border-slate-100 pb-3">
                          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Coins className="h-5 w-5 text-amber-500" />
                            Definisci la Posizione Debitoria Totale
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Inserisci i debiti scaduti o oggetto di imminente ristrutturazione (rif. Art 12 CCII).
                          </p>
                        </div>

                        {/* Input Fields */}
                        <div className="space-y-4">
                          {/* Input 1: Fornitori */}
                          <div className="group rounded-lg border border-slate-200 p-4 bg-white hover:border-slate-300 transition-all">
                            <div className="flex items-center justify-between">
                              <label htmlFor="debitiFornitori" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                1. Debiti verso Fornitori (€)
                                <button
                                  type="button"
                                  onClick={() => setSelectedTooltip(selectedTooltip === "fornitori" ? null : "fornitori")}
                                  className="text-slate-400 hover:text-slate-600 focus:outline-none"
                                >
                                  <Info className="h-3.5 w-3.5" />
                                </button>
                              </label>
                              <span className="text-[10px] font-mono text-slate-400">Scaduti o prorogati</span>
                            </div>

                            {selectedTooltip === "fornitori" && (
                              <div className="mt-2 text-xs bg-slate-900 text-slate-100 p-2.5 rounded border border-slate-850">
                                Comprende tutti i debiti scaduti verso i fornitori di materie prime, merci, energia o servizi, al netto di eventuali dilazioni formali stipulate a lungo termine.
                              </div>
                            )}

                            <div className="mt-2.5 relative rounded-md shadow-xs">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-slate-400 text-sm">€</span>
                              </div>
                              <input
                                type="text"
                                id="debitiFornitori"
                                value={inputs.debitiFornitori || ""}
                                onChange={(e) => handleInputChange("debitiFornitori", e.target.value)}
                                className="block w-full rounded-md border border-slate-200 py-2.5 pl-8 pr-12 text-sm focus:border-slate-900 focus:outline-hidden font-mono font-semibold"
                                placeholder="0"
                              />
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <span className="text-slate-400 text-[10px] font-semibold">EUR</span>
                              </div>
                            </div>
                          </div>

                          {/* Input 2: Banche */}
                          <div className="group rounded-lg border border-slate-200 p-4 bg-white hover:border-slate-300 transition-all">
                            <div className="flex items-center justify-between">
                              <label htmlFor="debitiBancari" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                2. Debiti Finanziari e Bancari (€)
                                <button
                                  type="button"
                                  onClick={() => setSelectedTooltip(selectedTooltip === "banche" ? null : "banche")}
                                  className="text-slate-400 hover:text-slate-600 focus:outline-none"
                                >
                                  <Info className="h-3.5 w-3.5" />
                                </button>
                              </label>
                              <span className="text-[10px] font-mono text-slate-400">Chirografari e ipotecari</span>
                            </div>

                            {selectedTooltip === "banche" && (
                              <div className="mt-2 text-xs bg-slate-900 text-slate-100 p-2.5 rounded border border-slate-850">
                                Linee di credito a breve termine utilizzate, rate residue di mutui ipotecari/chirografari, leasing finanziari in scadenza entro l'anno e scoperti di conto.
                              </div>
                            )}

                            <div className="mt-2.5 relative rounded-md shadow-xs">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-slate-400 text-sm">€</span>
                              </div>
                              <input
                                type="text"
                                id="debitiBancari"
                                value={inputs.debitiBancari || ""}
                                onChange={(e) => handleInputChange("debitiBancari", e.target.value)}
                                className="block w-full rounded-md border border-slate-200 py-2.5 pl-8 pr-12 text-sm focus:border-slate-900 focus:outline-hidden font-mono font-semibold"
                                placeholder="0"
                              />
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <span className="text-slate-400 text-[10px] font-semibold">EUR</span>
                              </div>
                            </div>
                          </div>

                          {/* Input 3: Fiscali */}
                          <div className="group rounded-lg border border-slate-200 p-4 bg-white hover:border-slate-300 transition-all">
                            <div className="flex items-center justify-between">
                              <label htmlFor="debitiFiscali" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                3. Debiti Fiscali & Previdenziali (€)
                                <button
                                  type="button"
                                  onClick={() => setSelectedTooltip(selectedTooltip === "fiscali" ? null : "fiscali")}
                                  className="text-slate-400 hover:text-slate-600 focus:outline-none"
                                >
                                  <Info className="h-3.5 w-3.5" />
                                </button>
                              </label>
                              <span className="text-[10px] font-mono text-slate-400">AdE, INPS, INAIL</span>
                            </div>

                            {selectedTooltip === "fiscali" && (
                              <div className="mt-2 text-xs bg-slate-900 text-slate-100 p-2.5 rounded border border-slate-850">
                                Importi iscritti a ruolo (cartelle esattoriali), ritardati pagamenti IVA, debiti INPS/INAIL scaduti per dipendenti o titolari non ancora dilazionati o stralciati.
                              </div>
                            )}

                            <div className="mt-2.5 relative rounded-md shadow-xs">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-slate-400 text-sm">€</span>
                              </div>
                              <input
                                type="text"
                                id="debitiFiscali"
                                value={inputs.debitiFiscali || ""}
                                onChange={(e) => handleInputChange("debitiFiscali", e.target.value)}
                                className="block w-full rounded-md border border-slate-200 py-2.5 pl-8 pr-12 text-sm focus:border-slate-900 focus:outline-hidden font-mono font-semibold"
                                placeholder="0"
                              />
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <span className="text-slate-400 text-[10px] font-semibold">EUR</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Summary Block */}
                        <div className="mt-6 rounded-lg bg-slate-900 text-slate-100 p-4 flex items-center justify-between">
                          <div>
                            <span className="block text-[10px] uppercase text-slate-400 tracking-wider font-mono">
                              Subtotale Posizione Debitoria
                            </span>
                            <span className="text-lg font-bold">Debito Totale Residuo</span>
                          </div>
                          <span className="text-xl font-mono font-bold text-amber-400" id="wizard-debt-total">
                            {formatEuro(totalsAndIndicators.totalDebt)}
                          </span>
                        </div>

                        {/* Navigation buttons */}
                        <div className="pt-4 flex justify-end">
                          <button
                            onClick={() => setActiveStep(2)}
                            className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-md text-xs font-semibold flex items-center gap-1 shadow-xs transition-all"
                            id="btn-next-step-1"
                          >
                            Prosegui ai Flussi
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2: CASH FLOWS */}
                    {activeStep === 2 && (
                      <motion.div
                        key="step-flows"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-5"
                      >
                        <div className="border-b border-slate-100 pb-3">
                          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                            Parametri Economici e Flussi di Cassa
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Definisci la redditività operativa annuale stimata per verificare la solvibilità finanziaria.
                          </p>
                        </div>

                        <div className="space-y-4">
                          
                          {/* Fatturato */}
                          <div className="group rounded-lg border border-slate-200 p-4 bg-white hover:border-slate-300 transition-all">
                            <div className="flex items-center justify-between">
                              <label htmlFor="fatturatoAnnuo" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                Fatturato Annuo Stimato (€)
                                <button
                                  type="button"
                                  onClick={() => setSelectedTooltip(selectedTooltip === "fatturato" ? null : "fatturato")}
                                  className="text-slate-400 hover:text-slate-600 focus:outline-none"
                                >
                                  <Info className="h-3.5 w-3.5" />
                                </button>
                              </label>
                              <span className="text-[10px] font-mono text-slate-400">Volume D'affari</span>
                            </div>

                            {selectedTooltip === "fatturato" && (
                              <div className="mt-2 text-xs bg-slate-900 text-slate-100 p-2.5 rounded border border-slate-850">
                                Indica il totale dei ricavi caratteristici annui (al netto dell'IVA) fatturati o previsti in termini prudenziali per l'esercizio corrente di 12 mesi.
                              </div>
                            )}

                            <div className="mt-2.5 relative rounded-md shadow-xs">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-slate-400 text-sm">€</span>
                              </div>
                              <input
                                type="text"
                                id="fatturatoAnnuo"
                                value={inputs.fatturatoAnnuo || ""}
                                onChange={(e) => handleInputChange("fatturatoAnnuo", e.target.value)}
                                className="block w-full rounded-md border border-slate-200 py-2.5 pl-8 pr-12 text-sm focus:border-slate-900 focus:outline-hidden font-mono font-semibold"
                                placeholder="0"
                              />
                            </div>
                          </div>

                          {/* Costi Operativi */}
                          <div className="group rounded-lg border border-slate-200 p-4 bg-white hover:border-slate-300 transition-all">
                            <div className="flex items-center justify-between">
                              <label htmlFor="costiOperativi" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                Costi Operativi Annuali (€)
                                <button
                                  type="button"
                                  onClick={() => setSelectedTooltip(selectedTooltip === "costi" ? null : "costi")}
                                  className="text-slate-400 hover:text-slate-600 focus:outline-none"
                                >
                                  <Info className="h-3.5 w-3.5" />
                                </button>
                              </label>
                              <span className="text-[10px] font-mono text-slate-400">Personale, locazioni, merci</span>
                            </div>

                            {selectedTooltip === "costi" && (
                              <div className="mt-2 text-xs bg-slate-900 text-slate-100 p-2.5 rounded border border-slate-850">
                                Somma di tutte le uscite di esercizio: acquisti materie prime, salari e stipendi dipendenti, fitti passivi, utenze, assicurazioni e tasse ordinarie legate alla gestione tipica.
                              </div>
                            )}

                            <div className="mt-2.5 relative rounded-md shadow-xs">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-slate-400 text-sm">€</span>
                              </div>
                              <input
                                type="text"
                                id="costiOperativi"
                                value={inputs.costiOperativi || ""}
                                onChange={(e) => handleInputChange("costiOperativi", e.target.value)}
                                className="block w-full rounded-md border border-slate-200 py-2.5 pl-8 pr-12 text-sm focus:border-slate-900 focus:outline-hidden font-mono font-semibold"
                                placeholder="0"
                              />
                            </div>
                          </div>

                        </div>

                        {/* Live Flow Box */}
                        <div className={`mt-6 rounded-lg p-4 flex items-center justify-between border ${
                          totalsAndIndicators.baseCashFlow > 0
                            ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                            : "bg-rose-50 border-rose-200 text-rose-950"
                        }`}>
                          <div>
                            <span className="block text-[10px] uppercase tracking-wider font-mono opacity-85">
                              Autofinanziamento Netto Stimato
                            </span>
                            <span className="text-base font-bold">Flusso di Cassa Libero (EBITDA approssimato)</span>
                          </div>
                          <span className={`text-xl font-mono font-bold ${
                            totalsAndIndicators.baseCashFlow > 0 ? "text-emerald-700" : "text-rose-700"
                          }`} id="wizard-cashflow-total">
                            {formatEuro(totalsAndIndicators.baseCashFlow)}
                          </span>
                        </div>

                        {/* Navigation buttons */}
                        <div className="pt-4 flex justify-between items-center">
                          <button
                            onClick={() => setActiveStep(1)}
                            className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md text-xs font-semibold flex items-center gap-1 transition-all"
                            id="btn-back-to-step-1"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Indietro
                          </button>
                          
                          <button
                            onClick={() => setActiveStep(3)}
                            className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-md text-xs font-semibold flex items-center gap-1 shadow-xs transition-all animate-pulse"
                            id="btn-next-step-2"
                          >
                            Calcola Verdetto Finale
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3: DYNAMIC REPORT PORTAL */}
                    {activeStep === 3 && (
                      <motion.div
                        key="step-results"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                      >
                        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                          <div>
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                              <ShieldCheck className="h-5 w-5 text-slate-800" />
                              Report di Valutazione Dinamico
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Esito basato sull'algoritmo ufficiale del Test Pratico di Sostenibilità Economica.
                            </p>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
                            ID: PRO-SIM-2026
                          </span>
                        </div>

                        {/* Minimal recap card of original inputs for validation */}
                        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                          <div>
                            <div className="text-slate-500 font-mono text-[10px] uppercase">Indebitamento Totale</div>
                            <div className="font-bold text-slate-950 font-mono mt-0.5">
                              {formatEuro(totalsAndIndicators.totalDebt)}
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-500 font-mono text-[10px] uppercase">Cash Flow Disponibile</div>
                            <div className="font-bold text-slate-950 font-mono mt-0.5">
                              {formatEuro(totalsAndIndicators.baseCashFlow)}
                            </div>
                          </div>
                        </div>

                        {/* Dynamic Semaphor Output Badge */}
                        <div className={`p-5 rounded-lg border-2 ${
                          totalsAndIndicators.verdictType === "green"
                            ? "bg-emerald-50/75 border-emerald-400 text-emerald-950"
                            : totalsAndIndicators.verdictType === "yellow"
                            ? "bg-amber-50/75 border-amber-400 text-amber-950"
                            : "bg-rose-50/75 border-rose-400 text-rose-950"
                        }`} id="verdict-banner-display">
                          <div className="flex gap-4 items-start">
                            {/* Visual Signal Icon */}
                            <div className={`h-11 w-11 rounded-full shrink-0 flex items-center justify-center border-4 ${
                              totalsAndIndicators.verdictType === "green"
                                ? "bg-emerald-500 text-white border-emerald-200"
                                : totalsAndIndicators.verdictType === "yellow"
                                ? "bg-amber-500 text-white border-amber-200"
                                : "bg-rose-500 text-white border-rose-200"
                            }`}>
                              {totalsAndIndicators.verdictType === "green" && <CheckCircle2 className="h-5 w-5" />}
                              {totalsAndIndicators.verdictType === "yellow" && <AlertTriangle className="h-5 w-5" />}
                              {totalsAndIndicators.verdictType === "red" && <AlertCircle className="h-5 w-5" />}
                            </div>

                            <div>
                              <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-slate-250 mb-1 font-mono">
                                Risultato Sostenibilità
                              </span>
                              <h4 className="text-base font-bold tracking-tight">
                                {totalsAndIndicators.verdictText}
                              </h4>
                              <p className="text-xs mt-2 leading-relaxed opacity-90">
                                {totalsAndIndicators.descriptionText}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Calculations Explanatory Panel with custom timeline visual slider */}
                        <div className="rounded-lg border border-slate-200 p-4 bg-white">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-3">
                            Posizione dell'Azienda nel Profilo di Crisi
                          </h4>
                          
                          {/* Custom Indicator Scale (Visual Timeline representation) */}
                          <div className="relative mt-2 mb-6">
                            {/* Legend labels */}
                            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 font-mono px-1 mb-2">
                              <span>0 Anni</span>
                              <span>Verde (≤ 2)</span>
                              <span>Giallo (2 - 5)</span>
                              <span>Rosso (&gt; 5 o Negativo)</span>
                            </div>

                            {/* Scale Bar background */}
                            <div className="h-3 w-full bg-slate-100 rounded-full flex overflow-hidden">
                              <div className="h-full w-[20%] bg-emerald-500" title="Verde (Fino a 2 Anni)" />
                              <div className="h-full w-[30%] bg-amber-500" title="Giallo (Da 2 a 5 Anni)" />
                              <div className="h-full w-[50%] bg-rose-500" title="Rosso (Oltre 5 Anni)" />
                            </div>

                            {/* Indicator Pointer */}
                            {totalsAndIndicators.baseYears >= 0 ? (
                              <div 
                                className="absolute top-2 transition-all duration-300 flex flex-col items-center"
                                style={{ 
                                  left: `${Math.min(95, Math.max(2, (totalsAndIndicators.baseYears / 10) * 100))}%`
                                }}
                              >
                                <div className="w-3 h-3 bg-slate-900 rotate-45 border-2 border-white shadow-xs" />
                                <span className="text-[10px] bg-slate-900 text-white font-bold py-0.5 px-2 rounded-sm font-mono mt-1 shadow-md whitespace-nowrap">
                                  {totalsAndIndicators.baseYears.toFixed(1)} {totalsAndIndicators.baseYears === 1 ? "anno" : "anni"}
                                </span>
                              </div>
                            ) : (
                              <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                <div className="w-3 h-3 bg-red-600 rotate-45 border-2 border-white shadow-xs" />
                                <span className="text-[10px] bg-red-600 text-white font-bold py-0.5 px-3 rounded-sm font-mono mt-1 shadow-md text-center">
                                  Cash Flow Negativo
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="mt-8 border-t border-slate-100 pt-4 text-xs text-slate-600 space-y-2.5">
                            <p className="leading-relaxed">
                              L'indicatore riflette la formula concordata: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-900">Debito Ristrutturabile / Cash Flow Annuo</code>. Rappresenta gli anni di flussi cassa operativi lordi che dovrebbero essere interamente convogliati per liquidare l'intero fabbisogno debitorio.
                            </p>
                          </div>
                        </div>

                        {/* Standard button navigation inside wizard */}
                        <div className="pt-2 flex justify-between">
                          <button
                            onClick={() => setActiveStep(2)}
                            className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md text-xs font-semibold flex items-center gap-1 transition-all"
                            id="btn-back-to-step-2"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Modifica Input Flussi
                          </button>
                          
                          <button
                            onClick={() => {
                              setViewMode("expert");
                            }}
                            className="px-4 py-2 bg-slate-950 text-white hover:bg-slate-850 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all"
                            id="btn-goto-expert"
                          >
                            Accedi alla Simulazione di Risanamento
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>
              </div>
            ) : (
              
              /* EXPERT PANEL: COMPREHENSIVE INPUT CONTROLS */
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-6" id="expert-container">
                <div className="border-b border-slate-150 pb-4">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono block mb-1">
                    Modalità Integrata Esperto
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-slate-800" />
                      Pannello di Controllo Economico Completo
                    </h3>
                    <button
                      onClick={() => setViewMode("wizard")}
                      className="text-xs font-semibold text-slate-705 underline hover:text-slate-900 self-start"
                      id="switch-back-wizard"
                    >
                      Aggancia alla Visualizzazione Guidata →
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Consente il ricalcolo istantaneo muovendo qualsiasi parametro di bilancio o debito preventivato.
                  </p>
                </div>

                {/* Sub Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left subgrid: Posizione Debitoria */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono pb-1 border-b border-slate-100 flex items-center justify-between">
                      <span>1. Debito Ristrutturabile</span>
                      <Coins className="h-3.5 w-3.5 text-slate-500" />
                    </h4>

                    <div className="space-y-3.5">
                      <div>
                        <label htmlFor="exp-debitiFornitori" className="block text-xs font-semibold text-slate-700 mb-1">
                          Debiti Fornitori (€)
                        </label>
                        <div className="relative rounded-md shadow-xs">
                          <input
                            type="text"
                            id="exp-debitiFornitori"
                            value={inputs.debitiFornitori || ""}
                            onChange={(e) => handleInputChange("debitiFornitori", e.target.value)}
                            className="block w-full rounded-md border border-slate-250 py-2 pl-3 text-xs focus:border-slate-900 focus:outline-hidden font-mono font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="exp-debitiBancari" className="block text-xs font-semibold text-slate-700 mb-1">
                          Debiti Finanziari/Bancari (€)
                        </label>
                        <div className="relative rounded-md shadow-xs">
                          <input
                            type="text"
                            id="exp-debitiBancari"
                            value={inputs.debitiBancari || ""}
                            onChange={(e) => handleInputChange("debitiBancari", e.target.value)}
                            className="block w-full rounded-md border border-slate-250 py-2 pl-3 text-xs focus:border-slate-900 focus:outline-hidden font-mono font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="exp-debitiFiscali" className="block text-xs font-semibold text-slate-700 mb-1">
                          Debiti Amministrazioni Pubbliche / Erariali (€)
                        </label>
                        <div className="relative rounded-md shadow-xs">
                          <input
                            type="text"
                            id="exp-debitiFiscali"
                            value={inputs.debitiFiscali || ""}
                            onChange={(e) => handleInputChange("debitiFiscali", e.target.value)}
                            className="block w-full rounded-md border border-slate-255 py-2 pl-3 text-xs focus:border-slate-900 focus:outline-hidden font-mono font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-100 p-3 rounded text-xs flex justify-between items-center">
                      <span className="font-semibold text-slate-700">Accumulo Debito Totale:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatEuro(inputs.debitiFornitori + inputs.debitiBancari + inputs.debitiFiscali)}
                      </span>
                    </div>

                  </div>

                  {/* Right subgrid: Flusso di Cassa Caratteristico */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono pb-1 border-b border-slate-100 flex items-center justify-between">
                      <span>2. Profilo Economico Annuale</span>
                      <TrendingUp className="h-3.5 w-3.5 text-slate-500" />
                    </h4>

                    <div className="space-y-3.5">
                      <div>
                        <label htmlFor="exp-fatturatoAnnuo" className="block text-xs font-semibold text-slate-700 mb-1">
                          Fatturato Annuo Stimato (€)
                        </label>
                        <div className="relative rounded-md shadow-xs">
                          <input
                            type="text"
                            id="exp-fatturatoAnnuo"
                            value={inputs.fatturatoAnnuo || ""}
                            onChange={(e) => handleInputChange("fatturatoAnnuo", e.target.value)}
                            className="block w-full rounded-md border border-slate-250 py-2 pl-3 text-xs focus:border-slate-900 focus:outline-hidden font-mono font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="exp-costiOperativi" className="block text-xs font-semibold text-slate-700 mb-1">
                          Costi Operativi Totali di Esercizio (€)
                        </label>
                        <div className="relative rounded-md shadow-xs">
                          <input
                            type="text"
                            id="exp-costiOperativi"
                            value={inputs.costiOperativi || ""}
                            onChange={(e) => handleInputChange("costiOperativi", e.target.value)}
                            className="block w-full rounded-md border border-slate-250 py-2 pl-3 text-xs focus:border-slate-900 focus:outline-hidden font-mono font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    <div className={`p-3 rounded text-xs flex justify-between items-center border ${
                      totalsAndIndicators.baseCashFlow > 0
                        ? "bg-emerald-50 border-emerald-205 text-emerald-900"
                        : "bg-rose-50 border-rose-205 text-rose-900"
                    }`}>
                      <span className="font-semibold">Cash Flow Disponibile:</span>
                      <span className="font-mono font-bold">
                        {formatEuro(totalsAndIndicators.baseCashFlow)}
                      </span>
                    </div>

                  </div>

                </div>

                {/* Info Disclaimer */}
                <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3.5 text-xs flex gap-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Sperimentando con i valori qui sopra, il report e l'indicatore di sostenibilità posizionato nel pannello di destra si aggiorneranno istantaneamente, consentendoti di studiare le variazioni finanziarie necessarie per risanare l'equilibrio aziendale.
                  </p>
                </div>
              </div>

            )}

            {/* WHAT-IF STRATEGIC SIMULATION LABORATORY */}
            <div className="bg-slate-900 text-slate-100 rounded-xl border border-slate-800 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Laboratorio Strategico "What-If" di Risanamento
                  </h3>
                </div>
                <div className="hidden sm:inline-flex items-center gap-1 bg-slate-800 text-[10px] text-slate-400 px-2 py-0.5 rounded font-mono">
                  Misure Correttive CCII
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                In caso di semaforo rosso o giallo, la legge offre strumenti per ristabilire l'equilibrio. Modula i parametri sottostanti per simulare <span className="text-white font-semibold">l'impatto di un accordo d'indebitamento</span> o di un <span className="text-white font-semibold">incremento di redditività caratteristica</span>.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Control 1: Debt Reduction Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-350">Abbattimento Medio Debito (Stralcio / Sconto)</span>
                    <span className="font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                      {debtHaircutPercent}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={debtHaircutPercent}
                    onChange={(e) => setDebtHaircutPercent(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Nessun Accordo (0%)</span>
                    <span>Consigliato (20-30%)</span>
                    <span>Massimo (50%)</span>
                  </div>
                </div>

                {/* Control 2: Cash Flow Optimization Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-350">Miglioramento Redditività (Taglio Costi / +Ricavi)</span>
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                      +{cashFlowOptimPercent}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="5"
                    value={cashFlowOptimPercent}
                    onChange={(e) => setCashFlowOptimPercent(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Stabile (0%)</span>
                    <span>Riorganizzazione (+15%)</span>
                    <span>Ottimale (+30%)</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Post-Simulation Comparison Card */}
              {(debtHaircutPercent > 0 || cashFlowOptimPercent > 0) && (
                <div className="mt-6 p-4 rounded-lg bg-slate-850 border border-slate-800 text-xs">
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2.5">
                    Esito Simulato Post-Manovra
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    
                    <div className="border-r border-slate-800 last:border-0 pr-4 text-left">
                      <div className="text-slate-400">Nuovo Debito</div>
                      <div className="text-sm font-bold font-mono text-amber-400 mt-1">
                        {formatEuro(totalsAndIndicators.adjustedDebt)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Risparmio di {formatEuro(totalsAndIndicators.totalDebt - totalsAndIndicators.adjustedDebt)}
                      </div>
                    </div>

                    <div className="border-r border-slate-800 last:border-0 px-2 text-left">
                      <div className="text-slate-400">Nuovo Cash Flow Annuo</div>
                      <div className="text-sm font-bold font-mono text-emerald-400 mt-1">
                        {formatEuro(totalsAndIndicators.adjustedCashFlow)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Aumento di {formatEuro(totalsAndIndicators.adjustedCashFlow - totalsAndIndicators.baseCashFlow)}
                      </div>
                    </div>

                    <div className="px-2 text-left">
                      <div className="text-slate-400">Nuova Tempistica di Rientro</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-sm font-bold font-mono ${
                          totalsAndIndicators.adjustedVerdictType === "green"
                            ? "text-emerald-400"
                            : totalsAndIndicators.adjustedVerdictType === "yellow"
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}>
                          {totalsAndIndicators.adjustedYears >= 0 
                            ? `${totalsAndIndicators.adjustedYears.toFixed(1)} anni`
                            : "CF Negativo"}
                        </span>
                        
                        <span className={`inline-block h-3 w-3 rounded-full ${
                          totalsAndIndicators.adjustedVerdictType === "green"
                            ? "bg-emerald-500"
                            : totalsAndIndicators.adjustedVerdictType === "yellow"
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`} />
                      </div>
                      <span className="text-[10px] text-slate-500">
                        Precedente: {totalsAndIndicators.baseYears >= 0 ? `${totalsAndIndicators.baseYears.toFixed(1)} anni` : "Negativo"}
                      </span>
                    </div>

                  </div>
                </div>
              )}
            </div>

          </div>

          {/* COLUMN 2: Verdict Sidebar & Action checklist (5 columns) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* REAL-TIME MINI VERDICT OVERVIEW (Visible on Expert View easily) */}
            {viewMode === "expert" && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 space-y-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                  Esito Istantaneo Calcolo
                </span>
                
                <div className={`p-4 rounded-lg flex items-start gap-3.5 border ${
                  totalsAndIndicators.verdictType === "green"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : totalsAndIndicators.verdictType === "yellow"
                    ? "bg-amber-50 border-amber-200 text-amber-900"
                    : "bg-rose-50 border-rose-200 text-rose-900"
                }`}>
                  <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center font-bold text-white ${
                    totalsAndIndicators.verdictType === "green"
                      ? "bg-emerald-500"
                      : totalsAndIndicators.verdictType === "yellow"
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}>
                    !
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">{totalsAndIndicators.verdictText}</h4>
                    <span className="block font-mono font-bold mt-1 text-sm">
                      Tempo stimato di rientro: {totalsAndIndicators.baseYears >= 0 ? `${totalsAndIndicators.baseYears.toFixed(2)} anni` : "N.D. (Flusso Negativo)"}
                    </span>
                  </div>
                </div>

                {/* Miniature Scale Indicator for Expert Side */}
                <div className="h-2 w-full bg-slate-100 rounded-full flex overflow-hidden">
                  <div className="h-full w-[20%] bg-emerald-400" />
                  <div className="h-full w-[30%] bg-amber-400" />
                  <div className="h-full w-[50%] bg-rose-400" />
                </div>
                
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Modifica i parametri del pannello di sinistra per osservare la reattività del semaforo e l'insorgere dei presupposti per la CNC.
                </p>
              </div>
            )}

            {/* PREPARATION & DOCUMENTS CHECKLIST */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-150 bg-slate-50/75">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="h-4.5 w-4.5 text-slate-700" />
                    Kit Documentale Istanza CCII
                  </h3>
                  <span className="font-mono text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {checklistPercentage}% Pronto
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Documenti minimi da raccogliere per presentare l'istanza ufficiale presso la Camera di Commercio.
                </p>

                {/* Micro Progress Bar */}
                <div className="mt-3.5 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-slate-900 transition-all duration-300"
                    style={{ width: `${checklistPercentage}%` }}
                  />
                </div>
              </div>

              {/* Checklist items list */}
              <div className="divide-y divide-slate-100 p-2.5">
                {[
                  { key: "bilanci", title: "Bilanci degli ultimi 3 esercizi", desc: "Corredati da relative note integrative e relazioni sindacali." },
                  { key: "visura", title: "Visura Camerale aggiornata", desc: "Dati corretti con elenco soci e sede legale dell'impresa." },
                  { key: "creditori", title: "Elenco dei creditori analitico", desc: "Indicando scadenze esterne, residui di debito e insoluti." },
                  { key: "pianoRisanamento", title: "Bozza di Piano di Risanamento", desc: "Strategia economica preliminare per la sostenibilità futura." },
                  { key: "debitoTributario", title: "Certificato Unico dei Debiti Tributari", desc: "Rilasciato dall'Agenzia delle Entrate su richiesta dell'imprenditore." },
                  { key: "debitoPrevidenziale", title: "Certificato Debiti INPS e INAIL", desc: "Estratto debitore e situazione contributiva regolare o irregolare (DURC)." },
                  { key: "flussiCassa", title: "Proiezione finanziaria semestrale", desc: "Pianificazione dettagliata delle entrate ed uscite a 6 mesi." },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => toggleChecklist(item.key)}
                    className="w-full text-left p-3 hover:bg-slate-50 transition-all flex items-start gap-3 rounded-lg"
                    id={`chk-btn-${item.key}`}
                  >
                    <div className={`mt-0.5 h-4 w-4 rounded border shrink-0 flex items-center justify-center transition-all ${
                      checklist[item.key]
                        ? "bg-slate-950 border-slate-950 text-white"
                        : "border-slate-300 text-transparent hover:border-slate-400"
                    }`}>
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                    <div>
                      <span className={`block text-xs font-bold ${checklist[item.key] ? "text-slate-950 line-through opacity-60" : "text-slate-850"}`}>
                        {item.title}
                      </span>
                      <span className="block text-[10px] text-slate-500 mt-0.5 leading-normal">
                        {item.desc}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Action notice for checklist completion */}
              {checklistPercentage === 100 && (
                <div className="p-4 bg-emerald-50 border-t border-emerald-200 text-emerald-900 text-xs">
                  <p className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Kit Documentazione Completo!
                  </p>
                  <p className="mt-1 text-emerald-804 leading-relaxed">
                    Hai raccolto tutta la documentazione idonea. Puoi inoltrare la richiesta formale all'organismo camerale competente tramite il portale telematico dedicato.
                  </p>
                </div>
              )}
            </div>

            {/* ACTION CENTER CTAs */}
            <div className="space-y-3.5">
              
              {/* TRIGGER GENERATE REPORT (Modal simulation) */}
              <button
                onClick={() => setShowExportModal(true)}
                className="w-full p-4 bg-slate-950 hover:bg-slate-850 text-white rounded-xl shadow-xs transition-all flex items-center justify-between border border-slate-900 text-xs font-semibold uppercase tracking-wider"
                id="btn-trigger-pdf"
              >
                <span className="flex items-center gap-2">
                  <Printer className="h-4.5 w-4.5 text-amber-400" />
                  Esporta Report di Valutazione
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>

              {/* REDIRECT PLATFORM CARD */}
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-slate-100 p-2.5 rounded-lg text-slate-800 shrink-0">
                    <ExternalLink className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                      Accesso al Portale Camerale
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      L'istanza ufficiale di nomina dell'esperto si effettua telematicamente tramite la piattaforma nazionale e riceve riscontro entro i termini costituzionali dei corpi camerali.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <a
                    href="https://composizionenegoziata.camcom.it"
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all"
                  >
                    Visita Piattaforma Nazionale CNC
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* 4. EXPLANATIVE LEGAL BOX */}
        <section className="mt-10 bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-4xl mx-auto">
          <h3 className="text-base font-bold text-slate-950 tracking-tight flex items-center gap-2 mb-4">
            <Scale className="h-5 w-5 text-slate-700" />
            Inquadramento Giuridico: Art. 12 CCII e il Test di Sostenibilità
          </h3>
          <div className="prose prose-slate text-xs text-slate-600 leading-relaxed grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p>
                La <strong>Composizione Negoziata della Crisi</strong> è un percorso stragiudiziale e volontario istituito dal d.lgs. n. 14/2019 (Codice della Crisi). Consente alle imprese in condizioni di squilibrio patrimoniale o economico-finanziario di perseguire il risanamento con il supporto di un <strong>esperto indipendente</strong> nominato dalla Camera di Commercio.
              </p>
              <p>
                L'indice derivato da questa simulazione ripropone fedelmente il <strong>Test Pratico di Sostenibilità</strong>, il cui scopo è stimare anzitempo il grado di difficoltà del risanamento.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">Interventi correttivi e misure protettive</h4>
              <p>
                Durante l'intero svolgimento delle trattative, l'imprenditore può chiedere l'applicazione di <strong>misure protettive del patrimonio</strong>. Tali misure impediscono ai creditori di avviare azioni esecutive o cautelari individuali sui beni aziendali, offrendo stabilità operativa per rimodulare la pianificazione finanziaria.
              </p>
              <p>
                Se il simulatore indica uno stato di "tensione finanziaria grave", l'avvio tempestivo delle trattative assistite dall'esperto indipendente rappresenta la miglior tutela per evitare l'aggravarsi del quadro debitorio e proteggere il patrimonio aziendale.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* 5. FOOTER */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-2">
          <p className="font-semibold text-slate-700">
            Pre-Check Crisi d'Impresa • Strumento di Simulazione Gratuito e Riservato
          </p>
          <p>
            Ai sensi del Codice della Crisi d'Impresa e dell'Insolvenza (d.lgs. 12 gennaio 2019, n. 14 e s.m.i.)
          </p>
          <p className="max-w-2xl mx-auto opacity-75">
            Nota legale: Questa simulazione non costituisce un parere professionale vincolante né parere legale ufficiale camerale. L'esito ha uno scopo puramente conoscitivo ed esplorativo per facilitare l'autodiagnosi dell'imprenditore prima dell'interpello dei professionisti abilitati.
          </p>
        </div>
      </footer>


      {/* 6. MODAL: REPORT EXPORT SIMULATION */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs" id="export-modal-backdrop">
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full overflow-hidden"
              id="export-modal-card"
            >
              
              {/* Header */}
              <div className="bg-slate-950 text-white p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-amber-400 font-mono font-medium block">
                    Esportazione Ufficiale Relazione
                  </span>
                  <h3 className="text-sm font-bold">Documento di Diagnosi ed Autocertificazione Preliminare</h3>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-slate-400 hover:text-white font-bold text-lg"
                  id="close-modal-btn"
                >
                  ✕
                </button>
              </div>

              {/* Simulated PDF Document Body */}
              <div className="p-6 space-y-6" id="printable-report-body">
                
                {/* Header Letterhead */}
                <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      CAMERA DI COMMERCIO, INDUSTRIA, ARTIGIANATO E AGRICOLTURA
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Sportello Autodiagnosi Previdenziale e Crisi d'Impresa
                    </p>
                  </div>
                  <div className="text-right text-[9px] font-mono text-slate-400">
                    Generato il: 10 Giugno 2026<br/>
                    Stato: Anonimo
                  </div>
                </div>

                {/* Subtitle */}
                <div className="text-center">
                  <h2 className="text-base font-bold text-slate-950 underline decoration-slate-300 decoration-2 underline-offset-4">
                    RELAZIONE DEL TEST PRATICO DI SOSTENIBILITÀ ECONOMICA
                  </h2>
                  <p className="text-[10px] font-mono text-slate-500 mt-1">
                    Redatto ai sensi dell'Allegato al Decreto Dirigenziale Ministero della Giustizia
                  </p>
                </div>

                {/* SECTION 1: DATI ECONOMICI */}
                <div>
                  <h5 className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider bg-slate-100 px-2 py-1 mb-2 font-mono">
                    1. Riepilogo Indicatori Economico-Finanziari Dichiarati
                  </h5>
                  
                  <table className="w-full text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-205 text-left text-slate-500 font-mono">
                        <th className="py-1.5 font-medium">Voce di Bilancio Corrente</th>
                        <th className="py-1.5 text-right font-medium">Importo (€)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      <tr>
                        <td className="py-1.5 text-slate-700">Debiti verso Fornitori scaduti</td>
                        <td className="py-1.5 text-right">{formatEuro(inputs.debitiFornitori)}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-slate-700">Debiti verso Banche ed Istituti di Credito</td>
                        <td className="py-1.5 text-right">{formatEuro(inputs.debitiBancari)}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-slate-700">Debiti Erariali, Previdenziali ed Enti Pubblici</td>
                        <td className="py-1.5 text-right">{formatEuro(inputs.debitiFiscali)}</td>
                      </tr>
                      <tr className="font-bold text-slate-950">
                        <td className="py-2">DEBITO TOTALE DA RISTRUTTURARE (D)</td>
                        <td className="py-2 text-right">{formatEuro(totalsAndIndicators.totalDebt)}</td>
                      </tr>
                      <tr className="border-t border-slate-300">
                        <td className="py-1.5 text-slate-700">Fatturato Annuo Previsto/Caratteristico</td>
                        <td className="py-1.5 text-right">{formatEuro(inputs.fatturatoAnnuo)}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-slate-700">Costi Operativi di Gestione Corrente</td>
                        <td className="py-1.5 text-right">{formatEuro(inputs.costiOperativi)}</td>
                      </tr>
                      <tr className="font-bold text-slate-950">
                        <td className="py-2">FLUSSO DI CASSA ANNUO ESTIMATO (CF)</td>
                        <td className="py-2 text-right">{formatEuro(totalsAndIndicators.baseCashFlow)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* SECTION 2: VERDICT */}
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-205">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                      2. Calcolo Indice e Verdetto Sostenibilità
                    </span>
                    <span className={`inline-block h-3 w-3 rounded-full ${
                      totalsAndIndicators.verdictType === "green"
                        ? "bg-emerald-500"
                        : totalsAndIndicators.verdictType === "yellow"
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`} />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-slate-500 font-mono text-[10px]">INDICE DI SOSTENIBILITÀ (Anni necessari)</div>
                      <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                        {totalsAndIndicators.baseYears >= 0 
                          ? `${totalsAndIndicators.baseYears.toFixed(2)} Anni`
                          : "Cash Flow Negativo"}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-mono text-[10px]">SEMAFORO DIAGNOSTICA</div>
                      <div className="text-xs font-bold text-slate-900 mt-1">
                        {totalsAndIndicators.verdictText}
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-550 leading-relaxed mt-3 pt-3 border-t border-slate-150">
                    <strong className="text-slate-800">Definizione Matematica applicata:</strong> {totalsAndIndicators.descriptionText}
                  </p>
                </div>

                {/* SECTION 3: WHAT-IF PREDICTIONS IF SLIDERS APPLIED */}
                {(debtHaircutPercent > 0 || cashFlowOptimPercent > 0) && (
                  <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 font-mono block mb-1">
                      3. Diagnostica Correttiva Simulata (Scenario Futuro Proposto)
                    </span>
                    <p className="text-[10px] text-slate-600 leading-normal">
                      Applicando un abbattimento del debito del <span className="font-medium text-slate-900">{debtHaircutPercent}%</span> e ottimizzando i flussi finanziari di esercizio del <span className="font-medium text-slate-900">+{cashFlowOptimPercent}%</span>, l'indice di sostenibilità post-manovra scende a <span className="font-bold text-slate-900">{totalsAndIndicators.adjustedYears.toFixed(2)} anni</span> con classificazione <span className="font-bold">{totalsAndIndicators.adjustedVerdictType === "green" ? "Verde" : "Gialla"}</span>.
                    </p>
                  </div>
                )}

                {/* Signature placeholders */}
                <div className="pt-8 border-t border-slate-150 flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <div className="text-center">
                    ____________________________<br/>
                    Firma del Rappresentante Legale
                  </div>
                  <div className="text-center">
                    ____________________________<br/>
                    Visto del Consulente d'Impresa
                  </div>
                </div>

              </div>

              {/* Action Buttons footer */}
              <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end gap-3 text-xs font-semibold">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md transition-all"
                  id="btn-dismiss-export-modal"
                >
                  Annulla
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-white rounded-md transition-all flex items-center gap-1.5"
                  id="btn-print-action"
                >
                  <Printer className="h-4 w-4" />
                  Stampa o Salva PDF
                </button>
              </div>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
