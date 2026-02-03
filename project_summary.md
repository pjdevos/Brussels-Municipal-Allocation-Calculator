# Brussels Municipal Allocation Calculator - Project Summary

## Project Overview

**Goal:** Create a React web application that simulates the impact of policy changes on municipal allocations (dotations) for the 19 Brussels municipalities.

**Context:** The Brussels Capital Region distributes €410.7M (2024) to municipalities based on a complex formula defined in the joint ordinance of 2017. This tool allows policy makers to tweak specific variables and see the real-time impact on each municipality's allocation.

**Key Feature:** Users can adjust policy-influenceable indicators for one municipality at a time and see how this affects the relative distribution across all 19 municipalities.

**Base Year:** 2023 baseline data with 2024 standstill amounts  
**Total Budget 2024:** €410,733,862

---

## The 19 Brussels Municipalities

1. Anderlecht
2. Auderghem (Oudergem)
3. Berchem-Sainte-Agathe (Sint-Agatha-Berchem)
4. Ville de Bruxelles (Stad Brussel)
5. Etterbeek
6. Evere
7. Forest (Vorst)
8. Ganshoren
9. Ixelles (Elsene)
10. Jette
11. Koekelberg
12. Molenbeek-Saint-Jean (Sint-Jans-Molenbeek)
13. Saint-Gilles (Sint-Gillis)
14. Saint-Josse-ten-Noode (Sint-Joost-ten-Node)
15. Schaerbeek (Schaarbeek)
16. Uccle (Ukkel)
17. Watermael-Boitsfort (Watermaal-Bosvoorde)
18. Woluwe-Saint-Lambert (Sint-Lambrechts-Woluwe)
19. Woluwe-Saint-Pierre (Sint-Pieters-Woluwe)

---

## Tweakable Indicators (5)

Users can adjust these 5 indicators for ONE municipality at a time:

1. **Long-term Unemployed** (>1 year, age 18-64) - absolute number
2. **Living Wage Beneficiaries** (RIS, age 18-64) - absolute number
3. **Poverty Risk** - percentage of tax declarations below threshold
4. **Property Tax Revenue** - average €/capita (5-year average)
5. **Income Tax Revenue** - average €/capita (5-year average)

---

## Complete Calculation Formula

### Step 1: Calculate Indicators

For each municipality, calculate these 10 indicator values:

#### 1. Corrected Surface Area (FIXED)
```
Surface_corr = surface area excluding:
  - Cemeteries (neighborhoods 700-702)
  - Industrial zones (800-805)
  - Parks, forests (900-917)
  - Sectors with <20 inhabitants
```

#### 2. Population Growth 10-year (FIXED)
```javascript
Growth_rate = (Pop_current - Pop_10_years_ago) / Pop_10_years_ago
if (Growth_rate < 0) Growth_rate = 0
```

#### 3. Long-term Unemployment Rate (TWEAKABLE #1)
```javascript
Unemployment_rate = Long_unemployed_>1year / Population_18_64
```

#### 4. RIS Beneficiaries Rate (TWEAKABLE #2)
```javascript
RIS_rate = RIS_beneficiaries / Population_18_64
```

#### 5. Poverty Risk (TWEAKABLE #3)
```javascript
// ⚠️ PROXY CALCULATION - actual data not available
Declarations_under_poverty = Tax_declarations_>0 × Poverty_risk_pct
Poverty_rate = Declarations_under_poverty / Tax_declarations_>0
```

#### 6. Daycare Places Rate (FIXED)
```javascript
Daycare_rate = Daycare_places / Population_0_2
```

#### 7. School Population Rate (FIXED)
```javascript
School_rate = School_population / Population_3_17
```

#### 8. Property Tax Revenue (TWEAKABLE #4)
```javascript
// 5-year average revenue per capita
Property_tax_per_capita = Average_5_year_revenue / Average_5_year_population
```

#### 9. Income Tax Revenue (TWEAKABLE #5)
```javascript
// 5-year average revenue per capita
Income_tax_per_capita = Average_5_year_revenue / Average_5_year_population
```

#### 10. Corrected Population Density (FIXED)
```javascript
Density_corr = Population_total / Surface_corr
```

---

### Step 2: Calculate Distribution Keys

For each criterion, calculate how the budget is distributed among municipalities.

#### Absolute Indicator (Surface only)

```javascript
Distribution_key[c] = Surface_corr[c] / Σ(Surface_corr[k])
// k = all 19 municipalities
```

#### Relative Indicators (Quadratic weighting)

Used for: Population growth, Unemployment, RIS, Poverty, Daycare, Schools

