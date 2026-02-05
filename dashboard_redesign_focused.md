# Dashboard Redesign: Focus on Single Story

## Core Problem

Current dashboard tries to show too many layers simultaneously:
- Macro (total envelope)
- Meso (all 19 municipalities)
- Micro (one municipality)
- Mechanisms
- Controls

**This is cognitively overloaded.**

---

## The Single Story

### What the first screen MUST communicate:

> **The formula moves, but the money doesn't.**

Everything else is secondary exploration.

---

## Page 1: Dashboard (Primary View)

### Keep Only These 3 Elements

#### 1. Three Summary Cards (PERFECT - Keep Exactly As Designed)

```
┌──────────────────────┬──────────────────────┬────────────────────────────┐
│ TOTAL ENVELOPE       │ TOTAL PAID           │ BLOCKED BY CAPS/STANDSTILL │
│ (COMMUNES)           │ (AFTER MECHANISMS)   │                            │
│                      │                      │                            │
│ 410 733 862 €        │ 276 700 574 €        │ 134 033 288 €              │
│                      │                      │                            │
│ Budget available for │ Amount actually      │ Share of the envelope that │
│ redistribution       │ distributed this year│ cannot react to new data   │
│                      │                      │                            │
│                      │                      │ 0 normal | 5 standstill |  │
│                      │                      │ 14 capped                  │
└──────────────────────┴──────────────────────┴────────────────────────────┘
```

**NEW Addition:** Add explanatory text to "Blocked" card:
```
"Share of the envelope that cannot react to new data"
```

This makes it politically comprehensible.

---

#### 2. Impact on Selected Municipality (SIMPLIFIED)

**Remove:**
- ❌ Separate "Calculated (formula)" and "Paid (after mechanism)" as distinct cards
- ❌ Separate labels "Baseline / Scenario / Δ Change" under each metric
- ❌ Visual arrows (→) between values
- ❌ Long explanatory paragraphs

**Replace with:** Simple 2-row table

```
┌────────────────────────────────────────────────────────────────┐
│ Impact on Anderlecht                                            │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│                 Baseline         Scenario           Δ          │
│ ─────────────────────────────────────────────────────────────  │
│ Calculated    22 692 701 €     23 236 609 €     +543 908 €    │
│ Paid          13 763 950 €     13 763 950 €          0 €      │
│                                                                 │
│ Mechanism: Capped (+4%)                                        │
└────────────────────────────────────────────────────────────────┘
```

**Implementation:**
```jsx
<div className="bg-white border rounded-lg p-6">
  <h3 className="text-lg font-semibold mb-4">
    Impact on {selectedMunicipality.name}
  </h3>
  
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b">
        <th className="text-left pb-2"></th>
        <th className="text-right pb-2">Baseline</th>
        <th className="text-right pb-2">Scenario</th>
        <th className="text-right pb-2">Δ</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b">
        <td className="py-3 font-medium">Calculated</td>
        <td className="text-right">{formatEuro(baseline.calculated)}</td>
        <td className="text-right">{formatEuro(scenario.calculated)}</td>
        <td className="text-right text-gray-700">
          {formatEuro(scenario.calculated - baseline.calculated)}
        </td>
      </tr>
      <tr>
        <td className="py-3 font-medium">Paid</td>
        <td className="text-right">{formatEuro(baseline.paid)}</td>
        <td className="text-right">{formatEuro(scenario.paid)}</td>
        <td className="text-right text-gray-700">
          {formatEuro(scenario.paid - baseline.paid)}
        </td>
      </tr>
    </tbody>
  </table>
  
  <div className="mt-4">
    <span className="text-sm font-medium">Mechanism: </span>
    <StatusBadge status={scenario.status} />
  </div>
</div>
```

---

#### 3. Control Sliders (COLLAPSED by Default)

**Keep only TWO groups:**
- Social indicators (3 sliders)
- Fiscal indicators (2 sliders)

**Default state:** CLOSED

**Remove from Page 1:**
- ❌ Demographic indicators
- ❌ Territorial indicators

These go to an "About" page, NOT the dashboard.

```jsx
<div className="bg-white border rounded-lg p-6">
  <h3 className="text-lg font-semibold mb-4">Adjust Indicators</h3>
  
  <Accordion>
    <AccordionItem 
      title="Social Indicators" 
      defaultOpen={false}
      badge="3"
    >
      <IndicatorSlider id="long_term_unemployed" {...props} />
      <IndicatorSlider id="ris_beneficiaries" {...props} />
      <IndicatorSlider id="poverty_risk_pct" {...props} />
    </AccordionItem>
    
    <AccordionItem 
      title="Fiscal Indicators" 
      defaultOpen={false}
      badge="2"
    >
      <IndicatorSlider id="property_tax_per_capita" {...props} />
      <IndicatorSlider id="income_tax_per_capita" {...props} />
    </AccordionItem>
  </Accordion>
  
  <button className="mt-4 text-sm text-blue-600">
    Reset to baseline
  </button>
</div>
```

