import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

const CRITERIA = [
  { key: 'surface', weight: '2/105', tweakable: false },
  { key: 'popgrowth', weight: '6/105', tweakable: false },
  { key: 'unemployment', weight: '15/105', tweakable: true },
  { key: 'ris', weight: '15/105', tweakable: true },
  { key: 'poverty', weight: '15/105', tweakable: true },
  { key: 'daycare', weight: '1/105', tweakable: false },
  { key: 'schools', weight: '4/105', tweakable: false },
  { key: 'property_tax', weight: '20/105', tweakable: true },
  { key: 'income_tax', weight: '12/105', tweakable: true },
  { key: 'density', weight: '15/105', tweakable: false },
];

export function About() {
  const { t } = useLanguage();

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {t('back_to_dashboard')}
        </Link>
      </div>

      <div className="space-y-6">
        {/* How it works */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('about_how_it_works')}
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            {t('about_how_it_works_text')}
          </p>
        </section>

        {/* The 10 Criteria */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('about_criteria_title')}
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-500">#</th>
                <th className="text-left py-2 font-medium text-gray-500">Criterion</th>
                <th className="text-right py-2 font-medium text-gray-500">Weight</th>
                <th className="text-right py-2 font-medium text-gray-500">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {CRITERIA.map((c, i) => (
                <tr key={c.key} className={c.tweakable ? 'bg-blue-50' : ''}>
                  <td className="py-2.5 text-gray-500">{i + 1}</td>
                  <td className="py-2.5">
                    <span className={c.tweakable ? 'font-semibold text-gray-900' : 'text-gray-700'}>
                      {t(`about_criteria_${c.key}`)}
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-gray-600">{c.weight}</td>
                  <td className="py-2.5 text-right">
                    {c.tweakable ? (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        {t('about_tweakable')}
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                        {t('about_fixed')}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Mechanisms */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('about_mechanisms_title')}
          </h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs font-medium flex-shrink-0">
                Standstill
              </span>
              <p>{t('about_standstill_text')}</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
              <span className="bg-orange-200 text-orange-700 px-2 py-0.5 rounded text-xs font-medium flex-shrink-0">
                +4% Cap
              </span>
              <p>{t('about_cap_text')}</p>
            </div>
          </div>
        </section>

        {/* Data Caveats */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('about_caveats_title')}
          </h2>
          <div className="space-y-3 text-sm text-gray-700">
            <p>{t('about_poverty_caveat')}</p>
            <p>{t('about_age_caveat')}</p>
            <p className="font-medium text-gray-900 mt-4">{t('about_data_year')}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
