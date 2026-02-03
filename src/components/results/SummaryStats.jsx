import { formatEuro } from '../../utils/formatters';
import { TOTAL_BUDGET } from '../../engine/constants';

export function SummaryStats({ baselineResults, scenarioResults, selectedMunicipality }) {
  if (!scenarioResults.length) return null;

  const totalPaid = scenarioResults.reduce((sum, r) => sum + r.paid, 0);
  const totalCalculated = scenarioResults.reduce((sum, r) => sum + r.calculated, 0);

  const standstillCount = scenarioResults.filter(r => r.status === 'standstill').length;
  const cappedCount = scenarioResults.filter(r => r.status === 'capped').length;
  const normalCount = scenarioResults.filter(r => r.status === 'normal').length;

  // Calculate change for selected municipality
  let selectedChange = null;
  if (selectedMunicipality) {
    const baseline = baselineResults.find(r => r.id === selectedMunicipality);
    const scenario = scenarioResults.find(r => r.id === selectedMunicipality);
    if (baseline && scenario) {
      selectedChange = {
        name: scenario.name,
        baselineCalculated: baseline.calculated,
        scenarioCalculated: scenario.calculated,
        change: scenario.calculated - baseline.calculated,
        changePercent: ((scenario.calculated - baseline.calculated) / baseline.calculated) * 100,
      };
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Summary / Résumé
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Budget</p>
          <p className="text-lg font-bold text-gray-900">{formatEuro(TOTAL_BUDGET)}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Calculated</p>
          <p className="text-lg font-bold text-gray-900">{formatEuro(totalCalculated)}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Paid</p>
          <p className="text-lg font-bold text-gray-900">{formatEuro(totalPaid)}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Status Distribution</p>
          <p className="text-sm">
            <span className="text-green-600">{normalCount} normal</span>
            {' / '}
            <span className="text-yellow-600">{standstillCount} standstill</span>
            {' / '}
            <span className="text-blue-600">{cappedCount} capped</span>
          </p>
        </div>
      </div>

      {selectedChange && (
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Impact on {selectedChange.name}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500">Baseline Calculated</p>
              <p className="text-md font-semibold">{formatEuro(selectedChange.baselineCalculated)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Scenario Calculated</p>
              <p className="text-md font-semibold">{formatEuro(selectedChange.scenarioCalculated)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Change</p>
              <p className={`text-md font-semibold ${selectedChange.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {selectedChange.change >= 0 ? '+' : ''}{formatEuro(selectedChange.change)}
                {' '}
                ({selectedChange.changePercent >= 0 ? '+' : ''}{selectedChange.changePercent.toFixed(2)}%)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
