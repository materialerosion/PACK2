/**
 * Bottle Series Type Definitions
 * Types for bottle series generation, fill range analysis, and comparison
 */

import { Bottle } from './bottle';

/**
 * Available generation algorithms for bottle series
 */
export type GenerationAlgorithm =
  | 'linear'
  | 'golden-ratio'
  | 'logarithmic';

/**
 * Configuration for generating a bottle series
 */
export interface GenerationConfig {
  algorithm: GenerationAlgorithm;
  minVolume: number;        // mL
  maxVolume: number;        // mL
  bottleCount: number;      // 3-10
  baseTemplateId: string;   // Reference to bottle shape or preset
  fillRangeMin: number;     // % (default 65)
  fillRangeMax: number;     // % (default 85)
}

/**
 * A collection of generated bottles forming a series
 */
export interface BottleSeries {
  id: string;
  name: string;
  description: string;
  config: GenerationConfig;
  bottles: Bottle[];        // Generated bottles

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  category: string;
}

/**
 * Fill range calculation for a single bottle
 */
export interface FillRange {
  bottleId: string;
  bottleVolume: number;
  minFill: number;          // mL at min %
  targetFill: number;       // mL at target %
  maxFill: number;          // mL at max %
  minPercent: number;
  targetPercent: number;
  maxPercent: number;
}

/**
 * A gap in volume coverage between bottles
 */
export interface CoverageGap {
  startVolume: number;
  endVolume: number;
  gapSize: number;
  severity: 'minor' | 'moderate' | 'major';
}

/**
 * An overlap in volume coverage within a single series
 */
export interface IntraSeriesOverlap {
  startVolume: number;
  endVolume: number;
  overlapSize: number;
  bottle1Id: string;
  bottle2Id: string;
}

/**
 * Per-series gap and overlap analysis
 * Measures how well a single series uses its bottle space
 */
export interface IntraSeriesAnalysis {
  seriesId: string;
  seriesName: string;

  // Gaps within this series' fill ranges
  gaps: CoverageGap[];
  totalGapSize: number;        // mL sum of all gaps

  // Overlaps within this series' fill ranges
  overlaps: IntraSeriesOverlap[];
  totalOverlapSize: number;    // mL sum of all overlaps

  // Coverage metrics
  coverageSpan: number;        // mL from min fill to max fill
  coveredRange: number;        // mL actually covered (union of ranges)
  coverageEfficiency: number;  // % of span that is covered (0-100)

  // Space utilization: how well the bottles use the available volume range
  spaceUtilization: number;    // % — higher = better use of bottle space
}

/**
 * An overlap in volume coverage between two series
 */
export interface CoverageOverlap {
  startVolume: number;
  endVolume: number;
  overlapSize: number;
  series1Bottles: string[];
  series2Bottles: string[];
}

/**
 * Result of comparing two bottle series
 */
export interface SeriesComparison {
  id: string;
  name: string;
  series1Id: string;
  series2Id: string;

  // Per-series (intra-series) analysis
  series1Analysis: IntraSeriesAnalysis;
  series2Analysis: IntraSeriesAnalysis;

  // Cross-series (inter-series) analysis — existing group analysis
  gaps: CoverageGap[];
  overlaps: CoverageOverlap[];
  series1Coverage: number;  // %
  series2Coverage: number;  // %
  combinedCoverage: number; // %

  // Recommendations
  recommendations: string[];

  // Metadata
  notes: string;
  createdAt: Date;
}

// Algorithm display names
export const GENERATION_ALGORITHM_NAMES: Record<GenerationAlgorithm, string> = {
  'linear': 'Linear Progression',
  'golden-ratio': 'Golden Ratio',
  'logarithmic': 'Logarithmic Scale',
};

// Algorithm descriptions
export const GENERATION_ALGORITHM_DESCRIPTIONS: Record<GenerationAlgorithm, string> = {
  'linear': 'Equal volume increments between bottles',
  'golden-ratio': 'Each bottle is φ (1.618) times the previous',
  'logarithmic': 'Volumes increase on a logarithmic scale',
};

// Default generation config
export const DEFAULT_GENERATION_CONFIG: GenerationConfig = {
  algorithm: 'linear',
  minVolume: 65,
  maxVolume: 700,
  bottleCount: 5,
  baseTemplateId: 'boston-round',
  fillRangeMin: 65,
  fillRangeMax: 85,
};

// Gap severity thresholds (mL)
export const GAP_SEVERITY_THRESHOLDS = {
  minor: 20,    // < 20 mL gap
  moderate: 50, // 20-50 mL gap
  // major: > 50 mL gap
};
