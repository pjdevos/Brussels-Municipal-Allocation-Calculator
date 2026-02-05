import { useLanguage } from '../../i18n/LanguageContext';

export function StatusBadge({ status }) {
  const { t } = useLanguage();

  const styles = {
    normal: 'bg-green-100 text-green-800',
    standstill: 'bg-gray-100 text-gray-800',
    capped: 'bg-orange-100 text-orange-800',
  };

  const labels = {
    normal: t('mechanism_normal'),
    standstill: t('mechanism_standstill'),
    capped: t('mechanism_capped'),
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.normal}`}>
      {labels[status] || status}
    </span>
  );
}