```javascript
// For municipality c:
Indicator_value = calculated_rate  // e.g., unemployment_rate

Distribution_key[c] = (Indicator_value[c])² × Population[c] 
                      / Σ[(Indicator_value[k])² × Population[k]]

// The squared term creates progressive redistribution:
// Municipality with 2× the rate gets MORE than 2× the allocation
```

**Example for RIS:**
```javascript
// Anderlecht: RIS_rate = 0.0657, Population = 122,064
// Uccle: RIS_rate = 0.0102, Population = 83,941

Weighted_Anderlecht = (0.0657)² × 122,064 = 527.2
Weighted_Uccle = (0.0102)² × 83,941 = 8.7

// If these were the only 2 municipalities:
Key_Anderlecht = 527.2 / (527.2 + 8.7) = 98.4%
Key_Uccle = 8.7 / (527.2 + 8.7) = 1.6%

// Anderlecht has 6.4× the RIS rate but gets 61× more allocation
// This is the solidarity mechanism in action
```

#### Fiscal Indicators (Property & Income Tax)

**Step 1: Calculate regional average**
```javascript
Regional_average = Σ(Revenue[k] / Population[k]) / 19
```

**Step 2: Determine eligibility**
```javascript
Reference_amount = 1.5 × Regional_average

Eligible = (Revenue[c] / Population[c]) < Reference_amount
```

**Step 3: Calculate distribution (eligible municipalities only)**
```javascript
if (!Eligible) {
  Distribution_key[c] = 0
} else {
  Gap[c] = Reference_amount - (Revenue[c] / Population[c])
  
  Distribution_key[c] = Gap[c] × Population[c] 
                        / Σ(Gap[k] × Population[k])
  // k = eligible municipalities only
}
```

#### Density Indicator

**Step 1: Eligibility check**
```javascript
Regional_avg_density = Σ(Density_corr[k]) / 19
Eligible = Density_corr[c] > 0.75 × Regional_avg_density
```

**Step 2: Surface coefficient**
```javascript
if (Surface_corr < 1) Coefficient = 0.3
else if (Surface_corr < 2) Coefficient = 0.5
else if (Surface_corr < 7) Coefficient = 1.0
else Coefficient = 1.5
```

**Step 3: Distribution**
```javascript
if (!Eligible) {
  Distribution_key[c] = 0
} else {
  Distribution_key[c] = Density_corr[c] × Coefficient[c]
                        / Σ(Density_corr[k] × Coefficient[k])
  // k = eligible municipalities only
}
```

---

### Step 3: Apply Budget Weights

Total budget €410,733,862 is distributed using these weights:

| Criterion | Weight | 2024 Budget |
|-----------|--------|-------------|
| 1. Surface area | 2/105 | €7,823,597 |
| 2. Population growth | 6/105 | €23,470,790 |
| 3. Unemployment >1y | 15/105 | €58,676,976 |
| 4. RIS beneficiaries | 15/105 | €58,676,976 |
| 5. Poverty risk | 15/105 | €58,676,976 |
| 6. Daycare places | 1/105 | €3,911,799 |
| 7. School population | 4/105 | €15,647,195 |
| 8. Property tax | 20/105 | €78,235,973 |
| 9. Income tax | 12/105 | €46,941,584 |
| 10. Density | 15/105 | €58,676,976 |
| **TOTAL** | **105/105** | **€410,733,862** |

**Calculated allocation for municipality c:**
```javascript
Calculated[c] = Budget_total × Σ(Weight[i] × Distribution_key[c][i])
// i = each of 10 criteria
```

---

### Step 4: Apply Standstill & Caps

#### Standstill (Floor)
```javascript
Guaranteed[c] = Amount received in year 3 of previous triennium

if (Calculated[c] < Guaranteed[c]) {
  Paid[c] = Guaranteed[c]
  Status[c] = "standstill"
  Reason[c] = "Protection: calculated below guarantee"
}
```

#### Growth Cap (Ceiling)
```javascript
Max_increase_year1 = Guaranteed[c] × 1.04  // +4% max

if (Calculated[c] > Max_increase_year1) {
  Paid[c] = Max_increase_year1
  Status[c] = "capped"
  Reason[c] = "Growth limited to +4%"
}
```

#### Normal (Full Amount)
```javascript
else {
  Paid[c] = Calculated[c]
  Status[c] = "normal"
}
```

---

## Implementation Architecture

### Tech Stack
- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **State:** React hooks (no Redux needed)
- **Testing:** Vitest
- **Deployment:** Vercel/Netlify

### File Structure

