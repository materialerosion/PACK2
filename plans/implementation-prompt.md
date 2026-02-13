# Implementation Prompt for Code Mode

## Context
I need you to implement the redesigned lineup feature for the PACK2 pharmaceutical packaging application. The complete architectural plan is documented in [`plans/lineup-redesign-plan.md`](lineup-redesign-plan.md) and visual mockups are in [`plans/lineup-visual-guide.md`](lineup-visual-guide.md).

## Objective
Implement the new bottle series generation and comparison features according to the architectural plan. This replaces the old manual lineup builder with an intelligent bottle series generator that uses mathematical algorithms and provides gap analysis for comparing series.

## Implementation Phases

### Phase 1: Core Type Definitions and Services (Start Here)
1. Create [`src/types/bottleSeries.ts`](../src/types/bottleSeries.ts) with all new type definitions:
   - `GenerationAlgorithm` type
   - `GenerationConfig` interface
   - `BottleSeries` interface
   - `FillRange` interface
   - `CoverageGap` interface
   - `CoverageOverlap` interface
   - `SeriesComparison` interface

2. Create [`src/services/bottleGenerationService.ts`](../src/services/bottleGenerationService.ts):
   - Implement `generateSeries()` method
   - Implement volume calculation algorithms (linear, golden ratio, logarithmic)
   - Implement bottle scaling logic (height-priority scaling)
   - Use existing [`VolumeCalculator`](../src/services/volumeCalculator.ts) for volume recalculation

3. Create [`src/services/fillRangeService.ts`](../src/services/fillRangeService.ts):
   - Implement `calculateFillRange()` for single bottle
   - Implement `calculateSeriesFillRanges()` for entire series
   - Default fill range: 65-85%

4. Create [`src/services/comparisonService.ts`](../src/services/comparisonService.ts):
   - Implement `compareSeries()` method
   - Implement `findGaps()` algorithm
   - Implement `findOverlaps()` algorithm
   - Implement `calculateCoverage()` method
   - Implement `generateRecommendations()` method

### Phase 2: State Management
Update [`src/store/index.ts`](../src/store/index.ts) to add:
- `bottleSeries: Record<string, BottleSeries>` state
- `activeSeriesId: string | null` state
- `seriesComparisons: Record<string, SeriesComparison>` state
- `activeComparisonId: string | null` state
- Actions for CRUD operations on series and comparisons
- Actions for batch and individual bottle editing

### Phase 3: Series Generator Components
1. Create [`src/components/lineup-builder/SeriesGenerator.tsx`](../src/components/lineup-builder/SeriesGenerator.tsx):
   - Algorithm selector (radio buttons for linear/golden-ratio/logarithmic)
   - Volume range inputs (min/max with defaults 65-700 mL)
   - Bottle count slider (3-10 bottles)
   - Base template dropdown (select from existing bottle shapes)
   - Fill range percentage inputs (min/max with defaults 65-85%)
   - Generate button that calls `BottleGenerationService.generateSeries()`

2. Create [`src/components/lineup-builder/GeneratedBottlesDisplay.tsx`](../src/components/lineup-builder/GeneratedBottlesDisplay.tsx):
   - Use existing [`Shelf3D`](../src/components/3d/Shelf3D.tsx) component for 3D visualization
   - Create list view showing bottle specifications
   - Display fill ranges for each bottle
   - Show min fill, target fill, max fill in mL

3. Create [`src/components/lineup-builder/BatchEditor.tsx`](../src/components/lineup-builder/BatchEditor.tsx):
   - Multi-select bottles with checkboxes
   - Edit common properties: material, cap style, colors
   - Apply changes to all selected bottles

4. Create [`src/components/lineup-builder/IndividualEditor.tsx`](../src/components/lineup-builder/IndividualEditor.tsx):
   - Full parameter editing for single bottle
   - Reuse existing bottle editing UI patterns from [`BottleGenerator`](../src/components/bottle-generator/BottleGenerator.tsx)
   - Real-time volume recalculation

### Phase 4: Comparison Components
1. Create [`src/components/comparison-mode/SeriesSelector.tsx`](../src/components/comparison-mode/SeriesSelector.tsx):
   - Two dropdowns for selecting series to compare
   - Display series names and bottle counts
   - Generate comparison button

2. Create [`src/components/comparison-mode/ComparisonChart.tsx`](../src/components/comparison-mode/ComparisonChart.tsx):
   - Horizontal bar chart showing fill ranges
   - Series 1 bars in blue
   - Series 2 bars in green
   - Gap indicators in red with diagonal stripes
   - Overlap indicators in yellow
   - Volume axis at bottom (0 to max volume)
   - Tooltips on hover showing exact values

3. Create [`src/components/comparison-mode/ComparisonTable.tsx`](../src/components/comparison-mode/ComparisonTable.tsx):
   - Table with columns: Bottle, Volume, Min Fill, Target Fill, Max Fill, Coverage Range
   - Rows for Series 1 bottles
   - Gap rows highlighted in red
   - Rows for Series 2 bottles
   - Show gap details (start, end, size, severity)

