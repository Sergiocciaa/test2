import {
  ChecklistItemDef,
  FinancialState,
  ScenarioPreset,
  SustainabilityMetrics,
  VerdictType,
} from "../types/crisis";

export const EMPTY_FINANCIAL_STATE: FinancialState = {
  debitiFornitori: 0,
  debitiBancari: 0,
  debitiFiscali: 0,
  fatturatoAnnuo: 0,
  costiOperativi: 0,
};

export const DEFAULT_FINANCIAL_STATE: FinancialState = {
  debitiFornitori: 120000,
  debitiBancari: 250000,
  debitiFiscali: 80000,
  fatturatoAnnuo: 1200000,
  costiOperativi: 1080000,
};

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: "pmi-manifatturiera",
    name: "PMI Manifatturiera",
    tag: "Squilibrio temporaneo",
    description:
      "Fatturato solido con accumulo di debiti post-emergenza. Flusso positivo ma rientro pluriennale.",
    data: {
      debitiFornitori: 110000,
      debitiBancari: 240000,
      debitiFiscali: 100000,
      fatturatoAnnuo: 1300000,
      costiOperativi: 1180000,
    },
  },
  {
    id: "ristorazione-servizi",
    name: "Ristorazione & Servizi",
    tag: "Tensione finanziaria grave",
    description:
      "Margini compressi dai costi operativi e forte esposizione fiscale e bancaria.",
    data: {
      debitiFornitori: 80000,
      debitiBancari: 140000,
      debitiFiscali: 130000,
      fatturatoAnnuo: 480000,
      costiOperativi: 445000,
    },
  },
  {
    id: "societa-artigiana",
    name: "Società Artigiana",
    tag: "Situazione in equilibrio",
    description:
      "Piccola impresa con indebitamento contenuto e buona capacità di autofinanziamento.",
    data: {
      debitiFornitori: 25000,
      debitiBancari: 45000,
      debitiFiscali: 15000,
      fatturatoAnnuo: 350000,
      costiOperativi: 295000,
    },
  },
];

export const CCII_CHECKLIST_ITEMS: ChecklistItemDef[] = [
  {
    key: "bilanci",
    title: "Bilanci degli ultimi 3 esercizi",
    description: "Corredati da note integrative e relazioni degli organi di controllo, se presenti.",
  },
  {
    key: "visura",
    title: "Visura camerale aggiornata",
    description: "Dati anagrafici, compagine sociale, amministratori e sede legale.",
  },
  {
    key: "creditori",
    title: "Elenco analitico dei creditori",
    description: "Dettaglio di importi scaduti, a scadere e relative garanzie o privilegi.",
  },
  {
    key: "pianoRisanamento",
    title: "Progetto di piano di risanamento",
    description: "Linee guida industriali e finanziarie per il riequilibrio aziendale.",
  },
  {
    key: "debitoTributario",
    title: "Certificato unico dei debiti tributari",
    description: "Rilasciato dall'Agenzia delle Entrate ai sensi dell'art. 364 del Codice della Crisi.",
  },
  {
    key: "debitoPrevidenziale",
    title: "Certificato dei debiti INPS e INAIL",
    description: "Situazione contributiva aggiornata ed estratto delle posizioni debitorie.",
  },
  {
    key: "flussiCassa",
    title: "Piano finanziario a 6 mesi",
    description: "Previsione dettagliata delle entrate e delle uscite di cassa semestrali.",
  },
];

