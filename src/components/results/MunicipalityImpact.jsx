import { formatEuro } from '../../utils/formatters';
import { StatusBadge } from './StatusBadge';
import { useLanguage } from '../../i18n/LanguageContext';

function formatDelta(value) {
  if (value === 0) return '0 €';
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatEuro(value)}`;
}

export function MunicipalityImpact({ baselineResults, scenarioResults, selectedMunicipality }) {
  const { t, getMunicipalityName } = useLanguage();

  if (!selectedMunicipality || !baselineResults.length || !scenarioResults.length) {
    return null;
  }

  const baseline = baselineResults.find(r => r.id === selectedMunicipality);
  const scenario = scenarioResults.find(r => r.id === selectedMunicipality);

  if (!baseline || !scenario) return null;

  const calcDelta = scenario.calculated - baseline.calculated;
  const paidDelta = scenario.paid - baseline.paid;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('impact_on')} {getMunicipalityName(scenario)}
      </h3>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left pb-3 font-medium text-gray-500"></th>
            <th className="text-right pb-3 font-medium text-gray-500">{t('baseline')}</th>
            <th className="text-right pb-3 font-medium text-gray-500">{t('scenario')}</th>
            <th className="text-right pb-3 font-medium text-gray-500">{t('delta')}</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-100">
            <td className="py-3 font-medium text-gray-900">{t('calculated')}</td>
            <td className="py-3 text-right text-gray-700">{formatEuro(baseline.calculated)}</td>
            <td className="py-3 text-right text-gray-900 font-medium">{formatEuro(scenario.calculated)}</td>
            <td className="py-3 text-right text-gray-700 font-medium">
              {formatDelta(calcDelta)}
            </td>
          </tr>
          <tr>
            <td className="py-3 font-medium text-gray-900">{t('paid')}</td>
            <td className="py-3 text-right text-gray-700">{formatEuro(baseline.paid)}</td>
            <td className="py-3 text-right text-gray-900 font-medium">{formatEuro(scenario.paid)}</td>
            <td className="py-3 text-right text-gray-700 font-medium">
              {formatDelta(paidDelta)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">{t('mechanism')}:</span>
        <StatusBadge status={scenario.status} />
      </div>
    </div>
  );
}