**User flow:** The user must first **look**, then **adjust**.

---

### REMOVE from Page 1

#### ❌ 4. Full Municipality Table

**Why remove:** This is exploration, not the core message.

**Move to:** Separate page "All Municipalities" (see Page 2 design below)

#### ❌ 5. Demographic & Territorial Sections

**Why remove:** On Page 1, they only say "not adjustable" - completely useless.

**Move to:** "About this tool" page with:
- Explanation of the 10 criteria
- Which are tweakable vs fixed
- Data sources and limitations

#### ❌ 6. Multi-language Subtitles Everywhere

**Current problem:** EN/FR/NL shown simultaneously on every component = visual overload

**Solution:** 
- Add language toggle at top: `[NL] [FR]`
- Show ONLY ONE language at a time
- Generate separate NL and FR versions of the entire interface

```jsx
// Top-right corner
<LanguageToggle value={language} onChange={setLanguage}>
  <option value="nl">Nederlands</option>
  <option value="fr">Français</option>
</LanguageToggle>

// Then in components, use i18n:
<h3>{t('impact_on')} {selectedMunicipality.name}</h3>
```

#### ❌ 7. Repeated "Baseline → Scenario → Δ" Labels

**Current:** Shown 4+ times with arrows

**Solution:** Use table headers ONCE:
```
          Baseline    Scenario    Δ
```

Less words, same meaning.

---

## Page 1 Layout - Final Design

```
┌─────────────────────────────────────────────────────────────────────┐
│ Brussels Municipal Allocation Calculator              [NL] [FR]     │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────────────────┐
│ TOTAL ENVELOPE   │ TOTAL PAID       │ BLOCKED BY CAPS/STANDSTILL   │
│ 410 733 862 €    │ 276 700 574 €    │ 134 033 288 €                │
│                  │                  │ Share of envelope that cannot│
│                  │                  │ react to new data            │
│                  │                  │ 0 normal│5 standstill│14 cap│
└──────────────────┴──────────────────┴──────────────────────────────┘

┌──────────────────────────┬─────────────────────────────────────────┐
│                          │                                         │
│ Select Municipality      │ Impact on Anderlecht                    │
│ [Anderlecht         ▼]   │                                         │
│                          │           Baseline  Scenario      Δ    │
│ Adjust Indicators        │ ─────────────────────────────────────  │
│                          │ Calculated  22.7M €   23.2M €   +0.5M €│
│ ▶ Social (3)             │ Paid        13.8M €   13.8M €      0 € │
│ ▶ Fiscal (2)             │                                         │
│                          │ Mechanism: Capped (+4%)                 │
│ [Reset to baseline]      │                                         │
│                          ├─────────────────────────────────────────┤
│                          │ [View all municipalities →]             │
└──────────────────────────┴─────────────────────────────────────────┘
```

**The story is now clear:**

1️⃣ How much money exists  
2️⃣ How much actually moves  
3️⃣ What that means for your municipality  
4️⃣ Why it's stuck  

Everything else is **exploration**, not **communication**.

---

## Page 2: All Municipalities (Exploration View)

**Purpose:** Deep dive into all 19 municipalities for comparison and analysis.

**Access:** Click "View all municipalities →" button on dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│ All Municipalities - Detailed Results              [← Back] [NL][FR]│
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Filters & Sorting                                                    │
│ Sort by: [Calculated Δ ▼]  Status: [All ▼]  Search: [_________]    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Municipality      │ Calculated │ Δ Calc  │ Paid      │ Δ Paid│Status│
├───────────────────┼────────────┼─────────┼───────────┼───────┼──────┤
│ 🔵 Anderlecht     │ 23.2M €    │ +0.5M € │ 13.8M €   │ 0 €   │Capped│
│    Auderghem      │ 2.9M €     │ +8k €   │ 5.2M €    │ 0 €   │Stand.│
│    Berchem-SteA.  │ ...        │ ...     │ ...       │ ...   │ ...  │
│ ...               │ ...        │ ...     │ ...       │ ...   │ ...  │
└─────────────────────────────────────────────────────────────────────┘