function classifyRatio(
  totalDebt: number,
  cashFlow: number,
  hasAnyData: boolean
): {
  years: number | null;
  verdictType: VerdictType;
  verdictLabel: string;
  verdictTitle: string;
  verdictDescription: string;
} {
  if (!hasAnyData) {
    return {
      years: null,
      verdictType: "empty",
      verdictLabel: "Dati non inseriti",
      verdictTitle: "Inserisci i parametri economici per avviare il test",
      verdictDescription:
        "Compila almeno i debiti e i flussi annuali oppure carica uno degli scenari di esempio per ottenere la diagnosi preliminare.",
    };
  }

  if (totalDebt === 0 && cashFlow >= 0) {
    return {
      years: 0,
      verdictType: "green",
      verdictLabel: "Semaforo Verde",
      verdictTitle: "Semaforo Verde: Assenza di debito critico",
      verdictDescription:
        "Non risultano debiti da ristrutturare a fronte di un margine operativo non negativo. La posizione finanziaria appare equilibrata.",
    };
  }

  if (cashFlow <= 0) {
    return {
      years: null,
      verdictType: "red",
      verdictLabel: "Semaforo Rosso",
      verdictTitle: "Semaforo Rosso: Tensione finanziaria grave",
      verdictDescription:
        "Il flusso di cassa annuo stimato è nullo o negativo. L'attività operativa non genera liquidità per assorbire l'indebitamento accumulato: è prioritario intervenire sui margini e valutare l'accesso alle misure protettive.",
    };
  }

  const years = totalDebt / cashFlow;

  if (years <= 2) {
    return {
      years,
      verdictType: "green",
      verdictLabel: "Semaforo Verde",
      verdictTitle: "Semaforo Verde: Situazione gestibile",
      verdictDescription:
        "Il debito complessivo è teoricamente riassorbibile entro 2 anni tramite i flussi di cassa operativi annui. La gestione ordinaria consente il rientro senza squilibri strutturali.",
    };
  }

  if (years <= 5) {
    return {
      years,
      verdictType: "yellow",
      verdictLabel: "Semaforo Giallo",
      verdictTitle: "Semaforo Giallo: Squilibrio finanziario",
      verdictDescription:
        "Il tempo teorico di rientro è compreso tra 2 e 5 anni. L'impresa presenta uno squilibrio gestibile ma strutturale: sussistono le condizioni tipiche per valutare la Composizione Negoziata della Crisi.",
    };
  }

  return {
    years,
    verdictType: "red",
    verdictLabel: "Semaforo Rosso",
    verdictTitle: "Semaforo Rosso: Tensione finanziaria grave",
    verdictDescription:
      "Il rientro dal debito richiede oltre 5 anni di flussi operativi integrali. L'esposizione rischia di compromettere la continuità aziendale se non accompagnata da una manovra correttiva e da accordi con i creditori.",
  };
}

export function calculateSustainability(
  inputs: FinancialState,
  debtHaircutPercent: number,
  cashFlowOptimPercent: number
): SustainabilityMetrics {
  const totalDebt = Math.max(
    0,
    inputs.debitiFornitori + inputs.debitiBancari + inputs.debitiFiscali
  );
  const baseCashFlow = inputs.fatturatoAnnuo - inputs.costiOperativi;
  const hasAnyData =
    totalDebt > 0 || inputs.fatturatoAnnuo > 0 || inputs.costiOperativi > 0;

  const base = classifyRatio(totalDebt, baseCashFlow, hasAnyData);

  const adjustedDebt = Math.max(0, totalDebt * (1 - debtHaircutPercent / 100));
  const adjustedCashFlow =
    baseCashFlow > 0
      ? baseCashFlow * (1 + cashFlowOptimPercent / 100)
      : baseCashFlow + Math.abs(inputs.fatturatoAnnuo) * (cashFlowOptimPercent / 100) * 0.25;

  const adjusted = classifyRatio(adjustedDebt, adjustedCashFlow, hasAnyData);

  return {
    totalDebt,
    baseCashFlow,
    baseYears: base.years,
    verdictType: base.verdictType,
    verdictLabel: base.verdictLabel,
    verdictTitle: base.verdictTitle,
    verdictDescription: base.verdictDescription,
    adjustedDebt,
    adjustedCashFlow,
    adjustedYears: adjusted.years,
    adjustedVerdictType: adjusted.verdictType,
    adjustedVerdictLabel: adjusted.verdictLabel,
  };
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatIntegerInput(value: number): string {
  if (!value) return "";
  return new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatItalianDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
