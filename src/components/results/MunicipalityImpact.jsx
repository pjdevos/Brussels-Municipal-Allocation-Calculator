import { formatEuro } from '../../utils/formatters';

function getStatusExplanation(status, calculated, paid) {
  if (status === 'capped') {
    return `Growth is limited to +4% per year. The calculated amount (${formatEuro(calculated)}) exceeds the cap.`;
  }
  if (status === 'standstill') {
    return `Protected by standstill mechanism. The calculated amount (${formatEuro(calculated)}) is below the guaranteed floor.`;
  }
  return 'Receives the full calculated amount with no mechanism adjustment.';
}

function getStatusBgColor(status) {
  if (status === 'capped') return 'bg-orange-50 border-orange-200 text-orange-800';
  if (status === 'standstill') return 'bg-gray-50 border-gray-200 text-gray-700';
  return 'bg-green-50 border-green-200 text-green-800';
}

function formatDelta(value) {
  if (value === 0) return '0 €';
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatEuro(value)}`;
}

function formatDeltaPercent(value) {
  if (value === 0) return '0%';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function MunicipalityImpact({ baselineResults, scenarioResults, selectedMunicipality }) {
  if (!selectedMunicipality || !baselineResults.length || !scenarioResults.length) {
    return null;
  }

  const baseline = baselineResults.find(r => r.id === selectedMunicipality);
  const scenario = scenarioResults.find(r => r.id === selectedMunicipality);

  if (!baseline || !scenario) return null;

  const calcDelta = scenario.calculated - baseline.calculated;
  const calcDeltaPercent = baseline.calculated !== 0
    ? (calcDelta / baseline.calculated) * 100
    : 0;

  const paidDelta = scenario.paid - baseline.paid;
  const paidDeltaPercent = baseline.paid !== 0
    ? (paidDelta / baseline.paid) * 100
    : 0;

  return (
    <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl shadow-md mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Impact on {scenario.name}
        <span className="text-sm font-normal text-gray-500 ml-2">
          / Impact sur / Impact op
        </span>
      </h3>

      {/* Calculated (Formula) */}
      <div className="mb-4 p-4 bg-white rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          CALCULATED (FORMULA)
          <span className="text-xs font-normal text-gray-500 ml-2">
            Calculé (formule) / Berekend (formule)
          </span>
        </h4>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500 mb-1">Baseline</p>
            <p className="font-semibold">{formatEuro(baseline.calculated)}</p>
          </div>
          <div className="flex items-center justify-center text-gray-400">
            →
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Scenario</p>
            <p className="font-semibold">{formatEuro(scenario.calculated)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Δ Change</p>
            <p className="font-semibold text-gray-700">
              {formatDelta(calcDelta)}
              <span className="text-xs ml-1">({formatDeltaPercent(calcDeltaPercent)})</span>
            </p>
          </div>
        </div>
      </div>

      {/* Paid (After Mechanism) */}
      <div className="mb-4 p-4 bg-white rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          PAID (AFTER MECHANISM)
          <span className="text-xs font-normal text-gray-500 ml-2">
            Versé (après mécanisme) / Betaald (na mechanisme)
          </span>
        </h4>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500 mb-1">Baseline</p>
            <p className="font-semibold">{formatEuro(baseline.paid)}</p>
          </div>
          <div className="flex items-center justify-center text-gray-400">
            →
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Scenario</p>
            <p className="font-semibold">{formatEuro(scenario.paid)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Δ Change</p>
            <p className={`font-semibold ${scenario.status === 'normal' ? 'text-green-700' : 'text-gray-700'}`}>
              {formatDelta(paidDelta)}
              <span className="text-xs ml-1">({formatDeltaPercent(paidDeltaPercent)})</span>
            </p>
          </div>
        </div>
      </div>

      {/* Status Explanation */}
      <div className={`text-sm p-4 rounded-lg border ${getStatusBgColor(scenario.status)}`}>
        <div className="flex items-start gap-2">
          <span className="text-lg">
            {scenario.status === 'normal' ? '✓' : '⚠️'}
          </span>
          <div>
            <p className="font-semibold">
              Mechanism: {scenario.status.toUpperCase()}
            </p>
            <p className="mt-1 text-sm opacity-90">
              {getStatusExplanation(scenario.status, scenario.calculated, scenario.paid)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
