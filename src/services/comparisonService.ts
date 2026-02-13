/**
 * Comparison Service
 * Compares two bottle series to identify coverage gaps, overlaps,
 * and generates recommendations for improving coverage.
 *
 * Supports both:
 *   - Intra-series analysis (gaps/overlaps within a single series)
 *   - Inter-series analysis (gaps/overlaps between two series as a group)
 */

import { v4 as uuidv4 } from 'uuid';
import {
  BottleSeries,
  FillRange,
  CoverageGap,
  CoverageOverlap,
  IntraSeriesOverlap,
  IntraSeriesAnalysis,
  SeriesComparison,
  GAP_SEVERITY_THRESHOLDS,
} from '@/types/bottleSeries';
import { FillRangeService } from './fillRangeService';

/**
 * Service for comparing two bottle series.
 *
 * Usage:
 *   const comparison = ComparisonService.compareSeries(series1, series2);
 *   const analysis  = ComparisonService.analyzeSeriesInternal(series);
 */
export class ComparisonService {

  /**
   * Compare two bottle series and produce a full analysis.
   *
   * Steps:
   *   1. Calculate fill ranges for both series
   *   2. Perform per-series (intra-series) analysis
   *   3. Detect gaps in combined coverage (inter-series)
   *   4. Detect overlaps between the two series (inter-series)
   *   5. Calculate coverage percentages
   *   6. Generate actionable recommendations
   */
  static compareSeries(
    series1: BottleSeries,
    series2: BottleSeries
  ): SeriesComparison {
    // 1. Calculate fill ranges
    const ranges1 = FillRangeService.calculateSeriesFillRanges(series1);
    const ranges2 = FillRangeService.calculateSeriesFillRanges(series2);

    // 2. Per-series analysis
    const series1Analysis = this.analyzeSeriesInternal(series1, ranges1);
    const series2Analysis = this.analyzeSeriesInternal(series2, ranges2);

    // 3. Find inter-series gaps
    const gaps = this.findGaps(ranges1, ranges2);

    // 4. Find inter-series overlaps
    const overlaps = this.findOverlaps(ranges1, ranges2);

    // 5. Calculate coverage
    const coverage = this.calculateCoverage(ranges1, ranges2, gaps);

    // 6. Generate recommendations (now includes per-series insights)
    const recommendations = this.generateRecommendations(
      gaps, overlaps, coverage, series1Analysis, series2Analysis
    );

    return {
      id: uuidv4(),
      name: `${series1.name} vs ${series2.name}`,
      series1Id: series1.id,
      series2Id: series2.id,
      series1Analysis,
      series2Analysis,
      gaps,
      overlaps,
      series1Coverage: coverage.series1,
      series2Coverage: coverage.series2,
      combinedCoverage: coverage.combined,
      recommendations,
      notes: '',
      createdAt: new Date(),
    };
  }

  // ─── Intra-Series Analysis ──────────────────────────────────────────

  /**
   * Analyze a single series for internal gaps and overlaps.
   * This measures how well the series uses its bottle space on its own.
   *
   * Can be called standalone (e.g. from the lineup builder) or as part
   * of a two-series comparison.
   */
  static analyzeSeriesInternal(
    series: BottleSeries,
    ranges?: FillRange[]
  ): IntraSeriesAnalysis {
    const fillRanges = ranges || FillRangeService.calculateSeriesFillRanges(series);

    if (fillRanges.length === 0) {
      return {
        seriesId: series.id,
        seriesName: series.name,
        gaps: [],
        totalGapSize: 0,
        overlaps: [],
        totalOverlapSize: 0,
        coverageSpan: 0,
        coveredRange: 0,
        coverageEfficiency: 100,
        spaceUtilization: 100,
      };
    }

    // Find gaps within this series only
    const gaps = this.findIntraSeriesGaps(fillRanges);
    const totalGapSize = gaps.reduce((sum, g) => sum + g.gapSize, 0);

    // Find overlaps within this series only
    const overlaps = this.findIntraSeriesOverlaps(fillRanges);
    const totalOverlapSize = overlaps.reduce((sum, o) => sum + o.overlapSize, 0);

    // Coverage metrics
    const minFill = Math.min(...fillRanges.map(r => r.minFill));
    const maxFill = Math.max(...fillRanges.map(r => r.maxFill));
    const coverageSpan = maxFill - minFill;
    const coveredRange = FillRangeService.getTotalCoverage(fillRanges);
    const coverageEfficiency = coverageSpan > 0
      ? (coveredRange / coverageSpan) * 100
      : 100;

    // Space utilization: ratio of covered range to the total bottle volume range
    // (min bottle volume to max bottle volume)
    const minVolume = Math.min(...fillRanges.map(r => r.bottleVolume));
    const maxVolume = Math.max(...fillRanges.map(r => r.bottleVolume));
    const volumeRange = maxVolume - minVolume;
    const spaceUtilization = volumeRange > 0
      ? Math.min(100, (coveredRange / volumeRange) * 100)
      : 100;

    return {
      seriesId: series.id,
      seriesName: series.name,
      gaps,
      totalGapSize,
      overlaps,
      totalOverlapSize,
      coverageSpan,
      coveredRange,
      coverageEfficiency,
      spaceUtilization,
    };
  }

