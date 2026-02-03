/**
 * Calculate all 10 indicators for a municipality
 * @param {Object} municipality - Municipality data with baseline and optional tweaks
 * @returns {Object} Calculated indicators
 */
export function calculateIndicators(municipality) {
  const { baseline, tweaks = {} } = municipality;

  // Merge baseline with any tweaks
  const data = { ...baseline, ...tweaks };

  return {
    // 1. Surface (fixed)
    surface: data.surface_corrected_km2,

    // 2. Population growth (fixed) - capped at 0 minimum
    populationGrowth: Math.max(0, data.population_growth_10y),

    // 3. Unemployment rate (tweakable)
    unemploymentRate: data.long_term_unemployed / data.population_18_64,

    // 4. RIS rate (tweakable)
    risRate: data.ris_beneficiaries / data.population_18_64,

    // 5. Poverty rate (tweakable via proxy)
    povertyRate: data.poverty_risk_pct,

    // 6. Daycare rate (fixed)
    daycareRate: data.daycare_places / data.population_0_2,

    // 7. School rate (fixed)
    schoolRate: data.school_population / data.population_3_17,

    // 8. Property tax per capita (tweakable)
    propertyTaxPerCapita: data.property_tax_per_capita,

    // 9. Income tax per capita (tweakable)
    incomeTaxPerCapita: data.income_tax_per_capita,

    // 10. Corrected density (fixed - based on population and corrected surface)
    correctedDensity: data.population_total / data.surface_corrected_km2,
  };
}
