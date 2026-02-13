/**
 * Bottle Generation Service
 * Generates series of bottles using mathematical algorithms
 * and scales bottle dimensions to match target volumes.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  Bottle,
  BottleShape,
  BottleDimensions,
  DEFAULT_DIMENSIONS,
} from '@/types/bottle';
import { GenerationConfig } from '@/types/bottleSeries';
import { VolumeCalculator } from './volumeCalculator';

// Golden ratio constant
const PHI = 1.618033988749895;

// ─── EDITABLE PARAMETERS ──────────────────────────────────────────────
// Adjust these constants to control bottle generation constraints.

/**
 * Height-to-diameter ratio limits.
 * Prevents bottles from becoming unrealistically tall or squat.
 * Typical pharmaceutical bottles have ratios between 1.2 and 3.5.
 */
const MIN_HEIGHT_DIAMETER_RATIO = 1.2;
const MAX_HEIGHT_DIAMETER_RATIO = 3.0;

/**
 * Height scaling limits (ratio relative to the template's original body height).
 * Used as a secondary guard during height-only scaling.
 */
const MIN_HEIGHT_RATIO = 0.3;
const MAX_HEIGHT_RATIO = 3.0;

/**
 * Standard bottle diameters (mm) by approximate volume range.
 * The generator will pick the closest standard diameter for each target volume.
 * These are common HDPE pharmaceutical bottle diameters.
 * Add or modify entries to match your product line.
 */
const STANDARD_BOTTLE_DIAMETERS: { maxVolume: number; diameter: number }[] = [
  { maxVolume: 30,   diameter: 48 },
  { maxVolume: 60,   diameter: 48 },
  { maxVolume: 120,  diameter: 58 },
  { maxVolume: 200,  diameter: 58 },
  { maxVolume: 300,  diameter: 58 },
  { maxVolume: 500,  diameter: 78 },
  { maxVolume: 750,  diameter: 78 },
  { maxVolume: 1000, diameter: 78 },
  { maxVolume: 2000, diameter: 98 },
];

/**
 * Standard cap diameters (mm) by bottle diameter.
 * Maps bottle body diameter to the appropriate cap/neck finish diameter.
 * Neck diameter is approximately bottleDiameter - 8 for flush fit with cap.
 */
const STANDARD_CAP_DIAMETERS: { bottleDiameter: number; neckDiameter: number; neckFinish: string }[] = [
  { bottleDiameter: 28, neckDiameter: 20, neckFinish: '20-400' },
  { bottleDiameter: 33, neckDiameter: 25, neckFinish: '24-400' },
  { bottleDiameter: 38, neckDiameter: 30, neckFinish: '28-400' },
  { bottleDiameter: 43, neckDiameter: 35, neckFinish: '28-400' },
  { bottleDiameter: 48, neckDiameter: 40, neckFinish: '33-400' },
  { bottleDiameter: 53, neckDiameter: 45, neckFinish: '33-400' },
  { bottleDiameter: 58, neckDiameter: 50, neckFinish: '38-400' },
  { bottleDiameter: 63, neckDiameter: 55, neckFinish: '38-400' },
  { bottleDiameter: 75, neckDiameter: 67, neckFinish: '45-400' },
];

/**
 * Service for generating bottle series based on mathematical progressions.
 *
 * Usage:
 *   const bottles = BottleGenerationService.generateSeries(config);
 */
export class BottleGenerationService {

  /**
   * Generate a series of bottles based on the provided configuration.
   * 1. Calculates target volumes using the selected algorithm
   * 2. Retrieves the base template
   * 3. Scales each bottle to match its target volume
   */
  static generateSeries(config: GenerationConfig, existingBottles?: Record<string, Bottle>): Bottle[] {
    // 1. Calculate target volumes
    const volumes = this.calculateVolumes(config);

    // 2. Get base template
    const template = this.getTemplate(config.baseTemplateId, existingBottles);

    // 3. Generate bottles by scaling template to each target volume
    return volumes.map((volume, index) =>
      this.scaleBottleToVolume(template, volume, index)
    );
  }

  /**
   * Calculate target volumes using the selected algorithm.
   */
  static calculateVolumes(config: GenerationConfig): number[] {
    switch (config.algorithm) {
      case 'linear':
        return this.linearProgression(config.minVolume, config.maxVolume, config.bottleCount);
      case 'golden-ratio':
        return this.goldenRatioProgression(config.minVolume, config.maxVolume, config.bottleCount);
      case 'logarithmic':
        return this.logarithmicProgression(config.minVolume, config.maxVolume, config.bottleCount);
      default:
        return this.linearProgression(config.minVolume, config.maxVolume, config.bottleCount);
    }
  }