  /**
   * Find gaps within a single series' fill ranges.
   */
  static findIntraSeriesGaps(ranges: FillRange[]): CoverageGap[] {
    const gaps: CoverageGap[] = [];
    if (ranges.length <= 1) return gaps;

    const sorted = [...ranges].sort((a, b) => a.minFill - b.minFill);
    let runningMax = sorted[0].maxFill;

    for (let i = 1; i < sorted.length; i++) {
      const nextMin = sorted[i].minFill;
      if (nextMin > runningMax) {
        const gapSize = nextMin - runningMax;
        gaps.push({
          startVolume: runningMax,
          endVolume: nextMin,
          gapSize,
          severity: this.assessGapSeverity(gapSize),
        });
      }
      runningMax = Math.max(runningMax, sorted[i].maxFill);
    }

    return gaps;
  }

  /**
   * Find overlaps within a single series' fill ranges.
   */
  static findIntraSeriesOverlaps(ranges: FillRange[]): IntraSeriesOverlap[] {
    const overlaps: IntraSeriesOverlap[] = [];
    if (ranges.length <= 1) return overlaps;

    for (let i = 0; i < ranges.length; i++) {
      for (let j = i + 1; j < ranges.length; j++) {
        const overlapStart = Math.max(ranges[i].minFill, ranges[j].minFill);
        const overlapEnd = Math.min(ranges[i].maxFill, ranges[j].maxFill);

        if (overlapStart < overlapEnd) {
          overlaps.push({
            startVolume: overlapStart,
            endVolume: overlapEnd,
            overlapSize: overlapEnd - overlapStart,
            bottle1Id: ranges[i].bottleId,
            bottle2Id: ranges[j].bottleId,
          });
        }
      }
    }

    return overlaps;
  }

  // ─── Gap Detection ──────────────────────────────────────────────────

  /**
   * Find coverage gaps between two sets of fill ranges.
   *
   * Algorithm:
   *   1. Combine all ranges from both series
   *   2. Sort by minFill ascending
   *   3. Walk through sorted ranges tracking the running maximum maxFill
   *   4. If the next range's minFill > running max, a gap exists
   */
  static findGaps(
    ranges1: FillRange[],
    ranges2: FillRange[]
  ): CoverageGap[] {
    const gaps: CoverageGap[] = [];

    // Combine and sort all ranges by minFill
    const allRanges = [...ranges1, ...ranges2]
      .sort((a, b) => a.minFill - b.minFill);

    if (allRanges.length === 0) return gaps;

    let runningMax = allRanges[0].maxFill;

    for (let i = 1; i < allRanges.length; i++) {
      const nextMin = allRanges[i].minFill;

      if (nextMin > runningMax) {
        const gapSize = nextMin - runningMax;
        gaps.push({
          startVolume: runningMax,
          endVolume: nextMin,
          gapSize,
          severity: this.assessGapSeverity(gapSize),
        });
      }

      runningMax = Math.max(runningMax, allRanges[i].maxFill);
    }

    return gaps;
  }