4. Create [`src/components/comparison-mode/AnalysisReport.tsx`](../src/components/comparison-mode/AnalysisReport.tsx):
   - Display coverage percentages for both series
   - Show number and severity of gaps
   - Display recommendations from comparison service
   - Add notes textarea for user comments

### Phase 5: Integration and Testing
1. Update [`src/components/layout/MainContent.tsx`](../src/components/layout/MainContent.tsx):
   - Add new tabs/sections for series generator
   - Update comparison panel to use new components
   - Maintain existing bottle generator functionality

2. Update [`src/App.tsx`](../src/App.tsx) if needed for routing

3. Test all features:
   - Generate series with each algorithm
   - Verify volume calculations are accurate
   - Test batch and individual editing
   - Verify fill range calculations
   - Test comparison with gap detection
   - Verify recommendations are sensible

## Key Implementation Details

### Bottle Scaling Algorithm (Critical)
When scaling bottles to target volumes:
1. **Primary strategy**: Scale body height only
   - Keep neck dimensions constant
   - Keep diameter constant
   - Formula: `newHeight = originalHeight * (targetVolume / originalVolume)`
2. **Fallback strategy**: If height limits reached, scale proportionally
   - Use cube root: `scale = Math.cbrt(targetVolume / originalVolume)`
   - Scale height and diameter by this factor
   - Keep neck finish compatible
3. **Always recalculate**: Use [`VolumeCalculator.calculateVolume()`](../src/services/volumeCalculator.ts) to verify actual volume

### Gap Detection Algorithm (Critical)
```typescript
// Pseudocode for gap detection
1. Calculate fill ranges for all bottles in both series
2. Combine all ranges and sort by minFill
3. For each consecutive pair of ranges:
   - If nextRange.minFill > currentRange.maxFill:
     - Gap exists from currentRange.maxFill to nextRange.minFill
     - Calculate gap size and severity
4. Return array of gaps
```

### Fill Range Calculation (Simple)
```typescript
minFill = bottleVolume * minPercent / 100
targetFill = bottleVolume * (minPercent + maxPercent) / 2 / 100
maxFill = bottleVolume * maxPercent / 100
```

## Styling Guidelines
- Use existing Tailwind CSS classes from the project
- Follow existing component patterns for consistency
- Use existing color scheme:
  - Primary blue: `#3B82F6`
  - Success green: `#10B981`
  - Warning yellow: `#F59E0B`
  - Error red: `#EF4444`
- Maintain responsive design (mobile-friendly)

## Testing Checklist
- [ ] Linear algorithm generates correct volumes
- [ ] Golden ratio algorithm generates correct volumes
- [ ] Logarithmic algorithm generates correct volumes
- [ ] Bottle scaling produces accurate volumes (within 1% tolerance)
- [ ] Fill ranges calculate correctly
- [ ] Gap detection identifies all gaps
- [ ] Overlap detection works correctly
- [ ] Coverage percentages are accurate
- [ ] Recommendations are helpful
- [ ] Batch editing updates all selected bottles
- [ ] Individual editing updates single bottle
- [ ] 3D visualization displays correctly
- [ ] Comparison chart renders properly
- [ ] Table displays all data correctly

## Migration Notes
- Keep existing [`lineup.ts`](../src/types/lineup.ts) types for backward compatibility
- Don't delete existing lineup builder components yet
- New features should coexist with old features initially
- Consider adding migration tool later to convert old lineups to series

## Questions to Consider During Implementation
1. Should we add validation for minimum/maximum bottle heights?
2. Should we limit the volume range based on selected template?
3. Should we add undo/redo for editing operations?
4. Should we add export functionality for comparison reports?
5. Should we add ability to save comparison results?

## Success Criteria
- All three generation algorithms work correctly
- Bottle scaling produces accurate volumes
- Gap detection identifies coverage issues
- Comparison visualization is clear and informative
- Editing (batch and individual) works smoothly
- No breaking changes to existing features
- Code is well-documented and tested

## Reference Files
- Architecture Plan: [`plans/lineup-redesign-plan.md`](lineup-redesign-plan.md)
- Visual Guide: [`plans/lineup-visual-guide.md`](lineup-visual-guide.md)
- Existing Volume Calculator: [`src/services/volumeCalculator.ts`](../src/services/volumeCalculator.ts)
- Existing Lineup Algorithms: [`src/services/lineupAlgorithms.ts`](../src/services/lineupAlgorithms.ts)
- Existing Types: [`src/types/bottle.ts`](../src/types/bottle.ts), [`src/types/lineup.ts`](../src/types/lineup.ts)

## Start Implementation
Begin with Phase 1 (type definitions and services) and work through each phase sequentially. Test each phase before moving to the next. Ask questions if any requirements are unclear.
