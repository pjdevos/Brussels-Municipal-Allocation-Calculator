import { Link } from 'react-router-dom';
import { ControlPanel } from '../components/controls/ControlPanel';
import { SummaryCards } from '../components/results/SummaryCards';
import { MunicipalityImpact } from '../components/results/MunicipalityImpact';
import { useLanguage } from '../i18n/LanguageContext';

export function Dashboard({
  data,
  selectedMunicipality,
  selectedBaseline,
  tweaks,
  baselineResults,
  scenarioResults,
  selectMunicipality,
  updateTweak,
  resetTweaks,
}) {
  const { t } = useLanguage();

  return (
    <>
      <SummaryCards scenarioResults={scenarioResults} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ControlPanel
            municipalities={data?.municipalities || []}
            selectedMunicipality={selectedMunicipality}
            selectedBaseline={selectedBaseline}
            tweaks={tweaks}
            onSelectMunicipality={selectMunicipality}
            onUpdateTweak={updateTweak}
            onResetTweaks={resetTweaks}
          />
        </div>

        <div className="lg:col-span-2">
          <MunicipalityImpact
            baselineResults={baselineResults}
            scenarioResults={scenarioResults}
            selectedMunicipality={selectedMunicipality}
          />

          <div className="mt-4">
            <Link
              to="/municipalities"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('view_all_municipalities')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