  /**
   * Assess the severity of a gap based on its size in mL.
   */
  private static assessGapSeverity(gapSize: number): CoverageGap['severity'] {
    if (gapSize <= GAP_SEVERITY_THRESHOLDS.minor) return 'minor';
    if (gapSize <= GAP_SEVERITY_THRESHOLDS.moderate) return 'moderate';
    return 'major';
  }

  // ─── Overlap Detection ──────────────────────────────────────────────

  /**
   * Find overlaps between two sets of fill ranges.
   *
   * Checks every pair (range from series1, range from series2)
   * and records where they intersect.
   */
  static findOverlaps(
    ranges1: FillRange[],
    ranges2: FillRange[]
  ): CoverageOverlap[] {
    const overlaps: CoverageOverlap[] = [];

    for (const range1 of ranges1) {
      for (const range2 of ranges2) {
        const overlapStart = Math.max(range1.minFill, range2.minFill);
        const overlapEnd = Math.min(range1.maxFill, range2.maxFill);

        if (overlapStart < overlapEnd) {
          overlaps.push({
            startVolume: overlapStart,
            endVolume: overlapEnd,
            overlapSize: overlapEnd - overlapStart,
            series1Bottles: [range1.bottleId],
            series2Bottles: [range2.bottleId],
          });
        }
      }
    }

    return overlaps;
  }

  // ─── Coverage Calculation ───────────────────────────────────────────

  /**
   * Calculate coverage percentages for each series and combined.
   *
   * Coverage = (covered range) / (total range from min to max of all bottles)
   */
  static calculateCoverage(
    ranges1: FillRange[],
    ranges2: FillRange[],
    gaps: CoverageGap[]
  ): { series1: number; series2: number; combined: number } {
    const allRanges = [...ranges1, ...ranges2];
    if (allRanges.length === 0) {
      return { series1: 0, series2: 0, combined: 0 };
    }

    const minVolume = Math.min(...allRanges.map(r => r.minFill));
    const maxVolume = Math.max(...allRanges.map(r => r.maxFill));
    const totalRange = maxVolume - minVolume;

    if (totalRange <= 0) {
      return { series1: 100, series2: 100, combined: 100 };
    }

    // Series-specific coverage (union of that series' ranges)
    const series1Coverage = this.calculateSeriesCoverage(ranges1);
    const series2Coverage = this.calculateSeriesCoverage(ranges2);

    // Combined coverage = total range minus gaps
    const totalGapSize = gaps.reduce((sum, gap) => sum + gap.gapSize, 0);
    const combinedCoverage = ((totalRange - totalGapSize) / totalRange) * 100;

    return {
      series1: (series1Coverage / totalRange) * 100,
      series2: (series2Coverage / totalRange) * 100,
      combined: Math.min(100, Math.max(0, combinedCoverage)),
    };
  }

  /**
   * Calculate the total covered range for a single series (union of ranges).
   */
  private static calculateSeriesCoverage(ranges: FillRange[]): number {
    if (ranges.length === 0) return 0;

    const sorted = [...ranges].sort((a, b) => a.minFill - b.minFill);
    let totalCoverage = 0;
    let currentMax = sorted[0].minFill;

    for (const range of sorted) {
      const effectiveMin = Math.max(range.minFill, currentMax);
      if (range.maxFill > effectiveMin) {
        totalCoverage += range.maxFill - effectiveMin;
        currentMax = Math.max(currentMax, range.maxFill);
      }
    }

    return totalCoverage;
  }

  // ─── Recommendations ────────────────────────────────────────────────