  // ─── Volume Progression Algorithms ──────────────────────────────────

  /**
   * LINEAR PROGRESSION
   * V(i) = V_min + (V_max - V_min) * i / (n-1)
   * Equal volume increments between bottles.
   */
  static linearProgression(minVolume: number, maxVolume: number, count: number): number[] {
    if (count <= 1) return [minVolume];
    const step = (maxVolume - minVolume) / (count - 1);
    return Array.from({ length: count }, (_, i) =>
      Math.round(minVolume + step * i)
    );
  }

  /**
   * GOLDEN RATIO PROGRESSION
   * V(i) = V_min * r^i  where r is chosen so V(n-1) ≈ V_max.
   * If the needed ratio is ≤ φ we use φ; otherwise we use the exact ratio.
   */
  static goldenRatioProgression(minVolume: number, maxVolume: number, count: number): number[] {
    if (count <= 1) return [minVolume];

    // Calculate the ratio needed to span from min to max
    const neededRatio = Math.pow(maxVolume / minVolume, 1 / (count - 1));

    // Use golden ratio if it fits, otherwise use calculated ratio
    const ratio = neededRatio <= PHI ? PHI : neededRatio;

    const volumes: number[] = [];
    let currentVolume = minVolume;

    for (let i = 0; i < count; i++) {
      volumes.push(Math.round(currentVolume));
      currentVolume *= ratio;

      // Cap at max volume for the last bottle
      if (i === count - 2) {
        currentVolume = maxVolume;
      }
    }

    return volumes;
  }

  /**
   * LOGARITHMIC PROGRESSION
   * V(i) = exp(log(V_min) + (log(V_max) - log(V_min)) * i / (n-1))
   * Produces denser spacing at lower volumes.
   */
  static logarithmicProgression(minVolume: number, maxVolume: number, count: number): number[] {
    if (count <= 1) return [minVolume];

    const logMin = Math.log(minVolume);
    const logMax = Math.log(maxVolume);
    const logStep = (logMax - logMin) / (count - 1);

    return Array.from({ length: count }, (_, i) =>
      Math.round(Math.exp(logMin + logStep * i))
    );
  }

  // ─── Template Resolution ────────────────────────────────────────────

  /**
   * Get a base bottle template from a shape name or existing bottle ID.
   * Falls back to boston-round defaults if not found.
   */
  private static getTemplate(baseTemplateId: string, existingBottles?: Record<string, Bottle>): Bottle {
    // Check if it's an existing bottle ID
    if (existingBottles && existingBottles[baseTemplateId]) {
      return { ...existingBottles[baseTemplateId] };
    }

    // Check if it's a shape name
    const shape = baseTemplateId as BottleShape;
    const defaultDims = DEFAULT_DIMENSIONS[shape];

    if (defaultDims) {
      return this.createTemplateFromShape(shape);
    }

    // Fallback to boston-round
    return this.createTemplateFromShape('boston-round');
  }

  /**
   * Create a full Bottle object from a shape's default dimensions.
   */
  private static createTemplateFromShape(shape: BottleShape): Bottle {
    const dims = DEFAULT_DIMENSIONS[shape];
    const baseDiameter = dims.diameter ?? 45;

    const fullDims: BottleDimensions = {
      height: dims.height ?? 100,
      bodyHeight: dims.bodyHeight ?? 85,
      diameter: baseDiameter,
      neckHeight: dims.neckHeight ?? 15,
      neckDiameter: dims.neckDiameter ?? 22,
      neckFinish: dims.neckFinish ?? '28-400',
      shoulderCurveRadius: dims.shoulderCurveRadius ?? 15,
      shoulderAngle: dims.shoulderAngle ?? 45,
      baseProfile: dims.baseProfile ?? 'flat',
      baseDiameter: dims.baseDiameter ?? 45,
      baseIndentDepth: dims.baseIndentDepth ?? 0,
      wallThickness: dims.wallThickness ?? 1.5,
      widthRatio: dims.widthRatio,
    };

    // Boston Round specific overrides
    if (shape === 'boston-round') {
      fullDims.shoulderCurveRadius = 4;
      fullDims.neckHeight = 5;
      fullDims.neckDiameter = baseDiameter - 8; // ~8mm less than body for flush fit with cap
      fullDims.height = fullDims.bodyHeight + fullDims.neckHeight;
    }

    // Default body color: light blue for boston-round, white for others
    const defaultBodyColor = shape === 'boston-round' ? '#9696FF' : '#FFFFFF';

    const template: Bottle = {
      id: 'template',
      name: shape,
      shape,
      dimensions: fullDims,
      capStyle: 'screw-cap',
      capColor: '#FFFFFF',
      bodyColor: defaultBodyColor,
      material: 'HDPE',
      opacity: 1,
      labelZones: [],
      volume: 0,
      surfaceArea: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isCustom: false,
    };

    template.volume = VolumeCalculator.calculate(template);
    template.surfaceArea = VolumeCalculator.calculateSurfaceArea(template);

    return template;
  }

