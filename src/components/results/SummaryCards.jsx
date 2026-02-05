import { formatEuro } from '../../utils/formatters';
import { TOTAL_BUDGET } from '../../engine/constants';
import { useLanguage } from '../../i18n/LanguageContext';

export function SummaryCards({ scenarioResults }) {
  const { t } = useLanguage();

  if (!scenarioResults.length) return null;

  const totalPaid = scenarioResults.reduce((sum, r) => sum + r.paid, 0);
  const blocked = TOTAL_BUDGET - totalPaid;

  const standstillCount = scenarioResults.filter(r => r.status === 'standstill').length;
  const cappedCount = scenarioResults.filter(r => r.status === 'capped').length;
  const normalCount = scenarioResults.filter(r => r.status === 'normal').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
          {t('summary_envelope_title')}
        </p>
        <p className="text-2xl font-bold text-gray-900 mt-2">
          {formatEuro(TOTAL_BUDGET)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {t('summary_envelope_desc')}
        </p>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-green-500">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
          {t('summary_paid_title')}
        </p>
        <p className="text-2xl font-bold text-gray-900 mt-2">
          {formatEuro(totalPaid)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {t('summary_paid_desc')}
        </p>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-orange-500">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
          {t('summary_blocked_title')}
        </p>
        <p className="text-2xl font-bold text-gray-900 mt-2">
          {formatEuro(blocked)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {t('summary_blocked_desc')}
        </p>
        <div className="flex gap-3 mt-2 text-xs">
          <span className="text-green-600 font-medium">{normalCount} {t('summary_normal')}</span>
          <span className="text-gray-500 font-medium">{standstillCount} {t('summary_standstill')}</span>
          <span className="text-orange-600 font-medium">{cappedCount} {t('summary_capped')}</span>
        </div>
      </div>
    </div>
  );
}