🔵 = Currently selected municipality
```

**This is where complexity is ALLOWED:**
- Full table with all municipalities
- Sorting by any column
- Filtering by status
- Search functionality

**Here it's exploration, so it can be busy.**

---

## Page 3: About This Tool

**Purpose:** Context, methodology, limitations

**Content:**
- How the allocation formula works
- The 10 criteria explained
- Which are tweakable (5) vs fixed (5)
- Data sources and caveats
- Standstill & cap mechanisms explained

**Includes:**
- Demographic indicators (info only)
- Territorial indicators (info only)
- Links to legal texts
- Contact/feedback

---

## Navigation Structure

```
┌─────────────────────────────────────────┐
│ [Dashboard] [All Municipalities] [About]│
└─────────────────────────────────────────┘
```

Simple 3-page structure:
1. **Dashboard** = The story (focus)
2. **All Municipalities** = Exploration (detail)
3. **About** = Context (reference)

---

## Implementation Changes Summary

### Dashboard.jsx (Page 1)

**Keep:**
- 3 summary cards (add "cannot react to new data" text)
- Municipality selector
- Simplified impact table (2 rows × 3 cols)
- Collapsed control sliders (2 groups only)

**Remove:**
- Full municipality table → Move to Page 2
- Demographic/Territorial sections → Move to Page 3
- Multi-language subtitles → Use single language toggle
- Repeated arrows/labels → Use table headers once

**Add:**
- "View all municipalities →" button
- Language toggle (NL/FR)

### AllMunicipalities.jsx (Page 2) - NEW

**Create new page with:**
- Full table (all 19 municipalities)
- Sorting controls
- Status filters
- Search functionality
- Back button to dashboard

### About.jsx (Page 3) - NEW

**Create new page with:**
- Methodology explanation
- All 10 criteria described
- Fixed indicators shown as info
- Data caveats
- Legal references

---

## Visual Weight Reduction

### Before (too heavy):
- 4 languages visible simultaneously
- 2 large cards for calculated/paid
- Arrows and labels repeated everywhere
- All 10 indicators visible
- Full table on same page

### After (focused):
- 1 language at a time
- 1 compact table (2×3)
- Labels used once in headers
- 2 indicator groups, collapsed
- Table on separate page

**Result:** User can focus on THE STORY, not navigate complexity.

---

## Critical Addition: "Blocked" Card Text

Current text:
```
BLOCKED BY CAPS & STANDSTILL
134 033 288 €
```

**ADD below the amount:**
```
Share of the envelope that cannot react to new data
```

**Why this matters:** Makes it politically comprehensible. This is not technical jargon, it's a POLICY CONSTRAINT.

**Implementation:**
```jsx
<SummaryCard
  title="Blocked by Caps & Standstill"
  value={blockedAmount}
  description="Share of the envelope that cannot react to new data"
  statusBreakdown={{
    normal: 0,
    standstill: 5,
    capped: 14
  }}
/>
```

---

## User Journey

### First Visit
1. User lands on dashboard
2. Sees 3 cards: envelope / paid / blocked ← **the gap is immediately visible**
3. Selects municipality from dropdown
4. Sees impact: calculated vs paid ← **sees mechanism in action**
5. (Optional) Opens sliders to tweak
6. (Optional) Clicks "View all" to explore

### The Insight Happens in Steps 2-4
The user doesn't need to adjust anything to **understand** the problem.

The sliders are for **exploration**, not for **communication**.

---

## Success Criteria for Redesign

✅ **Under 10 seconds:** User understands "formula moves, money doesn't"  
✅ **Zero scrolling needed:** All key info visible in viewport  
✅ **One mental layer:** Dashboard tells ONE story  
✅ **Clear hierarchy:** Story → Exploration → Reference  
✅ **Language clarity:** One language at a time  
✅ **Visual calm:** Reduced repetition and visual noise  

---

## Implementation Priority

### Phase 1: Critical Simplification
1. Remove full table from dashboard → create Page 2
2. Simplify impact section to 2×3 table
3. Collapse indicator sections by default
4. Add "cannot react to new data" text to Blocked card

### Phase 2: Language System
1. Add language toggle (NL/FR)
2. Implement i18n for all text
3. Remove redundant multi-language labels

### Phase 3: Navigation
1. Create Page 2: All Municipalities
2. Create Page 3: About
3. Add navigation menu
4. Add "View all →" button on dashboard

---

## Code Structure

```
src/
├── pages/
│   ├── Dashboard.jsx           # Page 1 - The Story (SIMPLIFIED)
│   ├── AllMunicipalities.jsx   # Page 2 - Exploration (NEW)
│   └── About.jsx                # Page 3 - Reference (NEW)
├── components/
│   ├── SummaryCards.jsx         # 3 cards (add new text)
│   ├── MunicipalityImpact.jsx   # Simplified 2×3 table
│   ├── ControlPanel.jsx         # Collapsed sliders
│   └── LanguageToggle.jsx       # NL/FR switcher (NEW)
├── i18n/
│   ├── nl.json                  # Dutch translations (NEW)
│   └── fr.json                  # French translations (NEW)
└── App.jsx                      # Router setup
```

---

## Final Note: What We're NOT Doing

❌ Adding more data  
❌ Adding more visualizations  
❌ Adding more explanations  

✅ **We're REMOVING everything that doesn't support the core story.**

The power is in the focus.

---

*Specification Version: 2.0 - Focused Story Edition*  
*Created: 2026-02-03*  
*Principle: Single Mental Layer*
