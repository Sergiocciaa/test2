import React from "react";
import { VerdictType } from "../types/crisis";

interface SustainabilityScaleProps {
  years: number | null;
  verdictType: VerdictType;
  cashFlow: number;
}

export const SustainabilityScale: React.FC<SustainabilityScaleProps> = ({
  years,
  verdictType,
  cashFlow,
}) => {
  const pointerLeftPercent =
    years !== null ? Math.min(96, Math.max(4, (years / 10) * 100)) : 50;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 font-mono">
          Posizione nella scala di sostenibilità
        </h4>
        <span className="text-xs font-mono tabular-nums font-semibold text-slate-900">
          {verdictType === "empty"
            ? "—"
            : years !== null
            ? `${years.toFixed(1)} ${years === 1 ? "anno" : "anni"}`
            : "Flusso negativo"}
        </span>
      </div>

      {/* Labels row */}
      <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-slate-500 font-mono tabular-nums">
        <span>0 anni</span>
        <span>Verde (≤ 2)</span>
        <span>Giallo (2–5)</span>
        <span>Rosso (&gt; 5)</span>
      </div>

      {/* Bar + Marker */}
      <div className="relative pb-7">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-[20%] bg-emerald-600" />
          <div className="h-full w-[30%] bg-amber-500" />
          <div className="h-full w-[50%] bg-rose-600" />
        </div>

        {verdictType !== "empty" && (
          <div
            className="absolute top-2 -translate-x-1/2 flex flex-col items-center transition-all duration-200"
            style={{ left: `${years !== null ? pointerLeftPercent : 78}%` }}
          >
            <div
              className={`h-3 w-3 rotate-45 border-2 border-white shadow-xs ${
                cashFlow <= 0 && years === null ? "bg-rose-700" : "bg-slate-900"
              }`}
            />
            <span
              className={`mt-1 whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-semibold text-white font-mono tabular-nums shadow-xs ${
                cashFlow <= 0 && years === null ? "bg-rose-700" : "bg-slate-900"
              }`}
            >
              {years !== null
                ? `${years.toFixed(1)} ${years === 1 ? "anno" : "anni"}`
                : "Flusso di cassa ≤ 0"}
            </span>
          </div>
        )}
      </div>

      <p className="mt-2 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-600">
        Formula applicata:{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-semibold text-slate-900">
          Debito Totale / Flusso di Cassa Annuo
        </code>
        . Stima gli anni necessari per assorbire l'indebitamento destinando l'intero autofinanziamento operativo.
      </p>
    </div>
  );
};
