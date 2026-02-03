import { formatEuro } from '../../utils/formatters';
import { TOTAL_BUDGET } from '../../engine/constants';

export function SummaryCards({ scenarioResults }) {
  if (!scenarioResults.length) return null;

  const totalPaid = scenarioResults.reduce((sum, r) => sum + r.paid, 0);
  const blocked = TOTAL_BUDGET - totalPaid;

  const standstillCount = scenarioResults.filter(r => r.status === 'standstill').length;
  const cappedCount = scenarioResults.filter(r => r.status === 'capped').length;
  const normalCount = scenarioResults.filter(r => r.status === 'normal').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Total Envelope */}
      <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
          Total Envelope (Communes)
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Enveloppe totale / Totale enveloppe
        </p>
        <p className="text-2xl font-bold text-gray-900 mt-2">
          {formatEuro(TOTAL_BUDGET)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Budget available for redistribution
        </p>
      </div>

      {/* Total Paid */}
      <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-green-500">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
          Total Paid (After Mechanisms)
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Total versé / Totaal betaald
        </p>
        <p className="text-2xl font-bold text-gray-900 mt-2">
          {formatEuro(totalPaid)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Amount actually distributed this year
        </p>
      </div>

      {/* Blocked by Mechanisms */}
      <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-orange-500">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
          Blocked by Caps & Standstill
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Bloqué par plafonds / Geblokkeerd
        </p>
        <p className="text-2xl font-bold text-gray-900 mt-2">
          {formatEuro(blocked)}
        </p>
        <div className="flex gap-3 mt-2 text-xs">
          <span className="text-green-600 font-medium">{normalCount} normal</span>
          <span className="text-gray-500 font-medium">{standstillCount} standstill</span>
          <span className="text-orange-600 font-medium">{cappedCount} capped</span>
        </div>
      </div>
    </div>
  );
}
