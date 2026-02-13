# Lineup Feature Visual Guide

## Overview

This document provides visual representations of the redesigned lineup feature, including UI mockups, data flow diagrams, and algorithm visualizations.

## 1. Bottle Series Generation UI

### Series Generator Panel

```
┌─────────────────────────────────────────────────────────┐
│  Bottle Series Generator                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Algorithm Selection:                                    │
│  ○ Linear Progression                                    │
│  ● Golden Ratio                                          │
│  ○ Logarithmic Scale                                     │
│                                                          │
│  Volume Range:                                           │
│  Min: [65] mL    Max: [700] mL                          │
│  ├────────────────────────────────────────────┤         │
│                                                          │
│  Number of Bottles: [5]                                  │
│  ├─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┤     │
│  3     4     5     6     7     8     9     10           │
│                                                          │
│  Base Template:                                          │
│  [Boston Round ▼]                                        │
│                                                          │
│  Fill Range:                                             │
│  Min: [65]%    Max: [85]%                               │
│  ├────────────────────────────────────────────┤         │
│                                                          │
│  [Generate Series]                                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Generated Bottles Display

```
┌─────────────────────────────────────────────────────────┐
│  Generated Series: "Golden Ratio Series"                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  3D Shelf View:                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │                                                 │    │
│  │    ▓     ▓▓     ▓▓▓     ▓▓▓▓     ▓▓▓▓▓        │    │
│  │   ▓▓▓   ▓▓▓▓   ▓▓▓▓▓   ▓▓▓▓▓▓   ▓▓▓▓▓▓▓       │    │
│  │   ▓▓▓   ▓▓▓▓   ▓▓▓▓▓   ▓▓▓▓▓▓   ▓▓▓▓▓▓▓       │    │
│  │   ▓▓▓   ▓▓▓▓   ▓▓▓▓▓   ▓▓▓▓▓▓   ▓▓▓▓▓▓▓       │    │
│  │  ═════ ═══════ ═══════ ═══════ ═════════      │    │
│  │  65ml   105ml   170ml   275ml    445ml         │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  List View:                                              │
│  ┌────────────────────────────────────────────────┐    │
│  │ Bottle 1 │ 65ml  │ 42-55ml │ Boston Round      │    │
│  │ Bottle 2 │ 105ml │ 68-89ml │ Boston Round      │    │
│  │ Bottle 3 │ 170ml │ 111-145ml│ Boston Round     │    │
│  │ Bottle 4 │ 275ml │ 179-234ml│ Boston Round     │    │
│  │ Bottle 5 │ 445ml │ 289-378ml│ Boston Round     │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  [Batch Edit] [Individual Edit] [Save Series]           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 2. Fill Range Visualization

### Single Bottle Fill Range

```
Bottle: 200 mL Capacity

Fill Percentage Scale:
0%    25%    50%    65%    75%    85%    100%
├──────┼──────┼──────┼──────┼──────┼──────┤
                      ▓▓▓▓▓▓▓▓▓▓▓▓▓▓
                      │      │      │
                      130ml  150ml  170ml
                      Min    Target Max
                      
Recommended Fill Range: 130-170 mL (65-85%)
Target Fill: 150 mL (75%)
```

### Series Fill Range Coverage

```
Series: 5 Bottles (65-445 mL)

Volume Coverage Map:
0     100    200    300    400    500 mL
├──────┼──────┼──────┼──────┼──────┤

Bottle 1 (65ml):  ▓▓▓
                  42-55ml

Bottle 2 (105ml):     ▓▓▓▓
                      68-89ml

Bottle 3 (170ml):          ▓▓▓▓▓▓
                           111-145ml

Bottle 4 (275ml):                  ▓▓▓▓▓▓▓▓▓
                                   179-234ml

Bottle 5 (445ml):                            ▓▓▓▓▓▓▓▓▓▓▓▓
                                             289-378ml

Coverage: 42-378 mL (336 mL range)
Gaps: 55-68ml (13ml), 89-111ml (22ml), 145-179ml (34ml)
```

## 3. Comparison Visualization

### Two Series Comparison Chart

