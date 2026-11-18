import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Download, Printer, X } from "lucide-react";
import { FinancialState, SustainabilityMetrics } from "../types/crisis";
import {
  CCII_CHECKLIST_ITEMS,
  formatEuro,
  formatItalianDate,
} from "../utils/financialEngine";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: FinancialState;
  metrics: SustainabilityMetrics;
  debtHaircutPercent: number;
  cashFlowOptimPercent: number;
  checklist: Record<string, boolean>;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  inputs,
  metrics,
  debtHaircutPercent,
  cashFlowOptimPercent,
  checklist,
}) => {
  const generatedDate = formatItalianDate(new Date());
  const completedDocs = CCII_CHECKLIST_ITEMS.filter((item) => checklist[item.key]).length;
  const totalDocs = CCII_CHECKLIST_ITEMS.length;
  const hasWhatIf = debtHaircutPercent > 0 || cashFlowOptimPercent > 0;

  const handleDownloadCsv = () => {
    const rows = [
      ["Parametro", "Valore"],
      ["Data simulazione", generatedDate],
      ["Debiti verso Fornitori (EUR)", String(inputs.debitiFornitori)],
      ["Debiti Bancari e Finanziari (EUR)", String(inputs.debitiBancari)],
      ["Debiti Fiscali e Previdenziali (EUR)", String(inputs.debitiFiscali)],
      ["Debito Totale da Ristrutturare (EUR)", String(metrics.totalDebt)],
      ["Fatturato Annuo Stimato (EUR)", String(inputs.fatturatoAnnuo)],
      ["Costi Operativi Annuali (EUR)", String(inputs.costiOperativi)],
      ["Flusso di Cassa Annuo Stimato (EUR)", String(metrics.baseCashFlow)],
      [
        "Indice di Sostenibilità (Anni)",
        metrics.baseYears !== null ? metrics.baseYears.toFixed(2) : "Flusso negativo o N.D.",
      ],
      ["Esito Diagnostico", metrics.verdictTitle],
      ["Abbattimento Debito What-If (%)", String(debtHaircutPercent)],
      ["Ottimizzazione Flussi What-If (%)", String(cashFlowOptimPercent)],
      [
        "Indice Post-Manovra (Anni)",
        metrics.adjustedYears !== null
          ? metrics.adjustedYears.toFixed(2)
          : "Flusso negativo o N.D.",
      ],
      ["Classificazione Post-Manovra", metrics.adjustedVerdictLabel],
      ["Documenti CCII Pronti", `${completedDocs}/${totalDocs}`],
    ];

    const csvContent =
      "\uFEFF" +
      rows
        .map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pre-check-crisi-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const ReportDocumentContent = () => (
    <div className="space-y-6 text-slate-900">
      {/* Letterhead */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-slate-900 pb-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-slate-900">
            Pre-Check Crisi · Test Pratico di Sostenibilità Economica
          </h4>
          <p className="mt-0.5 font-mono text-[11px] text-slate-500">
            Autodiagnosi preliminare ai sensi del Codice della Crisi d'Impresa (d.lgs. 14/2019)
          </p>
        </div>
        <div className="text-right font-mono text-[11px] text-slate-500">
          <div>Generato il: {generatedDate}</div>
          <div>Modalità: Locale e anonima</div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center">
        <h2 className="text-base font-bold tracking-tight text-slate-950">
          RELAZIONE DI SOSTENIBILITÀ ECONOMICO-FINANZIARIA
        </h2>
        <p className="mt-1 font-mono text-[11px] text-slate-500">
          Rapporto tra indebitamento ristrutturabile e flussi operativi annui al servizio del debito
        </p>
      </div>

      {/* Section 1: Data table */}
      <div>
        <h5 className="mb-2 bg-slate-100 px-2.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-900">
          1. Riepilogo Dati Economico-Finanziari Dichiarati
        </h5>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left font-mono text-slate-500">
              <th className="py-1.5 font-medium">Voce</th>
              <th className="py-1.5 text-right font-medium">Importo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
            <tr>
              <td className="py-1.5 font-sans text-slate-700">Debiti verso fornitori scaduti</td>
              <td className="py-1.5 text-right">{formatEuro(inputs.debitiFornitori)}</td>
            </tr>
            <tr>
              <td className="py-1.5 font-sans text-slate-700">
                Debiti bancari e finanziari
              </td>
              <td className="py-1.5 text-right">{formatEuro(inputs.debitiBancari)}</td>
            </tr>
            <tr>
              <td className="py-1.5 font-sans text-slate-700">
                Debiti fiscali e previdenziali (AdE, INPS, INAIL)
              </td>
              <td className="py-1.5 text-right">{formatEuro(inputs.debitiFiscali)}</td>
            </tr>
            <tr className="bg-slate-50 font-bold text-slate-950">
              <td className="py-2 font-sans">Debito totale da ristrutturare (A)</td>
              <td className="py-2 text-right">{formatEuro(metrics.totalDebt)}</td>
            </tr>
            <tr className="border-t border-slate-300">
              <td className="py-1.5 font-sans text-slate-700">Fatturato annuo stimato</td>
              <td className="py-1.5 text-right">{formatEuro(inputs.fatturatoAnnuo)}</td>
            </tr>
            <tr>
              <td className="py-1.5 font-sans text-slate-700">
                Costi operativi annuali di gestione
              </td>
              <td className="py-1.5 text-right">{formatEuro(inputs.costiOperativi)}</td>
            </tr>
            <tr className="bg-slate-50 font-bold text-slate-950">
              <td className="py-2 font-sans">Flusso di cassa annuo stimato (B)</td>
              <td className="py-2 text-right">{formatEuro(metrics.baseCashFlow)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 2: Verdict */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-600">
            2. Calcolo Indice e Verdetto di Sostenibilità
          </span>
          <span
            className={`font-mono text-[11px] font-bold ${
              metrics.verdictType === "green"
                ? "text-emerald-700"
                : metrics.verdictType === "yellow"
                ? "text-amber-700"
                : metrics.verdictType === "red"
                ? "text-rose-700"
                : "text-slate-600"
            }`}
          >
            {metrics.verdictLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
          <div>
            <div className="font-mono text-[11px] text-slate-500">
              INDICE DI SOSTENIBILITÀ (A / B)
            </div>
            <div className="mt-0.5 font-mono tabular-nums text-lg font-bold text-slate-950">
              {metrics.verdictType === "empty"
                ? "N.D."
                : metrics.baseYears !== null
                ? `${metrics.baseYears.toFixed(2)} anni`
                : "Flusso negativo"}
            </div>
          </div>
          <div>
            <div className="font-mono text-[11px] text-slate-500">ESITO VALUTAZIONE</div>
            <div className="mt-1 text-xs font-bold text-slate-900">
              {metrics.verdictTitle}
            </div>
          </div>
        </div>

        <p className="mt-3 border-t border-slate-200 pt-3 text-xs leading-relaxed text-slate-600">
          {metrics.verdictDescription}
        </p>
      </div>

      {/* Section 3: What-If (only if applied) */}
      {hasWhatIf && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-4">
          <span className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-wider text-amber-900">
            3. Scenario Correttivo Simulato (What-If)
          </span>
          <p className="text-xs leading-relaxed text-slate-700">
            Applicando un abbattimento del debito del{" "}
            <strong className="font-mono">{debtHaircutPercent}%</strong> (nuovo debito:{" "}
            <strong className="font-mono">{formatEuro(metrics.adjustedDebt)}</strong>) e un
            miglioramento dei flussi operativi del{" "}
            <strong className="font-mono">+{cashFlowOptimPercent}%</strong> (nuovo flusso:{" "}
            <strong className="font-mono">{formatEuro(metrics.adjustedCashFlow)}</strong>),
            l'esito post-manovra risulta{" "}
            <strong className="font-mono">
              {metrics.adjustedYears !== null
                ? `${metrics.adjustedYears.toFixed(2)} anni`
                : "Flusso di cassa ancora negativo"}
            </strong>{" "}
            con classificazione <strong>{metrics.adjustedVerdictLabel}</strong>.
          </p>
        </div>
      )}

      {/* Section 4: Checklist state */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-600">
        <span>Stato raccolta Kit Documentale CCII</span>
        <span className="font-mono tabular-nums font-semibold text-slate-900">
          {completedDocs} su {totalDocs} documenti verificati
        </span>
      </div>

      {/* Legal note */}
      <p className="border-t border-slate-200 pt-3 text-[11px] leading-relaxed text-slate-500">
        Nota: Il presente prospetto è generato interamente in locale dal simulatore a scopo informativo preliminare e non sostituisce il parere di professionisti abilitati né la verifica ufficiale sulla piattaforma della Camera di Commercio.
      </p>
    </div>
  );

  return (
    <>
      {/* Dedicated printable A4 view (visible only during print) */}
      <div className="hidden print:block" id="printable-report-sheet">
        <ReportDocumentContent />
      </div>

      {/* Interactive Modal (hidden during print) */}
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs print:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-modal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.16 }}
              className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between bg-slate-950 px-5 py-4 text-white">
                <div>
                  <span className="block font-mono text-[11px] font-medium uppercase tracking-wider text-amber-400">
                    Esportazione Relazione
                  </span>
                  <h3 id="report-modal-title" className="text-sm font-bold">
                    Documento di Diagnosi Preliminare
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Chiudi finestra esportazione"
                  className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              {/* Scrollable preview */}
              <div className="max-h-[70vh] overflow-y-auto p-6">
                <ReportDocumentContent />
              </div>

              {/* Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 text-xs font-semibold">
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <Download className="h-4 w-4 text-slate-600" aria-hidden="true" />
                  Scarica CSV
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg bg-slate-200 px-4 py-2 text-slate-800 hover:bg-slate-300 transition-colors"
                  >
                    Chiudi
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    id="btn-print-action"
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-white hover:bg-slate-800 transition-colors"
                  >
                    <Printer className="h-4 w-4 text-amber-400" aria-hidden="true" />
                    Stampa o Salva PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
