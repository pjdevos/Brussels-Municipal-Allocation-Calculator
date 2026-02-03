import { useState, useMemo, useCallback } from 'react';
import { calculateAllocations } from '../engine/calculator.js';

/**
 * Custom hook for managing scenario state and calculations
 */
export function useScenario(rawData) {
  // Currently selected municipality for tweaking
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);

  // Tweaks applied to the selected municipality
  const [tweaks, setTweaks] = useState({});

  // Prepare municipality data structure
  const municipalities = useMemo(() => {
    if (!rawData?.municipalities) return [];

    return rawData.municipalities.map(m => ({
      id: m.id,
      name: m.name,
      name_fr: m.name_fr,
      name_nl: m.name_nl,
      baseline: {
        population_total: m.population_total,
        population_0_2: m.population_0_2,
        population_3_17: m.population_3_17,
        population_18_64: m.population_18_64,
        population_65_plus: m.population_65_plus,
        surface_corrected_km2: m.surface_corrected_km2,
        population_growth_10y: m.population_growth_10y,
        long_term_unemployed: m.long_term_unemployed,
        ris_beneficiaries: m.ris_beneficiaries,
        poverty_risk_pct: m.poverty_risk_pct,
        tax_declarations_positive: m.tax_declarations_positive,
        daycare_places: m.daycare_places,
        school_population: m.school_population,
        property_tax_per_capita: m.property_tax_per_capita,
        income_tax_per_capita: m.income_tax_per_capita,
        guaranteed_2024: m.guaranteed_2024,
        calculated_2024: m.calculated_2024,
        paid_2024: m.paid_2024,
      },
      // Apply tweaks only to selected municipality
      tweaks: m.id === selectedMunicipality ? tweaks : {},
    }));
  }, [rawData, selectedMunicipality, tweaks]);

  // Regional data for calculations
  const regionalData = useMemo(() => {
    if (!rawData?.regional_averages) return null;
    return {
      averages: rawData.regional_averages,
      metadata: rawData.metadata,
    };
  }, [rawData]);

  // Calculate baseline allocations (no tweaks)
  const baselineResults = useMemo(() => {
    if (!municipalities.length || !regionalData) return [];

    const baselineMunicipalities = municipalities.map(m => ({
      ...m,
      tweaks: {}, // No tweaks for baseline
    }));

    return calculateAllocations(baselineMunicipalities, regionalData);
  }, [municipalities, regionalData]);

  // Calculate scenario allocations (with tweaks)
  const scenarioResults = useMemo(() => {
    if (!municipalities.length || !regionalData) return [];
    return calculateAllocations(municipalities, regionalData);
  }, [municipalities, regionalData]);

  // Get baseline data for selected municipality
  const selectedBaseline = useMemo(() => {
    if (!selectedMunicipality || !rawData?.municipalities) return null;
    return rawData.municipalities.find(m => m.id === selectedMunicipality);
  }, [selectedMunicipality, rawData]);

  // Update a single tweak value
  const updateTweak = useCallback((field, value) => {
    setTweaks(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Reset all tweaks
  const resetTweaks = useCallback(() => {
    setTweaks({});
  }, []);

  // Select a municipality and reset tweaks
  const selectMunicipality = useCallback((id) => {
    setSelectedMunicipality(id);
    setTweaks({});
  }, []);

  return {
    // State
    selectedMunicipality,
    tweaks,
    municipalities,
    regionalData,

    // Results
    baselineResults,
    scenarioResults,
    selectedBaseline,

    // Actions
    selectMunicipality,
    updateTweak,
    resetTweaks,
  };
}
