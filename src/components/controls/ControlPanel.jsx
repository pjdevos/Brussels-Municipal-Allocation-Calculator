import { useState } from 'react';
import { MunicipalitySelector } from './MunicipalitySelector';
import { IndicatorSlider } from './IndicatorSlider';
import { formatNumber } from '../../utils/formatters';

function AccordionSection({ id, title, subtitle, isOpen, onToggle, disabled, children }) {
  return (
    <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden">
      <button
        onClick={() => !disabled && onToggle(id)}
        className={`w-full px-4 py-3 flex justify-between items-center text-left ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'
        }`}
        disabled={disabled}
      >
        <div>
          <span className={`font-medium ${disabled ? 'text-gray-500' : 'text-gray-900'}`}>
            {title}
          </span>
          {subtitle && (
            <span className="text-xs text-gray-500 ml-2">{subtitle}</span>
          )}
        </div>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          {disabled ? '—' : '▼'}
        </span>
      </button>
      {isOpen && !disabled && (
        <div className="px-4 py-3 bg-white border-t border-gray-200">
          {children}
        </div>
      )}
      {disabled && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-sm text-gray-500">
          These indicators are not adjustable in this scenario.
          <br />
          <span className="text-xs">Ces indicateurs ne sont pas ajustables / Deze indicatoren zijn niet aanpasbaar</span>
        </div>
      )}
    </div>
  );
}

function InfoDisplay({ label, labelFr, value, unit }) {
  const formatValue = (val) => {
    if (unit === 'percent') return `${(val * 100).toFixed(1)}%`;
    if (unit === 'km2') return `${val.toFixed(2)} km²`;
    return formatNumber(val);
  };

  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">
        {label}
        <span className="text-xs text-gray-400 ml-1">/ {labelFr}</span>
      </span>
      <span className="text-sm font-medium text-gray-900">{formatValue(value)}</span>
    </div>
  );
}