```
┌─────────────────────────────────────────────────────────┐
│  Series Comparison: Linear vs Golden Ratio              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Volume Range: 0 - 500 mL                               │
│                                                          │
│  Linear Series:                                          │
│  ▓▓▓▓▓  ▓▓▓▓▓▓  ▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓▓▓           │
│  65-85  165-185 265-285  365-385   465-485             │
│                                                          │
│  Gaps:                                                   │
│       ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░       │
│       85-165    185-265  285-365   385-465             │
│                                                          │
│  Golden Ratio:                                           │
│  ▓▓▓▓  ▓▓▓▓▓  ▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓▓▓▓▓▓▓       │
│  42-55 68-89  111-145  179-234     289-378             │
│                                                          │
│  Overlaps:                                               │
│  ████                                                    │
│  42-55 (Both series cover this range)                   │
│                                                          │
│  Coverage Analysis:                                      │
│  Linear:  45% coverage (4 major gaps)                   │
│  Golden:  67% coverage (3 moderate gaps)                │
│  Combined: 82% coverage (2 minor gaps)                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Detailed Comparison Table

```
┌──────────────────────────────────────────────────────────────────┐
│  Detailed Coverage Comparison                                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Series 1: Linear Progression                                     │
│  ┌────────┬─────────┬──────────┬────────────┬──────────────┐    │
│  │ Bottle │ Volume  │ Min Fill │ Target Fill│ Max Fill     │    │
│  ├────────┼─────────┼──────────┼────────────┼──────────────┤    │
│  │ 1      │ 75 mL   │ 49 mL    │ 56 mL      │ 64 mL        │    │
│  │ 2      │ 175 mL  │ 114 mL   │ 131 mL     │ 149 mL       │    │
│  │ 3      │ 275 mL  │ 179 mL   │ 206 mL     │ 234 mL       │    │
│  │ 4      │ 375 mL  │ 244 mL   │ 281 mL     │ 319 mL       │    │
│  │ 5      │ 475 mL  │ 309 mL   │ 356 mL     │ 404 mL       │    │
│  └────────┴─────────┴──────────┴────────────┴──────────────┘    │
│                                                                   │
│  ⚠ GAP: 64-114 mL (50 mL gap) - MAJOR                           │
│  ⚠ GAP: 149-179 mL (30 mL gap) - MODERATE                       │
│  ⚠ GAP: 234-244 mL (10 mL gap) - MINOR                          │
│  ⚠ GAP: 319-309 mL - OVERLAP (bottles too close)                │
│                                                                   │
│  Series 2: Golden Ratio                                          │
│  ┌────────┬─────────┬──────────┬────────────┬──────────────┐    │
│  │ Bottle │ Volume  │ Min Fill │ Target Fill│ Max Fill     │    │
│  ├────────┼─────────┼──────────┼────────────┼──────────────┤    │
│  │ 1      │ 65 mL   │ 42 mL    │ 49 mL      │ 55 mL        │    │
│  │ 2      │ 105 mL  │ 68 mL    │ 79 mL      │ 89 mL        │    │
│  │ 3      │ 170 mL  │ 111 mL   │ 128 mL     │ 145 mL       │    │
│  │ 4      │ 275 mL  │ 179 mL   │ 206 mL     │ 234 mL       │    │
│  │ 5      │ 445 mL  │ 289 mL   │ 334 mL     │ 378 mL       │    │
│  └────────┴─────────┴──────────┴────────────┴──────────────┘    │
│                                                                   │
│  ⚠ GAP: 55-68 mL (13 mL gap) - MINOR                            │
│  ⚠ GAP: 89-111 mL (22 mL gap) - MODERATE                        │
│  ⚠ GAP: 145-179 mL (34 mL gap) - MODERATE                       │
│                                                                   │
│  Recommendations:                                                 │
│  ✓ Golden Ratio provides better overall coverage                 │
│  ✓ Add 60 mL bottle to Golden series to fill 55-68 gap          │
│  ✓ Add 100 mL bottle to fill 89-111 gap                         │
│  ✓ Consider 160 mL bottle to reduce 145-179 gap                 │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## 4. Algorithm Visualizations

### Linear Progression

