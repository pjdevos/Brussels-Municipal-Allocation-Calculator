import { GROWTH_CAP_YEAR1 } from './constants.js';

/**
 * Apply standstill mechanism and growth caps
 * @param {number} calculated - Calculated allocation based on formula
 * @param {number} guaranteed - Guaranteed/standstill amount from previous period
 * @returns {Object} Final allocation with status
 */
export function applyStandstill(calculated, guaranteed) {
  // Floor: standstill protection - municipality cannot receive less than guaranteed
  if (calculated < guaranteed) {
    return {
      paid: guaranteed,
      difference: guaranteed - calculated,
      percentChange: ((guaranteed - calculated) / guaranteed) * 100,
      status: 'standstill',
      statusLabel: 'Protected (standstill)',
    };
  }

  // Ceiling: growth cap at +4% (year 1 of triennium)
  const maxIncrease = guaranteed * GROWTH_CAP_YEAR1;

  if (calculated > maxIncrease) {
    return {
      paid: maxIncrease,
      difference: calculated - maxIncrease,
      percentChange: ((maxIncrease - guaranteed) / guaranteed) * 100,
      status: 'capped',
      statusLabel: 'Capped (+4%)',
    };
  }

  // Normal: full calculated amount
  return {
    paid: calculated,
    difference: 0,
    percentChange: ((calculated - guaranteed) / guaranteed) * 100,
    status: 'normal',
    statusLabel: 'Normal',
  };
}
