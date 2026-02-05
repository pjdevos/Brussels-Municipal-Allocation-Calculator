import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';

export function Header() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-xl font-bold">{t('app_title')}</h1>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center gap-1 bg-blue-800 rounded-lg p-0.5">
            <button
              onClick={() => setLanguage('nl')}
              className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${
                language === 'nl'
                  ? 'bg-white text-blue-900'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              NL
            </button>
            <button
              onClick={() => setLanguage('fr')}
              className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${
                language === 'fr'
                  ? 'bg-white text-blue-900'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              FR
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex gap-1 pb-0">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                isActive
                  ? 'bg-gray-100 text-blue-900'
                  : 'text-blue-200 hover:text-white hover:bg-blue-800'
              }`
            }
          >
            {t('nav_dashboard')}
          </NavLink>
          <NavLink
            to="/municipalities"
            className={({ isActive }) =>
              `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                isActive
                  ? 'bg-gray-100 text-blue-900'
                  : 'text-blue-200 hover:text-white hover:bg-blue-800'
              }`
            }
          >
            {t('nav_all_municipalities')}
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                isActive
                  ? 'bg-gray-100 text-blue-900'
                  : 'text-blue-200 hover:text-white hover:bg-blue-800'
              }`
            }
          >
            {t('nav_about')}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