```
Volume progression with equal increments:

V(i) = V_min + (V_max - V_min) × i / (n-1)

Example: 5 bottles, 100-500 mL

Step = (500 - 100) / (5-1) = 100 mL

Bottle 1: 100 mL  ▓
Bottle 2: 200 mL  ▓▓
Bottle 3: 300 mL  ▓▓▓
Bottle 4: 400 mL  ▓▓▓▓
Bottle 5: 500 mL  ▓▓▓▓▓

Characteristics:
✓ Predictable, uniform spacing
✓ Easy to understand
✗ May create gaps at lower volumes
✗ Less efficient coverage
```

### Golden Ratio Progression

```
Volume progression with φ (1.618) multiplier:

V(i) = V_min × φ^i

Example: 5 bottles, starting at 65 mL

Bottle 1: 65 mL    ▓
Bottle 2: 105 mL   ▓▓
Bottle 3: 170 mL   ▓▓▓
Bottle 4: 275 mL   ▓▓▓▓
Bottle 5: 445 mL   ▓▓▓▓▓▓▓

Characteristics:
✓ Aesthetically pleasing proportions
✓ Better coverage at lower volumes
✓ Natural scaling
✗ May exceed max volume
✗ Less intuitive spacing
```

### Logarithmic Progression

```
Volume progression on logarithmic scale:

V(i) = exp(log(V_min) + (log(V_max) - log(V_min)) × i / (n-1))

Example: 5 bottles, 100-500 mL

Bottle 1: 100 mL   ▓
Bottle 2: 149 mL   ▓▓
Bottle 3: 223 mL   ▓▓▓
Bottle 4: 333 mL   ▓▓▓▓
Bottle 5: 500 mL   ▓▓▓▓▓

Characteristics:
✓ Excellent coverage across range
✓ More bottles at lower volumes
✓ Smooth progression
✗ Complex calculation
✗ May be harder to predict
```

## 5. Bottle Scaling Visualization

### Height-Priority Scaling

```
Target: Scale 100 mL bottle to 200 mL

Original Bottle (100 mL):
    ┌─┐
    │ │ ← Neck (constant)
    ├─┤
    │ │
    │ │ ← Body (scale height)
    │ │
    └─┘

Scaled Bottle (200 mL):
    ┌─┐
    │ │ ← Neck (unchanged)
    ├─┤
    │ │
    │ │
    │ │ ← Body (2x height)
    │ │
    │ │
    │ │
    └─┘

Scaling Strategy:
1. Keep neck dimensions constant
2. Scale body height by volume ratio
3. Keep diameter constant if possible
4. Recalculate actual volume
5. Adjust if needed
```

### Proportional Scaling (Fallback)

```
When height limits are reached:

Original Bottle (100 mL):
    ┌─┐
    │ │
    ├─┤
    │ │
    │ │
    └─┘
    D=50mm, H=100mm

Scaled Bottle (800 mL):
    ┌──┐
    │  │
    ├──┤
    │  │
    │  │
    │  │
    │  │
    └──┘
    D=100mm, H=200mm

Scaling Strategy:
1. Calculate cube root of volume ratio
2. Scale all dimensions proportionally
3. Maintain shape proportions
4. Keep neck finish compatible
```

## 6. User Workflow Diagrams

### Bottle Series Generation Workflow

```
┌─────────────┐
│   Start     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Select Algorithm    │
│ • Linear            │
│ • Golden Ratio      │
│ • Logarithmic       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Configure Range     │
│ • Min Volume: 65mL  │
│ • Max Volume: 700mL │
│ • Count: 5 bottles  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Select Template     │
│ • Boston Round      │
│ • Cylinder          │
│ • Oval              │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Set Fill Range      │
│ • Min: 65%          │
│ • Max: 85%          │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Generate Series     │
│ [Generate Button]   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ View Generated      │
│ • 3D Visualization  │
│ • Specifications    │
│ • Fill Ranges       │
└──────┬──────────────┘
       │
       ▼
    ┌──┴──┐
    │Edit?│
    └──┬──┘
       │
   ┌───┴───┐
   │       │
   ▼       ▼
┌──────┐ ┌──────────┐
│Batch │ │Individual│
│Edit  │ │Edit      │
└──┬───┘ └────┬─────┘
   │          │
   └────┬─────┘
        │
        ▼
   ┌─────────┐
   │  Save   │
   └─────────┘
```

