import { MunicipalitySelector } from './MunicipalitySelector';
import { IndicatorSlider } from './IndicatorSlider';

export function ControlPanel({
  municipalities,
  selectedMunicipality,
  selectedBaseline,
  tweaks,
  onSelectMunicipality,
  onUpdateTweak,
  onResetTweaks,
}) {
  // Define the 5 tweakable indicators
  const indicators = [
    {
      key: 'long_term_unemployed',
      label: 'Long-term Unemployed',
      description: 'Unemployed >1 year, age 18-64',
      unit: 'number',
      getRange: (baseline) => ({
        min: Math.floor(baseline * 0.5),
        max: Math.ceil(baseline * 1.5),
        step: 10,
      }),
    },
    {
      key: 'ris_beneficiaries',
      label: 'Living Wage Beneficiaries (RIS)',
      description: 'Revenu d\'intégration sociale, age 18-64',
      unit: 'number',
      getRange: (baseline) => ({
        min: Math.floor(baseline * 0.5),
        max: Math.ceil(baseline * 1.5),
        step: 10,
      }),
    },
    {
      key: 'poverty_risk_pct',
      label: 'Poverty Risk',
      description: 'Percentage of tax declarations below threshold',
      unit: 'percent',
      getRange: (baseline) => ({
        min: Math.max(0.01, baseline * 0.5),
        max: Math.min(0.6, baseline * 1.5),
        step: 0.01,
      }),
    },
    {
      key: 'property_tax_per_capita',
      label: 'Property Tax Revenue',
      description: 'Average €/capita (5-year average)',
      unit: 'euro_per_capita',
      getRange: (baseline) => ({
        min: Math.floor(baseline * 0.5),
        max: Math.ceil(baseline * 1.5),
        step: 1,
      }),
    },
    {
      key: 'income_tax_per_capita',
      label: 'Income Tax Revenue',
      description: 'Average €/capita (5-year average)',
      unit: 'euro_per_capita',
      getRange: (baseline) => ({
        min: Math.floor(baseline * 0.5),
        max: Math.ceil(baseline * 1.5),
        step: 5,
      }),
    },
  ];

  const hasTweaks = Object.keys(tweaks).length > 0;

  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Policy Scenario / Scénario politique
      </h2>

      <MunicipalitySelector
        value={selectedMunicipality}
        onChange={onSelectMunicipality}
        municipalities={municipalities}
      />

      {selectedMunicipality && selectedBaseline ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-medium text-gray-700">
              Adjust Indicators / Ajuster les indicateurs
            </h3>
            {hasTweaks && (
              <button
                onClick={onResetTweaks}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
              >
                Reset to baseline
              </button>
            )}
          </div>

          {indicators.map(indicator => {
            const baselineValue = selectedBaseline[indicator.key];
            const currentValue = tweaks[indicator.key] ?? baselineValue;
            const range = indicator.getRange(baselineValue);

            return (
              <IndicatorSlider
                key={indicator.key}
                label={indicator.label}
                description={indicator.description}
                value={currentValue}
                baseline={baselineValue}
                min={range.min}
                max={range.max}
                step={range.step}
                unit={indicator.unit}
                onChange={(value) => onUpdateTweak(indicator.key, value)}
              />
            );
          })}
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Select a municipality to adjust its policy indicators</p>
          <p className="text-sm mt-2">
            Sélectionnez une commune pour ajuster ses indicateurs
          </p>
        </div>
      )}
    </div>
  );
}
