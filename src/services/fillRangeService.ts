/**
 * Fill Range Service
 * Calculates fill ranges for bottles and series.
 *
 * Fill range represents the mL range a bottle can accommodate
 * at given fill percentages (default 65-85%).
 */

import { Bottle } from '@/types/bottle';
import { BottleSeries, FillRange } from '@/types/bottleSeries';

/**
 * Service for calculating fill ranges.
 *
 * Usage:
 *   const range = FillRangeService.calculateFillRange(bottle);
 *   const ranges = FillRangeService.calculateSeriesFillRanges(series);
 */
export class FillRangeService {

  /**
   * Calculate fill range for a single bottle.
   *
   * @param bottle    - The bottle to calculate for
   * @param minPercent - Minimum fill percentage (default 65%)
   * @param maxPercent - Maximum fill percentage (default 85%)
   * @returns FillRange with min, target, and max fill in mL
   *
   * Formulas:
   *   minFill    = volume × minPercent / 100
   *   targetFill = volume × (minPercent + maxPercent) / 2 / 100
   *   maxFill    = volume × maxPercent / 100
   */
  static calculateFillRange(
    bottle: Bottle,
    minPercent: number = 65,
    maxPercent: number = 85
  ): FillRange {
    const targetPercent = (minPercent + maxPercent) / 2;

    return {
      bottleId: bottle.id,
      bottleVolume: bottle.volume,
      minFill: bottle.volume * minPercent / 100,
      targetFill: bottle.volume * targetPercent / 100,
      maxFill: bottle.volume * maxPercent / 100,
      minPercent,
      targetPercent,
      maxPercent,
    };
  }

  /**
   * Calculate fill ranges for all bottles in a series.
   * Uses the series config's fill range percentages.
   */
  static calculateSeriesFillRanges(series: BottleSeries): FillRange[] {
    return series.bottles.map(bottle =>
      this.calculateFillRange(
        bottle,
        series.config.fillRangeMin,
        series.config.fillRangeMax
      )
    );
  }

  /**
   * Calculate fill ranges for an array of bottles with explicit percentages.
   */
  static calculateFillRanges(
    bottles: Bottle[],
    minPercent: number = 65,
    maxPercent: number = 85
  ): FillRange[] {
    return bottles.map(bottle =>
      this.calculateFillRange(bottle, minPercent, maxPercent)
    );
  }

  /**
   * Get the total volume coverage of a set of fill ranges.
   * Returns the union of all ranges (accounting for overlaps).
   */
  static getTotalCoverage(ranges: FillRange[]): number {
    if (ranges.length === 0) return 0;

    // Sort by minFill
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
}

export default FillRangeService;