```
dotatie-calculator/
├── public/
│   └── data/
│       └── municipalities.json      # Baseline data
├── src/
│   ├── engine/                      # Core calculation logic
│   │   ├── calculator.js            # Main orchestrator
│   │   ├── indicators.js            # Step 1: Calculate indicators
│   │   ├── distributionKeys.js      # Step 2: Distribution keys
│   │   ├── standstill.js            # Step 4: Transition mechanisms
│   │   └── constants.js             # Weights, thresholds
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx
│   │   │   └── Header.jsx
│   │   ├── controls/
│   │   │   ├── MunicipalitySelector.jsx
│   │   │   ├── IndicatorSlider.jsx
│   │   │   └── ControlPanel.jsx
│   │   └── results/
│   │       ├── AllocationTable.jsx
│   │       ├── ComparisonView.jsx
│   │       └── SummaryStats.jsx
│   ├── hooks/
│   │   └── useScenario.js          # State management
│   ├── utils/
│   │   └── formatters.js           # Number formatting
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

---

## Core Implementation: Calculator Engine

### constants.js

```javascript
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
```

### indicators.js

```javascript
/**
 * Calculate all 10 indicators for a municipality
 */
export function calculateIndicators(municipality) {
  const { baseline, tweaks = {} } = municipality;
  
  // Merge baseline with any tweaks
  const data = { ...baseline, ...tweaks };
  
  return {
    // 1. Surface (fixed)
    surface: data.surface_corrected_km2,
    
    // 2. Population growth (fixed)
    populationGrowth: Math.max(0, data.population_growth_10y),
    
    // 3. Unemployment rate (tweakable)
    unemploymentRate: data.long_term_unemployed / data.population_18_64,
    
    // 4. RIS rate (tweakable)
    risRate: data.ris_beneficiaries / data.population_18_64,
    
    // 5. Poverty rate (tweakable via proxy)
    povertyDeclarations: data.tax_declarations_positive * data.poverty_risk_pct,
    povertyRate: data.poverty_risk_pct,
    
    // 6. Daycare rate (fixed)
    daycareRate: data.daycare_places / data.population_0_2,
    
    // 7. School rate (fixed)
    schoolRate: data.school_population / data.population_3_17,
    
    // 8. Property tax (tweakable)
    propertyTaxPerCapita: data.property_tax_per_capita,
    
    // 9. Income tax (tweakable)
    incomeTaxPerCapita: data.income_tax_per_capita,
    
    // 10. Density (fixed)
    correctedDensity: data.population_total / data.surface_corrected_km2,
  };
}
```

### distributionKeys.js

```javascript
/**
 * Calculate distribution key for absolute indicator (surface)
 */
export function calculateAbsoluteKey(municipalities, getValue) {
  const total = municipalities.reduce((sum, m) => sum + getValue(m), 0);
  
  return municipalities.map(m => ({
    id: m.id,
    key: getValue(m) / total,
  }));
}

/**
 * Calculate distribution key for relative indicator (quadratic)
 */
export function calculateRelativeKey(municipalities, getValue) {
  const total = municipalities.reduce((sum, m) => {
    const value = getValue(m);
    const population = m.population_total;
    return sum + (value * value * population);
  }, 0);
  
  return municipalities.map(m => {
    const value = getValue(m);
    const population = m.population_total;
    return {
      id: m.id,
      key: (value * value * population) / total,
    };
  });
}

/**
 * Calculate distribution key for fiscal indicators (eligibility-based)
 */
export function calculateFiscalKey(
  municipalities, 
  getRevenuePerCapita,
  regionalAverage
) {
  const referenceAmount = regionalAverage * 1.5;
  
  // Filter eligible municipalities
  const eligible = municipalities.filter(
    m => getRevenuePerCapita(m) < referenceAmount
  );
  
  if (eligible.length === 0) {
    return municipalities.map(m => ({ id: m.id, key: 0 }));
  }
  
  // Calculate total weighted gap
  const totalWeightedGap = eligible.reduce((sum, m) => {
    const gap = referenceAmount - getRevenuePerCapita(m);
    return sum + (gap * m.population_total);
  }, 0);
  
  return municipalities.map(m => {
    const revenue = getRevenuePerCapita(m);
    
    if (revenue >= referenceAmount) {
      return { id: m.id, key: 0 };
    }
    
    const gap = referenceAmount - revenue;
    return {
      id: m.id,
      key: (gap * m.population_total) / totalWeightedGap,
    };
  });
}

/**
 * Calculate distribution key for density (eligibility + coefficient)
 */