  /**
   * Generate actionable recommendations based on gap, overlap, and per-series analysis.
   */
  static generateRecommendations(
    gaps: CoverageGap[],
    overlaps: CoverageOverlap[],
    coverage: { series1: number; series2: number; combined: number },
    series1Analysis?: IntraSeriesAnalysis,
    series2Analysis?: IntraSeriesAnalysis
  ): string[] {
    const recommendations: string[] = [];

    // ── Per-series gap recommendations ──────────────────────────────
    if (series1Analysis && series1Analysis.gaps.length > 0) {
      const majorIntra = series1Analysis.gaps.filter(g => g.severity === 'major');
      for (const gap of majorIntra) {
        const suggestedVolume = Math.round((gap.startVolume + gap.endVolume) / 2);
        recommendations.push(
          `${series1Analysis.seriesName}: Add a ~${suggestedVolume} mL bottle to fill the internal gap at ${Math.round(gap.startVolume)}–${Math.round(gap.endVolume)} mL (${Math.round(gap.gapSize)} mL)`
        );
      }
    }

    if (series2Analysis && series2Analysis.gaps.length > 0) {
      const majorIntra = series2Analysis.gaps.filter(g => g.severity === 'major');
      for (const gap of majorIntra) {
        const suggestedVolume = Math.round((gap.startVolume + gap.endVolume) / 2);
        recommendations.push(
          `${series2Analysis.seriesName}: Add a ~${suggestedVolume} mL bottle to fill the internal gap at ${Math.round(gap.startVolume)}–${Math.round(gap.endVolume)} mL (${Math.round(gap.gapSize)} mL)`
        );
      }
    }

    // Per-series space utilization warnings
    if (series1Analysis && series1Analysis.coverageEfficiency < 80) {
      recommendations.push(
        `${series1Analysis.seriesName} has ${series1Analysis.coverageEfficiency.toFixed(1)}% coverage efficiency — ${series1Analysis.totalGapSize.toFixed(0)} mL of internal gaps. Consider adding bottles to improve fill range continuity.`
      );
    }
    if (series2Analysis && series2Analysis.coverageEfficiency < 80) {
      recommendations.push(
        `${series2Analysis.seriesName} has ${series2Analysis.coverageEfficiency.toFixed(1)}% coverage efficiency — ${series2Analysis.totalGapSize.toFixed(0)} mL of internal gaps. Consider adding bottles to improve fill range continuity.`
      );
    }

    // ── Cross-series gap recommendations ────────────────────────────
    // Recommend filling major gaps
    const majorGaps = gaps.filter(g => g.severity === 'major');
    for (const gap of majorGaps) {
      const suggestedVolume = Math.round((gap.startVolume + gap.endVolume) / 2);
      recommendations.push(
        `Combined: Add a bottle with ~${suggestedVolume} mL capacity to fill the major gap at ${Math.round(gap.startVolume)}–${Math.round(gap.endVolume)} mL (${Math.round(gap.gapSize)} mL gap)`
      );
    }

    // Recommend filling moderate gaps
    const moderateGaps = gaps.filter(g => g.severity === 'moderate');
    for (const gap of moderateGaps) {
      const suggestedVolume = Math.round((gap.startVolume + gap.endVolume) / 2);
      recommendations.push(
        `Combined: Consider adding a ~${suggestedVolume} mL bottle to address the moderate gap at ${Math.round(gap.startVolume)}–${Math.round(gap.endVolume)} mL`
      );
    }

    // Warn about excessive overlaps
    if (overlaps.length > 3) {
      recommendations.push(
        `${overlaps.length} overlapping fill ranges detected between the two series. Consider reducing redundancy.`
      );
    }

    // Coverage-based recommendations
    if (coverage.combined < 80) {
      recommendations.push(
        `Combined coverage is only ${coverage.combined.toFixed(1)}%. Consider adding bottles to improve coverage.`
      );
    }

    if (coverage.series1 < coverage.series2 - 10) {
      recommendations.push(
        `Series 1 has significantly lower coverage (${coverage.series1.toFixed(1)}%) than Series 2 (${coverage.series2.toFixed(1)}%). Consider adding bottles to Series 1.`
      );
    } else if (coverage.series2 < coverage.series1 - 10) {
      recommendations.push(
        `Series 2 has significantly lower coverage (${coverage.series2.toFixed(1)}%) than Series 1 (${coverage.series1.toFixed(1)}%). Consider adding bottles to Series 2.`
      );
    }

    // If no issues found
    if (recommendations.length === 0) {
      recommendations.push(
        'Both series provide good coverage with no major gaps. The lineup is well-optimized.'
      );
    }

    return recommendations;
  }
}

export default ComparisonService;