  // ─── Utility: Standard Diameter Lookup ───────────────────────────────

  /**
   * Look up the standard bottle diameter for a given target volume.
   */
  private static getStandardDiameter(targetVolume: number): number {
    for (const entry of STANDARD_BOTTLE_DIAMETERS) {
      if (targetVolume <= entry.maxVolume) {
        return entry.diameter;
      }
    }
    // Larger than any standard – use the biggest
    return STANDARD_BOTTLE_DIAMETERS[STANDARD_BOTTLE_DIAMETERS.length - 1].diameter;
  }

  /**
   * Look up the standard cap/neck dimensions for a given bottle diameter.
   */
  private static getStandardCapDimensions(bottleDiameter: number): { neckDiameter: number; neckFinish: string } {
    // Find the closest match
    let best = STANDARD_CAP_DIAMETERS[0];
    let bestDiff = Math.abs(bottleDiameter - best.bottleDiameter);
    for (const entry of STANDARD_CAP_DIAMETERS) {
      const diff = Math.abs(bottleDiameter - entry.bottleDiameter);
      if (diff < bestDiff) {
        best = entry;
        bestDiff = diff;
      }
    }
    return { neckDiameter: best.neckDiameter, neckFinish: best.neckFinish };
  }

  // ─── Bottle Scaling ─────────────────────────────────────────────────

  /**
   * Scale a template bottle to match a target volume.
   *
   * Strategy:
   *   1. Pick a standard diameter for the target volume
   *   2. Assign matching neck/cap dimensions
   *   3. Calculate the body height needed to achieve the target volume
   *   4. Enforce height-to-diameter ratio limits
   *   5. Fine-tune with iterative adjustment
   */
  private static scaleBottleToVolume(
    template: Bottle,
    targetVolume: number,
    index: number
  ): Bottle {
    const templateVolume = template.volume;
    if (templateVolume <= 0) {
      // Can't scale from zero volume – return a copy
      return this.finalizeBottle(template, targetVolume, index);
    }

    // 1. Pick standard diameter for this volume
    const stdDiameter = this.getStandardDiameter(targetVolume);
    const stdCap = this.getStandardCapDimensions(stdDiameter);

    // 2. Start with template dimensions, override diameter and neck
    const newDims: BottleDimensions = {
      ...template.dimensions,
      diameter: stdDiameter,
      baseDiameter: stdDiameter,
      neckDiameter: stdCap.neckDiameter,
      neckFinish: stdCap.neckFinish,
    };

    // 3. Estimate body height from target volume
    //    V ≈ π × (d/2)² × bodyHeight  (simplified cylinder approximation)
    //    bodyHeight ≈ V / (π × (d/2)²)
    //    We convert mL to mm³: 1 mL = 1000 mm³
    const crossSectionArea = Math.PI * Math.pow((stdDiameter - 2 * newDims.wallThickness) / 2, 2);
    let bodyHeight = (targetVolume * 1000) / crossSectionArea;

    // 4. Enforce height-to-diameter ratio limits
    const minHeight = stdDiameter * MIN_HEIGHT_DIAMETER_RATIO;
    const maxHeight = stdDiameter * MAX_HEIGHT_DIAMETER_RATIO;
    bodyHeight = Math.max(minHeight, Math.min(maxHeight, bodyHeight));

    // Also enforce height scaling ratio relative to template
    const templateBodyHeight = template.dimensions.bodyHeight;
    const minByRatio = templateBodyHeight * MIN_HEIGHT_RATIO;
    const maxByRatio = templateBodyHeight * MAX_HEIGHT_RATIO;
    bodyHeight = Math.max(minByRatio, Math.min(maxByRatio, bodyHeight));

    newDims.bodyHeight = bodyHeight;
    newDims.height = bodyHeight + newDims.neckHeight;

    // Scale shoulder curve proportionally to diameter
    const diameterScale = stdDiameter / template.dimensions.diameter;
    newDims.shoulderCurveRadius = template.dimensions.shoulderCurveRadius * diameterScale;

    let scaledBottle: Bottle = {
      ...template,
      dimensions: newDims,
    };

    // 5. Fine-tune with iterative adjustment (up to 15 iterations)
    let scaledVolume = VolumeCalculator.calculate(scaledBottle);
    scaledBottle = this.fineTuneVolume(scaledBottle, targetVolume, scaledVolume, 15);

    // Re-enforce ratio limits after fine-tuning
    scaledBottle = this.enforceRatioLimits(scaledBottle);

    return this.finalizeBottle(scaledBottle, targetVolume, index);
  }