export function calculateDensityKey(municipalities, regionalAverage) {
  const threshold = regionalAverage * 0.75;
  
  // Get coefficient based on surface
  const getCoefficient = (surface) => {
    if (surface < 1) return 0.3;
    if (surface < 2) return 0.5;
    if (surface < 7) return 1.0;
    return 1.5;
  };
  
  // Filter eligible
  const eligible = municipalities.filter(
    m => m.indicators.correctedDensity > threshold
  );
  
  if (eligible.length === 0) {
    return municipalities.map(m => ({ id: m.id, key: 0 }));
  }
  
  // Calculate total weighted density
  const total = eligible.reduce((sum, m) => {
    const coef = getCoefficient(m.surface_corrected_km2);
    return sum + (m.indicators.correctedDensity * coef);
  }, 0);
  
  return municipalities.map(m => {
    if (m.indicators.correctedDensity <= threshold) {
      return { id: m.id, key: 0 };
    }
    
    const coef = getCoefficient(m.surface_corrected_km2);
    return {
      id: m.id,
      key: (m.indicators.correctedDensity * coef) / total,
    };
  });
}
```

### calculator.js

```javascript
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
 */
export function calculateAllocations(municipalities, regionalData) {
  // Step 1: Calculate indicators for all municipalities
  const municipalitiesWithIndicators = municipalities.map(m => ({
    ...m,
    indicators: calculateIndicators(m),
  }));
  
  // Step 2: Calculate distribution keys for each criterion
  const keys = {
    surface: calculateAbsoluteKey(
      municipalitiesWithIndicators,
      m => m.indicators.surface
    ),
    
    populationGrowth: calculateRelativeKey(
      municipalitiesWithIndicators,
      m => m.indicators.populationGrowth
    ),
    
    unemployment: calculateRelativeKey(
      municipalitiesWithIndicators,
      m => m.indicators.unemploymentRate
    ),
    
    ris: calculateRelativeKey(
      municipalitiesWithIndicators,
      m => m.indicators.risRate
    ),
    
    poverty: calculateRelativeKey(
      municipalitiesWithIndicators,
      m => m.indicators.povertyRate
    ),
    
    daycare: calculateRelativeKey(
      municipalitiesWithIndicators,
      m => m.indicators.daycareRate
    ),
    
    schools: calculateRelativeKey(
      municipalitiesWithIndicators,
      m => m.indicators.schoolRate
    ),
    
    propertyTax: calculateFiscalKey(
      municipalitiesWithIndicators,
      m => m.indicators.propertyTaxPerCapita,
      regionalData.averages.property_tax_per_capita
    ),
    
    incomeTax: calculateFiscalKey(
      municipalitiesWithIndicators,
      m => m.indicators.incomeTaxPerCapita,
      regionalData.averages.income_tax_per_capita
    ),
    
    density: calculateDensityKey(
      municipalitiesWithIndicators,
      regionalData.averages.corrected_density
    ),
  };
  
  // Step 3: Calculate provisional allocations
  const results = municipalitiesWithIndicators.map(m => {
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
    const final = applyStandstill(calculated, m.guaranteed_2024);
    
    return {
      id: m.id,
      name: m.name,
      calculated: calculated,
      paid: final.paid,
      difference: final.difference,
      percentChange: final.percentChange,
      status: final.status,
      keys: municipalityKeys,
    };
  });
  
  return results;
}
```

### standstill.js

```javascript
/**
 * Apply standstill mechanism and growth caps
 */
