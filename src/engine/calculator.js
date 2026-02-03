import { WEIGHTS, TOTAL_BUDGET } from './constants.js';
import { calculateIndicators } from './indicators.js';
import {
  calculateAbsoluteKey,
  calculateRelativeKey,
  calculateFiscalKey,
  calculateDensityKey,
} from './distributionKeys.js';
import { applyStandstill } from './standstill.js';

/**
 * Main allocation calculator
 * @param {Array} municipalities - Array of municipality data
 * @param {Object} regionalData - Regional averages and metadata
 * @returns {Array} Allocation results for all municipalities
 */
export function calculateAllocations(municipalities, regionalData) {
  // Step 1: Calculate indicators for all municipalities
  const municipalitiesWithIndicators = municipalities.map(m => ({
    ...m,
    indicators: calculateIndicators(m),
  }));

  // Helper to get population
  const getPopulation = (m) => m.baseline.population_total;

  // Step 2: Calculate distribution keys for each criterion
  const keys = {
    // Absolute key (surface)
    surface: calculateAbsoluteKey(
      municipalitiesWithIndicators,
      m => m.indicators.surface
    ),

    // Relative keys (quadratic weighting)
    populationGrowth: calculateRelativeKey(
      municipalitiesWithIndicators,
      m => m.indicators.populationGrowth,
      getPopulation
    ),

    unemployment: calculateRelativeKey(
      municipalitiesWithIndicators,
      m => m.indicators.unemploymentRate,
      getPopulation
    ),

    ris: calculateRelativeKey(
      municipalitiesWithIndicators,
      m => m.indicators.risRate,
      getPopulation
    ),

    poverty: calculateRelativeKey(
      municipalitiesWithIndicators,
      m => m.indicators.povertyRate,
      getPopulation
    ),

    daycare: calculateRelativeKey(
      municipalitiesWithIndicators,
      m => m.indicators.daycareRate,
      getPopulation
    ),

    schools: calculateRelativeKey(
      municipalitiesWithIndicators,
      m => m.indicators.schoolRate,
      getPopulation
    ),

    // Fiscal keys (eligibility-based)
    propertyTax: calculateFiscalKey(
      municipalitiesWithIndicators,
      m => m.indicators.propertyTaxPerCapita,
      getPopulation,
      regionalData.averages.property_tax_per_capita
    ),

    incomeTax: calculateFiscalKey(
      municipalitiesWithIndicators,
      m => m.indicators.incomeTaxPerCapita,
      getPopulation,
      regionalData.averages.income_tax_per_capita
    ),

    // Density key (eligibility + coefficient)
    density: calculateDensityKey(
      municipalitiesWithIndicators,
      regionalData.averages.corrected_density
    ),
  };

  // Step 3: Calculate provisional allocations
  const results = municipalitiesWithIndicators.map(m => {
    // Get all distribution keys for this municipality
    const municipalityKeys = {
      surface: keys.surface.find(k => k.id === m.id).key,
      populationGrowth: keys.populationGrowth.find(k => k.id === m.id).key,
      unemployment: keys.unemployment.find(k => k.id === m.id).key,
      ris: keys.ris.find(k => k.id === m.id).key,
      poverty: keys.poverty.find(k => k.id === m.id).key,
      daycare: keys.daycare.find(k => k.id === m.id).key,
      schools: keys.schools.find(k => k.id === m.id).key,
      propertyTax: keys.propertyTax.find(k => k.id === m.id).key,
      incomeTax: keys.incomeTax.find(k => k.id === m.id).key,
      density: keys.density.find(k => k.id === m.id).key,
    };

    // Calculate weighted sum
    const calculated = TOTAL_BUDGET * (
      WEIGHTS.SURFACE * municipalityKeys.surface +
      WEIGHTS.POPULATION_GROWTH * municipalityKeys.populationGrowth +
      WEIGHTS.UNEMPLOYMENT * municipalityKeys.unemployment +
      WEIGHTS.RIS * municipalityKeys.ris +
      WEIGHTS.POVERTY * municipalityKeys.poverty +
      WEIGHTS.DAYCARE * municipalityKeys.daycare +
      WEIGHTS.SCHOOLS * municipalityKeys.schools +
      WEIGHTS.PROPERTY_TAX * municipalityKeys.propertyTax +
      WEIGHTS.INCOME_TAX * municipalityKeys.incomeTax +
      WEIGHTS.DENSITY * municipalityKeys.density
    );

    // Step 4: Apply standstill & caps
    const final = applyStandstill(calculated, m.baseline.guaranteed_2024);

    return {
      id: m.id,
      name: m.name,
      name_fr: m.name_fr,
      name_nl: m.name_nl,
      population: m.baseline.population_total,
      calculated: calculated,
      paid: final.paid,
      difference: final.difference,
      percentChange: final.percentChange,
      status: final.status,
      statusLabel: final.statusLabel,
      keys: municipalityKeys,
      indicators: m.indicators,
    };
  });

  return results;
}

/**
 * Calculate total allocated budget (for verification)
 */
export function calculateTotalBudget(results) {
  return results.reduce((sum, r) => sum + r.paid, 0);
}
