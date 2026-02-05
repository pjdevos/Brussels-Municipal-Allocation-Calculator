import { useLanguage } from '../../i18n/LanguageContext';

export function MunicipalitySelector({ value, onChange, municipalities }) {
  const { t, getMunicipalityName } = useLanguage();

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {t('select_municipality')}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">{t('select_placeholder')}</option>
        {municipalities.map(m => (
          <option key={m.id} value={m.id}>
            {getMunicipalityName(m)}
          </option>
        ))}
      </select>
    </div>
  );
}