export function ControlPanel({
  municipalities,
  selectedMunicipality,
  selectedBaseline,
  tweaks,
  onSelectMunicipality,
  onUpdateTweak,
  onResetTweaks,
}) {
  const [openSections, setOpenSections] = useState(['social', 'fiscal']);

  const toggleSection = (id) => {
    setOpenSections(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  // Social indicators (tweakable)
  const socialIndicators = [
    {
      key: 'long_term_unemployed',
      label: 'Long-term Unemployed (used in formula)',
      labelFr: 'Chômeurs longue durée (>1 an, 18-64)',
      labelNl: 'Langdurig werklozen',
      tooltip: 'Scenario value replaces official 2023 reference value for THIS municipality only.',
      unit: 'number',
      getRange: (baseline) => ({
        min: Math.floor(baseline * 0.5),
        max: Math.ceil(baseline * 1.5),
        step: 10,
      }),
    },
    {
      key: 'ris_beneficiaries',
      label: 'Living Wage Beneficiaries - RIS (used in formula)',
      labelFr: 'Bénéficiaires du revenu d\'intégration sociale',
      labelNl: 'Leefloongerechtigden',
      tooltip: 'Scenario value replaces official 2023 reference value for THIS municipality only.',
      unit: 'number',
      getRange: (baseline) => ({
        min: Math.floor(baseline * 0.5),
        max: Math.ceil(baseline * 1.5),
        step: 10,
      }),
    },
    {
      key: 'poverty_risk_pct',
      label: 'Poverty Risk (used in formula)',
      labelFr: 'Risque de pauvreté',
      labelNl: 'Armoederisico',
      tooltip: 'Percentage of tax declarations below poverty threshold. Proxy calculation.',
      unit: 'percent',
      getRange: (baseline) => ({
        min: Math.max(0.01, baseline * 0.5),
        max: Math.min(0.6, baseline * 1.5),
        step: 0.01,
      }),
    },
  ];

  // Fiscal indicators (tweakable)
  const fiscalIndicators = [
    {
      key: 'property_tax_per_capita',
      label: 'Property Tax Revenue (used in formula)',
      labelFr: 'Recettes précompte immobilier',
      labelNl: 'Onroerende voorheffing ontvangsten',
      tooltip: 'Average €/capita over 5 years. Higher values reduce allocation (solidarity mechanism).',
      unit: 'euro_per_capita',
      getRange: (baseline) => ({
        min: Math.floor(baseline * 0.5),
        max: Math.ceil(baseline * 1.5),
        step: 1,
      }),
    },
    {
      key: 'income_tax_per_capita',
      label: 'Income Tax Revenue (used in formula)',
      labelFr: 'Recettes IPP',
      labelNl: 'Personenbelasting ontvangsten',
      tooltip: 'Average €/capita over 5 years. Higher values reduce allocation (solidarity mechanism).',
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
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Policy Scenario
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Scénario politique / Beleidsscenario
      </p>

      <MunicipalitySelector
        value={selectedMunicipality}
        onChange={onSelectMunicipality}
        municipalities={municipalities}
      />

      {selectedMunicipality && selectedBaseline ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-medium text-gray-700">
              Adjust Indicators
              <span className="text-xs text-gray-500 ml-2">/ Ajuster / Aanpassen</span>
            </h3>
            {hasTweaks && (
              <button
                onClick={onResetTweaks}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
              >
                Reset
              </button>
            )}
          </div>

          {/* Social Indicators */}
          <AccordionSection
            id="social"
            title="Social Indicators"
            subtitle="Indicateurs sociaux / Sociale indicatoren"
            isOpen={openSections.includes('social')}
            onToggle={toggleSection}
          >
            {socialIndicators.map(indicator => {
              const baselineValue = selectedBaseline[indicator.key];
              const currentValue = tweaks[indicator.key] ?? baselineValue;
              const range = indicator.getRange(baselineValue);

              return (
                <IndicatorSlider
                  key={indicator.key}
                  label={indicator.label}
                  description={`${indicator.labelFr} / ${indicator.labelNl}`}
                  tooltip={indicator.tooltip}
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
          </AccordionSection>

          {/* Fiscal Indicators */}
          <AccordionSection
            id="fiscal"
            title="Fiscal Indicators"
            subtitle="Indicateurs fiscaux / Fiscale indicatoren"
            isOpen={openSections.includes('fiscal')}
            onToggle={toggleSection}
          >
            {fiscalIndicators.map(indicator => {
              const baselineValue = selectedBaseline[indicator.key];
              const currentValue = tweaks[indicator.key] ?? baselineValue;
              const range = indicator.getRange(baselineValue);

              return (
                <IndicatorSlider
                  key={indicator.key}
                  label={indicator.label}
                  description={`${indicator.labelFr} / ${indicator.labelNl}`}
                  tooltip={indicator.tooltip}
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
          </AccordionSection>

          {/* Demographic Indicators (read-only) */}
          <AccordionSection
            id="demographic"
            title="Demographic"
            subtitle="Démographie / Demografie"
            isOpen={openSections.includes('demographic')}
            onToggle={toggleSection}
            disabled
          >
            <InfoDisplay
              label="Population Growth (10y)"
              labelFr="Croissance pop."
              value={selectedBaseline.population_growth_10y}
              unit="percent"
            />
            <InfoDisplay
              label="School Population"
              labelFr="Pop. scolaire"
              value={selectedBaseline.school_population}
              unit="number"
            />
            <InfoDisplay
              label="Daycare Places"
              labelFr="Places crèches"
              value={selectedBaseline.daycare_places}
              unit="number"
            />
          </AccordionSection>

          {/* Territorial Indicators (read-only) */}
          <AccordionSection
            id="territorial"
            title="Territorial"
            subtitle="Territorial / Territoriaal"
            isOpen={openSections.includes('territorial')}
            onToggle={toggleSection}
            disabled
          >
            <InfoDisplay
              label="Surface (corrected)"
              labelFr="Superficie corrigée"
              value={selectedBaseline.surface_corrected_km2}
              unit="km2"
            />
            <InfoDisplay
              label="Population"
              labelFr="Population"
              value={selectedBaseline.population_total}
              unit="number"
            />
          </AccordionSection>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Select a municipality to adjust its policy indicators</p>
          <p className="text-sm mt-2">
            Sélectionnez une commune / Selecteer een gemeente
          </p>
        </div>
      )}
    </div>
  );
}
