# UX/IA Improvement Specification - Brussels Municipal Allocation Calculator

## Executive Summary

This document translates policy expert feedback into concrete implementation requirements. The current v1 is **functionally correct** but needs structural improvements to match the mental model of policy/administrative users.

**Core Issue:** The interface doesn't clearly show the gap between **calculated allocations** (formula) vs **paid allocations** (after caps/standstill). This is THE key insight for policy analysis.

---

## Critical Changes Required

### 1. REMOVE: Misleading Summary Metrics

**Current (WRONG):**
```
TOTAL BUDGET      | TOTAL CALCULATED | TOTAL PAID
410 733 862 €     | 410 733 862 €    | 276 700 574 €
```

**Problem:** `TOTAL CALCULATED` always equals `TOTAL BUDGET` (it's a redistribution). This is confusing and meaningless for users.

**Action:** Delete the entire top summary section. Replace with new structure below.

---

### 2. NEW: Three-Box Summary Structure

Replace the current summary with three connected metrics:

```
┌────────────────────────────────┐  ┌────────────────────────────────┐  ┌────────────────────────────────┐
│ TOTAL ENVELOPE (COMMUNES)      │  │ TOTAL PAID (AFTER MECHANISMS)  │  │ BLOCKED BY CAPS & STANDSTILL   │
│ 410 733 862 €                  │  │ 276 700 574 €                  │  │ 134 033 288 €                  │
│                                 │  │                                 │  │                                 │
│ Budget available for            │  │ Amount actually distributed    │  │ = Calculated - Paid            │
│ redistribution                  │  │ this year                       │  │                                 │
└────────────────────────────────┘  └────────────────────────────────┘  │ 0 normal | 5 standstill |      │
                                                                         │ 14 capped                       │
                                                                         └────────────────────────────────┘
```

**Implementation:**
```jsx
<div className="grid grid-cols-3 gap-6 mb-8">
  <SummaryCard
    title="Total Envelope (Communes)"
    subtitle="Enveloppe totale (communes) / Totale enveloppe (gemeenten)"
    value={410733862}
    description="Budget available for redistribution"
  />
  
  <SummaryCard
    title="Total Paid (After Mechanisms)"
    subtitle="Total versé (après mécanismes) / Totaal betaald (na mechanismen)"
    value={totalPaid}
    description="Amount actually distributed this year"
  />
  
  <SummaryCard
    title="Blocked by Caps & Standstill"
    subtitle="Bloqué par plafonds & standstill / Geblokkeerd door plafonds & standstill"
    value={410733862 - totalPaid}
    description="= Calculated - Paid"
    statusBreakdown={{
      normal: countNormal,
      standstill: countStandstill,
      capped: countCapped
    }}
  />
</div>
```

---

### 3. IMPROVE: "Impact on [Municipality]" Section

**Current:** Only shows calculated amounts, not the mechanism effect.

**Required:** Split into TWO clear lines:

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Impact on Anderlecht                                                        │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ CALCULATED (FORMULA)                                                       │
│ Baseline: 57 279 300 €  →  Scenario: 56 556 306 €  →  Δ -722 994 € (-1.26%)│
│                                                                             │
│ PAID (AFTER MECHANISM)                                                     │
│ Baseline: 29 593 955 €  →  Scenario: 29 593 955 €  →  Δ 0 € (0%)          │
│                                                                             │
│ ⚠️ This municipality is currently: CAPPED at +4%                           │
│    The calculated decrease cannot be applied due to growth cap protection. │
└────────────────────────────────────────────────────────────────────────────┘
```

**Implementation:**
```jsx
<div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-8">
  <h3 className="text-lg font-bold mb-4">Impact on {selectedMunicipality.name}</h3>
  
  {/* Calculated (Formula) */}
  <div className="mb-4">
    <h4 className="text-sm font-semibold text-gray-700 mb-2">
      CALCULATED (FORMULA)
      <span className="text-xs font-normal ml-2">Calculé (formule) / Berekend (formule)</span>
    </h4>
    <div className="flex items-center gap-4">
      <span>Baseline: {formatEuro(baseline.calculated)}</span>
      <span>→</span>
      <span>Scenario: {formatEuro(scenario.calculated)}</span>
      <span>→</span>
      <span className={getDeltaColor(scenario.calculated - baseline.calculated)}>
        Δ {formatEuro(scenario.calculated - baseline.calculated)} 
        ({formatPercent((scenario.calculated - baseline.calculated) / baseline.calculated)})
      </span>
    </div>
  </div>
  
  {/* Paid (After Mechanism) */}
  <div className="mb-4">
    <h4 className="text-sm font-semibold text-gray-700 mb-2">
      PAID (AFTER MECHANISM)
      <span className="text-xs font-normal ml-2">Versé (après mécanisme) / Betaald (na mechanisme)</span>
    </h4>
    <div className="flex items-center gap-4">
      <span>Baseline: {formatEuro(baseline.paid)}</span>
      <span>→</span>
      <span>Scenario: {formatEuro(scenario.paid)}</span>
      <span>→</span>
      <span className={getDeltaColor(scenario.paid - baseline.paid)}>
        Δ {formatEuro(scenario.paid - baseline.paid)} 
        ({formatPercent((scenario.paid - baseline.paid) / baseline.paid)})
      </span>
    </div>
  </div>
  
  {/* Status Explanation */}
  {scenario.status !== 'normal' && (
    <div className={`text-sm p-3 rounded ${getStatusBgColor(scenario.status)}`}>
      ⚠️ This municipality is currently: <strong>{scenario.status.toUpperCase()}</strong>
      <br />
      {getStatusExplanation(scenario.status, scenario.calculated, scenario.paid)}
    </div>
  )}
</div>
```

---

### 4. CRITICAL: Add "Δ paid" Column to Results Table

**Current columns:**
```
Municipality | Baseline Calc | Scenario Calc | Change | Paid | Status
```

**Required columns:**
```
Municipality | Calculated | Δ calculated | Paid | Δ paid | Mechanism
```

**Why this matters:** Shows "here things change in theory but not in practice"

**Implementation:**
```jsx
<table>
  <thead>
    <tr>
      <th>Municipality / Commune / Gemeente</th>
      <th>Calculated / Calculé / Berekend</th>
      <th>Δ Calculated</th>
      <th>Paid / Versé / Betaald</th>
      <th>Δ Paid</th>
      <th>Mechanism / Mécanisme</th>
    </tr>
  </thead>
  <tbody>
    {results.map(r => {
      const baseline = getBaseline(r.id);
      const deltaCalculated = r.calculated - baseline.calculated;
      const deltaPaid = r.paid - baseline.paid;
      
      return (
        <tr key={r.id}>
          <td>{r.name}</td>
          <td>{formatEuro(r.calculated)}</td>
          <td className="text-neutral-600">
            {formatEuro(deltaCalculated)} ({formatPercent(deltaCalculated / baseline.calculated)})
          </td>
          <td>{formatEuro(r.paid)}</td>
          <td className={getMechanismColor(r.status)}>
            {formatEuro(deltaPaid)} ({formatPercent(deltaPaid / baseline.paid)})
          </td>
          <td>
            <StatusBadge status={r.status} />
          </td>
        </tr>
      );
    })}
  </tbody>
</table>
```

---

### 5. CRITICAL: Fix Color Semantics

**Current (WRONG):** Red/green on all changes
- Red = decrease
- Green = increase

**Problem:** In redistribution, a decrease isn't "bad" and an increase isn't "good". This is semantically wrong for policy analysis.

**Required Color Logic:**

```javascript
// For Δ calculated and Δ paid
function getDeltaColor(delta) {
  // Use NEUTRAL colors - it's just information
  return 'text-gray-700';
}

// ONLY use warning colors for mechanism blocks
function getMechanismColor(status) {
  if (status === 'capped') return 'text-orange-600';
  if (status === 'standstill') return 'text-gray-500';
  return 'text-green-600'; // normal = no blocking
}

// Status badges
function getStatusBadgeClass(status) {
  if (status === 'capped') return 'bg-orange-100 text-orange-800';
  if (status === 'standstill') return 'bg-gray-100 text-gray-800';
  return 'bg-green-100 text-green-800';
}
```

**DO NOT use red/green on euro differences.** Only use color to indicate mechanism blocking.

---

### 6. GROUP Indicators by Logic

**Current:** All 5 sliders in one flat list.

**Required:** Group by policy domain with collapsible sections.

```jsx
<Accordion defaultExpanded={['social']}>
  <AccordionSection id="social" title="Social Indicators / Indicateurs sociaux">
    <IndicatorSlider
      id="long_term_unemployed"
      label="Long-term Unemployed (used in formula)"
      sublabel="Chômeurs longue durée (>1 an, 18-64) / Langdurig werklozen"
      tooltip="Scenario value replaces official 2023 reference value"
      {...props}
    />
    <IndicatorSlider
      id="ris_beneficiaries"
      label="Living Wage Beneficiaries - RIS (used in formula)"
      {...props}
    />
    <IndicatorSlider
      id="poverty_risk_pct"
      label="Poverty Risk (used in formula)"
      {...props}
    />
  </AccordionSection>
  
  <AccordionSection id="fiscal" title="Fiscal Indicators / Indicateurs fiscaux">
    <IndicatorSlider
      id="property_tax_per_capita"
      label="Property Tax Revenue (used in formula)"
      {...props}
    />
    <IndicatorSlider
      id="income_tax_per_capita"
      label="Income Tax Revenue (used in formula)"
      {...props}
    />
  </AccordionSection>
  
  <AccordionSection id="demographic" title="Demographic / Démographie" disabled>
    <InfoDisplay label="Population Growth" value={data.population_growth_10y} />
    <InfoDisplay label="School Population" value={data.school_population} />
    <InfoDisplay label="Daycare Places" value={data.daycare_places} />
    <p className="text-sm text-gray-600">These indicators are not adjustable in this scenario.</p>
  </AccordionSection>
  
  <AccordionSection id="territorial" title="Territorial / Territorial" disabled>
    <InfoDisplay label="Density (corrected)" value={data.density_corrected} />
    <InfoDisplay label="Surface (corrected)" value={data.surface_corrected_km2} />
    <p className="text-sm text-gray-600">Fixed geographic attributes.</p>
  </AccordionSection>
</Accordion>
```

---

### 7. NEW FEATURE: Allocation Breakdown for Selected Municipality

**This is the killer feature for policy users.**

Show HOW the calculated amount is composed from the 10 criteria.

```jsx
<div className="bg-white border rounded-lg p-6 mt-6">
  <h3 className="text-lg font-bold mb-4">
    Calculated Amount - Composition
    <span className="text-sm font-normal ml-2">
      Montant calculé - composition / Berekend bedrag - samenstelling
    </span>
  </h3>
  
  <table className="w-full text-sm">
    <thead>
      <tr>
        <th className="text-left">Criterion</th>
        <th className="text-right">Weight</th>
        <th className="text-right">Distribution Key</th>
        <th className="text-right">Contribution</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Surface area</td>
        <td className="text-right">2/105</td>
        <td className="text-right">{formatPercent(keys.surface)}</td>
        <td className="text-right">{formatEuro(contribution.surface)}</td>
      </tr>
      <tr>
        <td>Population growth</td>
        <td className="text-right">6/105</td>
        <td className="text-right">{formatPercent(keys.populationGrowth)}</td>
        <td className="text-right">{formatEuro(contribution.populationGrowth)}</td>
      </tr>
      <tr className="bg-blue-50">
        <td><strong>Unemployment >1y</strong></td>
        <td className="text-right">15/105</td>
        <td className="text-right">{formatPercent(keys.unemployment)}</td>
        <td className="text-right"><strong>{formatEuro(contribution.unemployment)}</strong></td>
      </tr>
      <tr className="bg-blue-50">
        <td><strong>RIS beneficiaries</strong></td>
        <td className="text-right">15/105</td>
        <td className="text-right">{formatPercent(keys.ris)}</td>
        <td className="text-right"><strong>{formatEuro(contribution.ris)}</strong></td>
      </tr>
      <tr className="bg-blue-50">
        <td><strong>Poverty risk</strong></td>
        <td className="text-right">15/105</td>
        <td className="text-right">{formatPercent(keys.poverty)}</td>
        <td className="text-right"><strong>{formatEuro(contribution.poverty)}</strong></td>
      </tr>
      <tr>
        <td>Daycare places</td>
        <td className="text-right">1/105</td>
        <td className="text-right">{formatPercent(keys.daycare)}</td>
        <td className="text-right">{formatEuro(contribution.daycare)}</td>
      </tr>
      <tr>
        <td>School population</td>
        <td className="text-right">4/105</td>
        <td className="text-right">{formatPercent(keys.schools)}</td>
        <td className="text-right">{formatEuro(contribution.schools)}</td>
      </tr>
      <tr className="bg-blue-50">
        <td><strong>Property tax capacity</strong></td>
        <td className="text-right">20/105</td>
        <td className="text-right">{formatPercent(keys.propertyTax)}</td>
        <td className="text-right"><strong>{formatEuro(contribution.propertyTax)}</strong></td>
      </tr>
      <tr className="bg-blue-50">
        <td><strong>Income tax capacity</strong></td>
        <td className="text-right">12/105</td>
        <td className="text-right">{formatPercent(keys.incomeTax)}</td>
        <td className="text-right"><strong>{formatEuro(contribution.incomeTax)}</strong></td>
      </tr>
      <tr>
        <td>Population density</td>
        <td className="text-right">15/105</td>
        <td className="text-right">{formatPercent(keys.density)}</td>
        <td className="text-right">{formatEuro(contribution.density)}</td>
      </tr>
      <tr className="border-t-2 font-bold">
        <td>TOTAL CALCULATED</td>
        <td className="text-right">105/105</td>
        <td></td>
        <td className="text-right">{formatEuro(totalCalculated)}</td>
      </tr>
    </tbody>
  </table>
  
  <p className="text-xs text-gray-600 mt-4">
    Highlighted rows = tweakable indicators in this scenario
  </p>
</div>
```

**Data Required:** The calculator already computes this in `calculateAllocations()`. Just expose the intermediate `keys` and `contributions` objects.

```javascript
// In calculator.js, return additional data:
return {
  municipalities: results,
  breakdowns: municipalities.map(m => ({
    id: m.id,
    keys: municipalityKeys[m.id],
    contributions: {
      surface: TOTAL_BUDGET * WEIGHTS.SURFACE * municipalityKeys[m.id].surface,
      unemployment: TOTAL_BUDGET * WEIGHTS.UNEMPLOYMENT * municipalityKeys[m.id].unemployment,
      // ... etc
    }
  }))
};
```

---

### 8. Text Improvements on Sliders

**Current label:**
```
Long-term Unemployed
```

**Required label:**
```
Long-term Unemployed (used in formula)
Chômeurs longue durée (>1 an, 18-64) / Langdurig werklozen
```

**Tooltip text:**
```
Scenario value replaces official 2023 reference value.
The calculation uses this tweaked value for THIS municipality only.
All other municipalities use their official 2023 values.
```

This prevents misinterpretation.

---

## Implementation Checklist

### Phase 1: Critical Fixes (Must Have)
- [ ] Remove misleading "TOTAL CALCULATED" metric
- [ ] Add new 3-box summary (Envelope / Paid / Blocked)
- [ ] Add status distribution to "Blocked" box
- [ ] Split "Impact on [Municipality]" into Calculated + Paid rows
- [ ] Add "Δ paid" column to results table
- [ ] Fix color semantics (neutral for deltas, color only for mechanisms)

### Phase 2: UX Improvements (Should Have)
- [ ] Group indicators into collapsible sections (Social / Fiscal / Demographic / Territorial)
- [ ] Add "(used in formula)" to all slider labels
- [ ] Improve tooltip text with "Scenario value replaces official 2023 reference"
- [ ] Show mechanism explanation in "Impact" section

### Phase 3: Killer Feature (Nice to Have, but VERY valuable)
- [ ] Add "Allocation Breakdown" table showing contribution per criterion
- [ ] Highlight tweakable rows in breakdown
- [ ] Expose `keys` and `contributions` from calculator

---

## Code Structure Changes

### New/Modified Components

1. **`SummaryCards.jsx`** (new)
   - Three-box layout
   - Envelope / Paid / Blocked
   - Status distribution in Blocked card

2. **`MunicipalityImpact.jsx`** (modified)
   - Split into Calculated + Paid sections
   - Add mechanism explanation
   - Show baseline → scenario → Δ for both

3. **`AllocationTable.jsx`** (modified)
   - Add "Δ Paid" column
   - Update column headers
   - Apply new color logic

4. **`IndicatorControls.jsx`** (modified)
   - Group into Accordion sections
   - Update labels with "(used in formula)"
   - Update tooltips

5. **`AllocationBreakdown.jsx`** (new)
   - Show 10 criteria with weights, keys, contributions
   - Highlight tweakable rows
   - Display total

### Calculator Modifications

```javascript
// In calculator.js, return additional breakdown data
export function calculateAllocations(municipalities, regionalData) {
  // ... existing calculation logic
  
  // NEW: Store intermediate values for breakdown
  const breakdowns = municipalitiesWithIndicators.map(m => {
    const keys = getKeysForMunicipality(m.id, allKeys);
    const contributions = {
      surface: TOTAL_BUDGET * WEIGHTS.SURFACE * keys.surface,
      populationGrowth: TOTAL_BUDGET * WEIGHTS.POPULATION_GROWTH * keys.populationGrowth,
      unemployment: TOTAL_BUDGET * WEIGHTS.UNEMPLOYMENT * keys.unemployment,
      ris: TOTAL_BUDGET * WEIGHTS.RIS * keys.ris,
      poverty: TOTAL_BUDGET * WEIGHTS.POVERTY * keys.poverty,
      daycare: TOTAL_BUDGET * WEIGHTS.DAYCARE * keys.daycare,
      schools: TOTAL_BUDGET * WEIGHTS.SCHOOLS * keys.schools,
      propertyTax: TOTAL_BUDGET * WEIGHTS.PROPERTY_TAX * keys.propertyTax,
      incomeTax: TOTAL_BUDGET * WEIGHTS.INCOME_TAX * keys.incomeTax,
      density: TOTAL_BUDGET * WEIGHTS.DENSITY * keys.density,
    };
    
    return {
      id: m.id,
      keys,
      contributions,
    };
  });
  
  return {
    municipalities: results,
    breakdowns,  // NEW
    totals: {
      envelope: TOTAL_BUDGET,
      calculated: totalCalculated,
      paid: totalPaid,
      blocked: totalCalculated - totalPaid,  // NEW
    },
  };
}
```

---

## Visual Hierarchy Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER: Brussels Municipal Allocation Calculator                    │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────────────────────────────┐
│ Envelope     │ Paid         │ Blocked by Mechanisms                │
│ 410.7M €     │ 276.7M €     │ 134M €                               │
│              │              │ 0 normal | 5 standstill | 14 capped  │
└──────────────┴──────────────┴──────────────────────────────────────┘

┌────────────────────────┬────────────────────────────────────────────┐
│ CONTROLS               │ RESULTS                                     │
│                        │                                             │
│ Select Municipality    │ Impact on [Municipality]                   │
│ [Anderlecht      ▼]    │ ┌─────────────────────────────────────┐   │
│                        │ │ CALCULATED (FORMULA)                 │   │
│ Adjust Indicators      │ │ Baseline → Scenario → Δ             │   │
│                        │ │                                      │   │
│ ▼ Social               │ │ PAID (AFTER MECHANISM)              │   │
│   • Unemployment       │ │ Baseline → Scenario → Δ             │   │
│   • RIS                │ │                                      │   │
│   • Poverty            │ │ ⚠️ Mechanism: CAPPED                │   │
│                        │ └─────────────────────────────────────┘   │
│ ▼ Fiscal               │                                             │
│   • Property tax       │ Allocation Results (All 19)                │
│   • Income tax         │ ┌─────────────────────────────────────┐   │
│                        │ │ Municipality | Calc | Δ | Paid | Δ  │   │
│ ▶ Demographic          │ │ ...                                 │   │
│ ▶ Territorial          │ └─────────────────────────────────────┘   │
│                        │                                             │
│ [Reset to Baseline]    │ Allocation Breakdown (Selected Muni)       │
│                        │ ┌─────────────────────────────────────┐   │
│                        │ │ Criterion | Weight | Key | € Contrib│   │
│                        │ │ ...                                 │   │
│                        │ └─────────────────────────────────────┘   │
└────────────────────────┴────────────────────────────────────────────┘
```

---

## Success Criteria

✅ User immediately sees "blocked" amount (formula vs reality gap)
✅ Calculated vs Paid is clearly separated everywhere
✅ Color only indicates mechanism blocking, not value direction
✅ User can see WHY a municipality gets its allocation (breakdown)
✅ Indicators are logically grouped by policy domain
✅ No misleading metrics (TOTAL CALCULATED removed)

---

## Notes for Implementation

1. **Priority order:**
   - First: Fix summary boxes and add "Blocked" metric
   - Second: Add Δ paid column to table
   - Third: Split Impact section into Calculated + Paid
   - Fourth: Fix colors (neutral deltas)
   - Fifth: Add breakdown table
   - Sixth: Group indicators

2. **Don't touch:**
   - Calculation logic (it's correct)
   - Slider functionality (it works)
   - Data structure (it's fine)

3. **This is NOT about "making it prettier":**
   - It's about making the POLICY LOGIC visible
   - Formula vs Reality is the core story
   - Blocked amount is the killer metric

---

*Specification Version: 1.0*  
*Based on: Policy expert feedback 2026-02-03*  
*Target: Brussels Municipal Allocation Calculator v2*
