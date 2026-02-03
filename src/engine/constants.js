export const WEIGHTS = {
  SURFACE: 2 / 105,
  POPULATION_GROWTH: 6 / 105,
  UNEMPLOYMENT: 15 / 105,
  RIS: 15 / 105,
  POVERTY: 15 / 105,
  DAYCARE: 1 / 105,
  SCHOOLS: 4 / 105,
  PROPERTY_TAX: 20 / 105,
  INCOME_TAX: 12 / 105,
  DENSITY: 15 / 105,
};

export const THRESHOLDS = {
  TAX_ELIGIBILITY_FACTOR: 1.5,      // 150% of average
  DENSITY_ELIGIBILITY_FACTOR: 0.75, // 75% of average
};

export const DENSITY_COEFFICIENTS = [
  { maxSurface: 1, coefficient: 0.3 },
  { maxSurface: 2, coefficient: 0.5 },
  { maxSurface: 7, coefficient: 1.0 },
  { maxSurface: Infinity, coefficient: 1.5 },
];

export const TOTAL_BUDGET = 410733862;

export const GROWTH_CAP_YEAR1 = 1.04; // +4% max increase
