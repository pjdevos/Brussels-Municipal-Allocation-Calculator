import { THRESHOLDS, DENSITY_COEFFICIENTS } from './constants.js';

/**
 * Calculate distribution key for absolute indicator (surface only)
 * Simple proportional distribution
 */
export function calculateAbsoluteKey(municipalities, getValue) {
  const total = municipalities.reduce((sum, m) => sum + getValue(m), 0);

  return municipalities.map(m => ({
    id: m.id,
    key: getValue(m) / total,
  }));
}

/**
 * Calculate distribution key for relative indicator (quadratic weighting)
 * Used for: Population growth, Unemployment, RIS, Poverty, Daycare, Schools
 * The squared term creates progressive redistribution
 */
export function calculateRelativeKey(municipalities, getValue, getPopulation) {
  const total = municipalities.reduce((sum, m) => {
    const value = getValue(m);
    const population = getPopulation(m);
    return sum + (value * value * population);
  }, 0);

  if (total === 0) {
    // Avoid division by zero - distribute equally
    const equalKey = 1 / municipalities.length;
    return municipalities.map(m => ({ id: m.id, key: equalKey }));
  }

  return municipalities.map(m => {
    const value = getValue(m);
    const population = getPopulation(m);
    return {
      id: m.id,
      key: (value * value * population) / total,
    };
  });
}

/**
 * Calculate distribution key for fiscal indicators (eligibility-based)
 * Only municipalities below 1.5× regional average are eligible
 */
export function calculateFiscalKey(municipalities, getRevenuePerCapita, getPopulation, regionalAverage) {
  const referenceAmount = regionalAverage * THRESHOLDS.TAX_ELIGIBILITY_FACTOR;

  // Filter eligible municipalities (below reference amount)
  const eligible = municipalities.filter(
    m => getRevenuePerCapita(m) < referenceAmount
  );

  if (eligible.length === 0) {
    return municipalities.map(m => ({ id: m.id, key: 0 }));
  }

  // Calculate total weighted gap
  const totalWeightedGap = eligible.reduce((sum, m) => {
    const gap = referenceAmount - getRevenuePerCapita(m);
    return sum + (gap * getPopulation(m));
  }, 0);

  if (totalWeightedGap === 0) {
    return municipalities.map(m => ({ id: m.id, key: 0 }));
  }

  return municipalities.map(m => {
    const revenue = getRevenuePerCapita(m);

    if (revenue >= referenceAmount) {
      return { id: m.id, key: 0 };
    }

    const gap = referenceAmount - revenue;
    return {
      id: m.id,
      key: (gap * getPopulation(m)) / totalWeightedGap,
    };
  });
}

/**
 * Get density coefficient based on corrected surface area
 */
function getDensityCoefficient(surfaceCorrected) {
  for (const { maxSurface, coefficient } of DENSITY_COEFFICIENTS) {
    if (surfaceCorrected < maxSurface) {
      return coefficient;
    }
  }
  return 1.5; // Default for large surfaces
}

/**
 * Calculate distribution key for density (eligibility + coefficient)
 * Only municipalities above 75% of regional average density are eligible
 */
export function calculateDensityKey(municipalities, regionalAverageDensity) {
  const threshold = regionalAverageDensity * THRESHOLDS.DENSITY_ELIGIBILITY_FACTOR;

  // Filter eligible municipalities (above density threshold)
  const eligible = municipalities.filter(
    m => m.indicators.correctedDensity > threshold
  );

  if (eligible.length === 0) {
    return municipalities.map(m => ({ id: m.id, key: 0 }));
  }

  // Calculate total weighted density
  const total = eligible.reduce((sum, m) => {
    const coef = getDensityCoefficient(m.indicators.surface);
    return sum + (m.indicators.correctedDensity * coef);
  }, 0);

  if (total === 0) {
    return municipalities.map(m => ({ id: m.id, key: 0 }));
  }

  return municipalities.map(m => {
    if (m.indicators.correctedDensity <= threshold) {
      return { id: m.id, key: 0 };
    }

    const coef = getDensityCoefficient(m.indicators.surface);
    return {
      id: m.id,
      key: (m.indicators.correctedDensity * coef) / total,
    };
  });
}