  /**
   * Enforce height-to-diameter ratio limits on a bottle.
   */
  private static enforceRatioLimits(bottle: Bottle): Bottle {
    const dims = { ...bottle.dimensions };
    const ratio = dims.bodyHeight / dims.diameter;

    if (ratio > MAX_HEIGHT_DIAMETER_RATIO) {
      dims.bodyHeight = dims.diameter * MAX_HEIGHT_DIAMETER_RATIO;
      dims.height = dims.bodyHeight + dims.neckHeight;
    } else if (ratio < MIN_HEIGHT_DIAMETER_RATIO) {
      dims.bodyHeight = dims.diameter * MIN_HEIGHT_DIAMETER_RATIO;
      dims.height = dims.bodyHeight + dims.neckHeight;
    }

    return { ...bottle, dimensions: dims };
  }

  /**
   * Iteratively fine-tune dimensions to get within 1% of target volume.
   * Adjusts body height while respecting ratio limits.
   */
  private static fineTuneVolume(
    bottle: Bottle,
    targetVolume: number,
    currentVolume: number,
    maxIterations: number = 15
  ): Bottle {
    const tolerance = targetVolume * 0.01; // 1% tolerance
    let adjusted = { ...bottle, dimensions: { ...bottle.dimensions } };
    let vol = currentVolume;

    for (let i = 0; i < maxIterations; i++) {
      if (Math.abs(vol - targetVolume) <= tolerance) break;

      // Adjust body height proportionally
      const adjustmentRatio = targetVolume / vol;
      adjusted.dimensions.bodyHeight *= adjustmentRatio;

      // Clamp to ratio limits
      const minH = adjusted.dimensions.diameter * MIN_HEIGHT_DIAMETER_RATIO;
      const maxH = adjusted.dimensions.diameter * MAX_HEIGHT_DIAMETER_RATIO;
      adjusted.dimensions.bodyHeight = Math.max(minH, Math.min(maxH, adjusted.dimensions.bodyHeight));

      adjusted.dimensions.height = adjusted.dimensions.bodyHeight + adjusted.dimensions.neckHeight;

      vol = VolumeCalculator.calculate(adjusted);
    }

    return adjusted;
  }

  /**
   * Finalize a scaled bottle with unique ID, name, and recalculated metrics.
   */
  private static finalizeBottle(bottle: Bottle, targetVolume: number, _index: number): Bottle {
    const now = new Date();
    const finalBottle: Bottle = {
      ...bottle,
      id: uuidv4(),
      name: `${Math.round(targetVolume)} mL`,
      volume: VolumeCalculator.calculate(bottle),
      surfaceArea: VolumeCalculator.calculateSurfaceArea(bottle),
      createdAt: now,
      updatedAt: now,
      isCustom: false,
      // Round dimensions for cleanliness
      dimensions: {
        ...bottle.dimensions,
        height: Math.round(bottle.dimensions.height * 10) / 10,
        bodyHeight: Math.round(bottle.dimensions.bodyHeight * 10) / 10,
        diameter: Math.round(bottle.dimensions.diameter * 10) / 10,
        baseDiameter: Math.round(bottle.dimensions.baseDiameter * 10) / 10,
        neckDiameter: Math.round(bottle.dimensions.neckDiameter * 10) / 10,
      },
    };

    return finalBottle;
  }
}

export default BottleGenerationService;