export function applyStandstill(calculated, guaranteed) {
  // Floor: standstill protection
  if (calculated < guaranteed) {
    return {
      paid: guaranteed,
      difference: guaranteed - calculated,
      percentChange: ((guaranteed - calculated) / guaranteed) * 100,
      status: 'standstill',
    };
  }
  
  // Ceiling: growth cap at +4% (year 1 of triennium)
  const maxIncrease = guaranteed * 1.04;
  
  if (calculated > maxIncrease) {
    return {
      paid: maxIncrease,
      difference: calculated - maxIncrease,
      percentChange: 4.0,
      status: 'capped',
    };
  }
  
  // Normal: full calculated amount
  return {
    paid: calculated,
    difference: 0,
    percentChange: ((calculated - guaranteed) / guaranteed) * 100,
    status: 'normal',
  };
}
```

---

## Data Structure

### municipalities.json

```json
{
  "metadata": {
    "year": 2023,
    "total_budget": 410733862,
    "dgc_budget": 383400000,
    "fsas_budget": 27333862
  },
  "regional_averages": {
    "property_tax_per_capita": 82.45,
    "income_tax_per_capita": 485.32,
    "corrected_density": 10234.5
  },
  "municipalities": [
    {
      "id": "anderlecht",
      "name": "Anderlecht",
      "name_nl": "Anderlecht",
      "name_fr": "Anderlecht",
      
      "population_total": 122064,
      "population_0_2": 4521,
      "population_3_17": 22145,
      "population_18_64": 81234,
      "population_65_plus": 14164,
      
      "surface_corrected_km2": 14.00656,
      "population_growth_10y": 0.1208,
      
      "long_term_unemployed": 6071,
      "ris_beneficiaries": 5336,
      "poverty_risk_pct": 0.3800,
      "tax_declarations_positive": 41012,
      
      "daycare_places": 1210,
      "school_population": 25389,
      
      "property_tax_per_capita": 61.70,
      "income_tax_per_capita": 362.98,
      
      "guaranteed_2024": 28455726,
      "calculated_2024": 29494854,
      "paid_2024": 29494854
    }
    // ... 18 more municipalities
  ]
}
```

---

## UI Components

### MunicipalitySelector.jsx

```jsx
export function MunicipalitySelector({ value, onChange, municipalities }) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">
        Select Municipality / Sélectionner commune
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg"
      >
        <option value="">-- Select / Sélectionner --</option>
        {municipalities.map(m => (
          <option key={m.id} value={m.id}>
            {m.name_fr} / {m.name_nl}
          </option>
        ))}
      </select>
    </div>
  );
}
```

### IndicatorSlider.jsx

```jsx
export function IndicatorSlider({ 
  label, 
  value, 
  baseline, 
  min, 
  max, 
  step, 
  unit,
  onChange 
}) {
  const percentChange = ((value - baseline) / baseline) * 100;
  
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-sm text-gray-600">
          {formatValue(value, unit)}
          {percentChange !== 0 && (
            <span className={percentChange > 0 ? 'text-green-600' : 'text-red-600'}>
              {' '}({percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%)
            </span>
          )}
        </span>
      </div>
      
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
      
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Baseline: {formatValue(baseline, unit)}</span>
        <span>Min: {formatValue(min, unit)}</span>
        <span>Max: {formatValue(max, unit)}</span>
      </div>
    </div>
  );
}
```

### AllocationTable.jsx

```jsx
export function AllocationTable({ baseline, scenario }) {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>Municipality</th>
          <th>Calculated (Baseline)</th>
          <th>Calculated (Scenario)</th>
          <th>Change</th>
          <th>Paid (Scenario)</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {scenario.map(s => {
          const b = baseline.find(m => m.id === s.id);
          const calcChange = s.calculated - b.calculated;
          const calcChangePct = (calcChange / b.calculated) * 100;
          
          return (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{formatEuro(b.calculated)}</td>
              <td>{formatEuro(s.calculated)}</td>
              <td className={calcChange > 0 ? 'text-green-600' : 'text-red-600'}>
                {formatEuro(calcChange)} ({calcChangePct.toFixed(2)}%)
              </td>
              <td>{formatEuro(s.paid)}</td>
              <td>
                <StatusBadge status={s.status} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
```

---

## Data Caveats

### 1. Poverty Risk Proxy

**Issue:** Exact number of tax declarations below poverty threshold not available.

**Proxy:**
```javascript
Declarations_under_poverty ≈ Tax_declarations_>0 × Poverty_risk_pct
```

**Impact:** This is an approximation. The actual calculation uses detailed income data per household with weighting factors that we don't have access to.

**UI Note:** Add tooltip: "⚠️ Approximation based on overall poverty risk percentage"

### 2. Age Distribution (2025 vs 2023)

**Issue:** Population age brackets are from 2025, not 2023.

**Impact:** Minimal - age distributions change slowly, and we're calculating relative proportions.

**Mitigation:** Can be updated when 2023 data becomes available.

---

## Development Workflow

### Setup
```bash
npm create vite@latest dotatie-calculator -- --template react
cd dotatie-calculator
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install
```

### Development
```bash
npm run dev
```

### Testing
```bash
npm run test
```

### Build
```bash
npm run build
npm run preview
```

---

## Success Criteria

✅ Baseline calculations match Excel data (within rounding)
✅ Tweaking one municipality recalculates all 19
✅ Standstill/caps work correctly
✅ Total budget always equals €410,733,862
✅ UI is clear and responsive
✅ Performance is smooth (<100ms recalculation)

---

## Next Steps for Claude Code

1. Create project structure with Vite + React
2. Implement calculation engine (calculator.js, indicators.js, etc.)
3. Create basic UI components
4. Load baseline data
5. Test calculations against Excel baseline
6. Build interactive sliders
7. Add results table
8. Polish UI

---

*Document Version: 2.0*  
*Created: 2026-02-03*  
*For: Claude Code Implementation*
