import { useState } from 'react';
import { MunicipalitySelector } from './MunicipalitySelector';
import { IndicatorSlider } from './IndicatorSlider';
import { useLanguage } from '../../i18n/LanguageContext';

function AccordionSection({ title, badge, isOpen, onToggle, children }) {
  return (
    <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex justify-between items-center text-left bg-white hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{title}</span>
          {badge && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{badge}</span>
          )}
        </div>
        <span className={`transform transition-transform text-gray-500 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-4 py-3 bg-white border-t border-gray-200">
          {children}
        </div>
      )}
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
  const { t } = useLanguage();
  const [openSections, setOpenSections] = useState([]);

  const toggleSection = (id) => {
    setOpenSections(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  const socialIndicators = [
    {
      key: 'long_term_unemployed',
      labelKey: 'indicator_unemployed',
      descKey: 'indicator_unemployed_desc',
      tooltipKey: 'tooltip_scenario',
      unit: 'number',
      getRange: (baseline) => ({
        min: Math.floor(baseline * 0.5),
        max: Math.ceil(baseline * 1.5),
        step: 10,
      }),
    },
    {
      key: 'ris_beneficiaries',
      labelKey: 'indicator_ris',
      descKey: 'indicator_ris_desc',
      tooltipKey: 'tooltip_scenario',
      unit: 'number',
      getRange: (baseline) => ({
        min: Math.floor(baseline * 0.5),
        max: Math.ceil(baseline * 1.5),
        step: 10,
      }),
    },
    {
      key: 'poverty_risk_pct',
      labelKey: 'indicator_poverty',
      descKey: 'indicator_poverty_desc',
      tooltipKey: 'tooltip_poverty_proxy',
      unit: 'percent',
      getRange: (baseline) => ({
        min: Math.max(0.01, baseline * 0.5),
        max: Math.min(0.6, baseline * 1.5),
        step: 0.01,
      }),
    },
  ];

  const fiscalIndicators = [
    {
      key: 'property_tax_per_capita',
      labelKey: 'indicator_property_tax',
      descKey: 'indicator_property_tax_desc',
      tooltipKey: 'tooltip_fiscal_higher',
      unit: 'euro_per_capita',
      getRange: (baseline) => ({
        min: Math.floor(baseline * 0.5),
        max: Math.ceil(baseline * 1.5),
        step: 1,
      }),
    },
    {
      key: 'income_tax_per_capita',
      labelKey: 'indicator_income_tax',
      descKey: 'indicator_income_tax_desc',
      tooltipKey: 'tooltip_fiscal_higher',
      unit: 'euro_per_capita',
      getRange: (baseline) => ({
        min: Math.floor(baseline * 0.5),
        max: Math.ceil(baseline * 1.5),
        step: 5,
      }),
    },
  ];

  const hasTweaks = Object.keys(tweaks).length > 0;

  const renderIndicators = (indicators) =>
    indicators.map(indicator => {
      const baselineValue = selectedBaseline[indicator.key];
      const currentValue = tweaks[indicator.key] ?? baselineValue;
      const range = indicator.getRange(baselineValue);

      return (
        <IndicatorSlider
          key={indicator.key}
          label={t(indicator.labelKey)}
          description={t(indicator.descKey)}
          tooltip={t(indicator.tooltipKey)}
          value={currentValue}
          baseline={baselineValue}
          min={range.min}
          max={range.max}
          step={range.step}
          unit={indicator.unit}
          onChange={(value) => onUpdateTweak(indicator.key, value)}
        />
      );
    });

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-md">
      <MunicipalitySelector
        value={selectedMunicipality}
        onChange={onSelectMunicipality}
        municipalities={municipalities}
      />

      {selectedMunicipality && selectedBaseline ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-700">
              {t('adjust_indicators')}
            </h3>
            {hasTweaks && (
              <button
                onClick={onResetTweaks}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
              >
                {t('reset_baseline')}
              </button>
            )}
          </div>

          <AccordionSection
            title={t('social_indicators')}
            badge="3"
            isOpen={openSections.includes('social')}
            onToggle={() => toggleSection('social')}
          >
            {renderIndicators(socialIndicators)}
          </AccordionSection>

          <AccordionSection
            title={t('fiscal_indicators')}
            badge="2"
            isOpen={openSections.includes('fiscal')}
            onToggle={() => toggleSection('fiscal')}
          >
            {renderIndicators(fiscalIndicators)}
          </AccordionSection>
        </>
      ) : (
        <div className="text-center py-6 text-gray-500 text-sm">
          {t('select_placeholder')}
        </div>
      )}
    </div>
  );
}
