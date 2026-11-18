export type VerdictType = "green" | "yellow" | "red" | "empty";

export type ViewMode = "wizard" | "expert";

export interface FinancialState {
  debitiFornitori: number;
  debitiBancari: number;
  debitiFiscali: number;
  fatturatoAnnuo: number;
  costiOperativi: number;
}

export interface ScenarioPreset {
  id: string;
  name: string;
  tag: string;
  description: string;
  data: FinancialState;
}

export interface SustainabilityMetrics {
  totalDebt: number;
  baseCashFlow: number;
  baseYears: number | null;
  verdictType: VerdictType;
  verdictLabel: string;
  verdictTitle: string;
  verdictDescription: string;
  adjustedDebt: number;
  adjustedCashFlow: number;
  adjustedYears: number | null;
  adjustedVerdictType: VerdictType;
  adjustedVerdictLabel: string;
}

export interface ChecklistItemDef {
  key: string;
  title: string;
  description: string;
}