### Comparison Workflow

```
┌─────────────┐
│   Start     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Select Series 1     │
│ [Dropdown Menu]     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Select Series 2     │
│ [Dropdown Menu]     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Generate Comparison │
│ [Compare Button]    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ View Results        │
│ • Chart             │
│ • Table             │
│ • Metrics           │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Gap Analysis        │
│ • Identify gaps     │
│ • Show overlaps     │
│ • Calculate coverage│
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Recommendations     │
│ • Fill gaps         │
│ • Optimize sizes    │
│ • Improve coverage  │
└──────┬──────────────┘
       │
       ▼
    ┌──┴──┐
    │Take │
    │Action│
    └──┬──┘
       │
   ┌───┴────┐
   │        │
   ▼        ▼
┌──────┐ ┌──────┐
│Edit  │ │Export│
│Series│ │Report│
└──┬───┘ └───┬──┘
   │         │
   └────┬────┘
        │
        ▼
   ┌─────────┐
   │  Save   │
   └─────────┘
```

## 7. Data Structure Visualization

### Bottle Series Object

```
BottleSeries {
  id: "series-001"
  name: "Golden Ratio Series"
  description: "Optimal coverage for 65-700mL range"
  
  config: {
    algorithm: "golden-ratio"
    minVolume: 65
    maxVolume: 700
    bottleCount: 5
    baseTemplateId: "boston-round-template"
    fillRangeMin: 65
    fillRangeMax: 85
  }
  
  bottles: [
    Bottle {
      id: "bottle-001"
      name: "Boston Round 65ml"
      volume: 65
      dimensions: { height: 85, diameter: 35, ... }
      ...
    },
    Bottle {
      id: "bottle-002"
      name: "Boston Round 105ml"
      volume: 105
      dimensions: { height: 110, diameter: 35, ... }
      ...
    },
    ...
  ]
  
  createdAt: "2026-02-11T17:00:00Z"
  updatedAt: "2026-02-11T17:00:00Z"
}
```

### Comparison Object

```
SeriesComparison {
  id: "comparison-001"
  name: "Linear vs Golden Ratio"
  series1Id: "series-001"
  series2Id: "series-002"
  
  gaps: [
    {
      startVolume: 55
      endVolume: 68
      gapSize: 13
      severity: "minor"
    },
    {
      startVolume: 89
      endVolume: 111
      gapSize: 22
      severity: "moderate"
    }
  ]
  
  overlaps: [
    {
      startVolume: 42
      endVolume: 55
      overlapSize: 13
      series1Bottles: ["bottle-001"]
      series2Bottles: ["bottle-101"]
    }
  ]
  
  series1Coverage: 67
  series2Coverage: 72
  combinedCoverage: 85
  
  recommendations: [
    "Add 60mL bottle to fill 55-68mL gap",
    "Add 100mL bottle to fill 89-111mL gap"
  ]
  
  createdAt: "2026-02-11T17:00:00Z"
}
```

## 8. Color Coding Reference

### Chart Colors

```
Series 1 (Primary):
  ████████ Blue (#3B82F6)
  
Series 2 (Secondary):
  ████████ Green (#10B981)
  
Gaps (Problems):
  ░░░░░░░░ Red (#EF4444) with diagonal stripes
  
Overlaps (Warnings):
  ▒▒▒▒▒▒▒▒ Yellow (#F59E0B) with crosshatch
  
Good Coverage:
  ████████ Green (#22C55E) with checkmark
  
Poor Coverage:
  ████████ Red (#DC2626) with warning icon
```

### Severity Indicators

```
Minor Gap (< 20 mL):
  ⚠ Yellow warning

Moderate Gap (20-50 mL):
  ⚠ Orange warning

Major Gap (> 50 mL):
  ⚠ Red alert

Optimal Coverage (> 90%):
  ✓ Green checkmark

Good Coverage (75-90%):
  ✓ Blue checkmark

Poor Coverage (< 75%):
  ✗ Red X
```

## Conclusion

This visual guide provides a comprehensive overview of the redesigned lineup feature's user interface, data visualizations, and workflows. The diagrams illustrate how users will interact with the new bottle series generation and comparison capabilities, making it easier to understand the planned implementation.
