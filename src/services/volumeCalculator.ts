/**
 * Volume Calculator Service
 * Precise mathematical formulas for pharmaceutical bottle volume calculation
 */

import { Bottle, BottleDimensions, BottleShape } from '@/types';

/**
 * Volume Calculation Engine
 * 
 * Calculates internal volume of pharmaceutical bottles
 * using precise mathematical formulas for various shapes.
 * All dimensions are in mm, output is in ml (cm³)
 */
export class VolumeCalculator {
  
  /**
   * CYLINDER VOLUME
   * V = π × r² × h
   */
  static cylinder(radius: number, height: number): number {
    return Math.PI * Math.pow(radius, 2) * height;
  }
  
  /**
   * TRUNCATED CONE (FRUSTUM)
   * V = (π × h / 3) × (r1² + r1×r2 + r2²)
   * Used for shoulder and neck transitions
   */
  static frustum(r1: number, r2: number, height: number): number {
    return (Math.PI * height / 3) * 
           (Math.pow(r1, 2) + r1 * r2 + Math.pow(r2, 2));
  }
  
  /**
   * SPHERICAL CAP
   * V = (π × h² / 3) × (3r - h)
   * Used for rounded shoulders and bases
   */
  static sphericalCap(radius: number, height: number): number {
    if (height <= 0 || radius <= 0) return 0;
    return (Math.PI * Math.pow(height, 2) / 3) * (3 * radius - height);
  }
  
  /**
   * ELLIPSOID SECTION
   * V = (4/3) × π × a × b × c × (fraction)
   * Used for oval bottles
   */
  static ellipsoidSection(a: number, b: number, c: number, fraction: number = 1): number {
    return (4 / 3) * Math.PI * a * b * c * fraction;
  }
  
  /**
   * ELLIPTICAL CYLINDER
   * V = π × a × b × h
   * Used for oval bottle bodies
   */
  static ellipticalCylinder(a: number, b: number, height: number): number {
    return Math.PI * a * b * height;
  }
  
  /**
   * BOSTON ROUND BOTTLE
   * Composed of:
   * - Cylindrical body
   * - Curved shoulder transition
   * - Cylindrical neck
   * - Base indent (subtracted)
   */
  static bostonRound(dims: BottleDimensions): number {
    const bodyRadius = (dims.diameter / 2) - dims.wallThickness;
    const neckRadius = (dims.neckDiameter / 2) - dims.wallThickness;
    
    // Calculate shoulder curve geometry
    const shoulderAngleRad = dims.shoulderAngle * Math.PI / 180;
    const shoulderHeight = dims.shoulderCurveRadius * (1 - Math.cos(shoulderAngleRad));
    
    // Body cylinder (main volume)
    const bodyHeight = dims.bodyHeight - dims.neckHeight - shoulderHeight - dims.baseIndentDepth;
    const bodyVolume = this.cylinder(bodyRadius, Math.max(0, bodyHeight));
    
    // Shoulder transition (frustum approximation)
    const shoulderVolume = this.frustum(bodyRadius, neckRadius, shoulderHeight);
    
    // Neck cylinder
    const neckVolume = this.cylinder(neckRadius, dims.neckHeight);
    
    // Base indent (subtract for concave bases)
    let baseIndentVolume = 0;
    if (dims.baseProfile === 'concave' && dims.baseIndentDepth > 0) {
      baseIndentVolume = this.sphericalCap(dims.baseDiameter / 2, dims.baseIndentDepth);
    }
    
    // Total internal volume in mm³, convert to ml
    const totalMm3 = bodyVolume + shoulderVolume + neckVolume - baseIndentVolume;
    return Math.max(0, totalMm3 / 1000); // Convert mm³ to ml (cm³)
  }
  
  /**
   * CYLINDER BOTTLE
   * Simple cylindrical body with neck
   */
  static cylinderBottle(dims: BottleDimensions): number {
    const bodyRadius = (dims.diameter / 2) - dims.wallThickness;
    const neckRadius = (dims.neckDiameter / 2) - dims.wallThickness;
    
    // Body cylinder
    const bodyHeight = dims.bodyHeight - dims.neckHeight;
    const bodyVolume = this.cylinder(bodyRadius, bodyHeight);
    
    // Neck cylinder
    const neckVolume = this.cylinder(neckRadius, dims.neckHeight);
    
    // Transition (small frustum)
    const transitionHeight = Math.min(5, dims.shoulderCurveRadius);
    const transitionVolume = this.frustum(bodyRadius, neckRadius, transitionHeight);
    
    const totalMm3 = bodyVolume + neckVolume + transitionVolume;
    return Math.max(0, totalMm3 / 1000);
  }
  
  /**
   * OVAL BOTTLE
   * Uses elliptical cross-section
   */
  static oval(dims: BottleDimensions): number {
    const widthRatio = dims.widthRatio || 0.6;
    const a = (dims.diameter / 2) - dims.wallThickness;  // Major axis
    const b = a * widthRatio;                             // Minor axis
    
    // Elliptical cylinder for body
    const bodyHeight = dims.bodyHeight - dims.neckHeight - dims.shoulderCurveRadius;
    const bodyVolume = this.ellipticalCylinder(a, b, Math.max(0, bodyHeight));
    
    // Neck (circular)
    const neckRadius = (dims.neckDiameter / 2) - dims.wallThickness;
    const neckVolume = this.cylinder(neckRadius, dims.neckHeight);
    
    // Transition zone (approximate with frustum using equivalent radius)
    const equivalentRadius = Math.sqrt(a * b);
    const transitionVolume = this.frustum(
      equivalentRadius,
      neckRadius,
      dims.shoulderCurveRadius
    );
    
    const totalMm3 = bodyVolume + neckVolume + transitionVolume;
    return Math.max(0, totalMm3 / 1000);
  }
  
  /**
   * MODERN PHARMACEUTICAL
   * Rectangular with rounded corners
   */
  static modernPharmaceutical(dims: BottleDimensions): number {
    const cornerRadius = Math.min(dims.shoulderCurveRadius, 10);
    const width = dims.diameter - 2 * dims.wallThickness;
    const depth = width * (dims.widthRatio || 0.5);
    const height = dims.bodyHeight - dims.neckHeight;
    
    // Rectangle volume
    const rectVolume = width * depth * height;
    
    // Subtract corners and add back rounded corner volume
    // Corner correction: 4 quarter-cylinders minus 4 rectangular corners
    const cornerCorrection = (4 - Math.PI) * Math.pow(cornerRadius, 2) * height;
    
    const bodyVolume = rectVolume - cornerCorrection;
    
    // Neck (circular)
    const neckRadius = (dims.neckDiameter / 2) - dims.wallThickness;
    const neckVolume = this.cylinder(neckRadius, dims.neckHeight);
    
    // Transition (approximate)
    const equivalentRadius = Math.sqrt((width * depth) / Math.PI);
    const transitionVolume = this.frustum(equivalentRadius, neckRadius, 5);
    
    const totalMm3 = bodyVolume + neckVolume + transitionVolume;
    return Math.max(0, totalMm3 / 1000);
  }
  
  /**
   * PACKER BOTTLE
   * Wide-mouth cylindrical with short neck
   */
  static packer(dims: BottleDimensions): number {
    const bodyRadius = (dims.diameter / 2) - dims.wallThickness;
    const neckRadius = (dims.neckDiameter / 2) - dims.wallThickness;
    
    // Body cylinder
    const bodyHeight = dims.bodyHeight - dims.neckHeight - dims.shoulderCurveRadius;
    const bodyVolume = this.cylinder(bodyRadius, Math.max(0, bodyHeight));
    
    // Shoulder (frustum)
    const shoulderVolume = this.frustum(bodyRadius, neckRadius, dims.shoulderCurveRadius);
    
    // Neck
    const neckVolume = this.cylinder(neckRadius, dims.neckHeight);
    
    const totalMm3 = bodyVolume + shoulderVolume + neckVolume;
    return Math.max(0, totalMm3 / 1000);
  }
  
  /**
   * WIDE MOUTH BOTTLE
   * Similar to packer but with very wide opening
   */
  static widemouth(dims: BottleDimensions): number {
    // Same calculation as packer
    return this.packer(dims);
  }
  
  /**
   * NUMERICAL INTEGRATION
   * For complex shapes, use Simpson's rule
   * radiusFunction: function that returns radius at height h
   */
  static numericalIntegration(
    radiusFunction: (h: number) => number,
    height: number,
    segments: number = 100
  ): number {
    const dh = height / segments;
    let volume = 0;
    
    for (let i = 0; i < segments; i++) {
      const h1 = i * dh;
      const h2 = (i + 1) * dh;
      const hMid = (h1 + h2) / 2;
      
      const r1 = radiusFunction(h1);
      const r2 = radiusFunction(h2);
      const rMid = radiusFunction(hMid);
      
      // Simpson's rule for this segment
      volume += (dh / 6) * Math.PI * (
        Math.pow(r1, 2) + 
        4 * Math.pow(rMid, 2) + 
        Math.pow(r2, 2)
      );
    }
    
    return volume / 1000; // Convert to ml
  }
  
  /**
   * Main calculation dispatcher
   */
  static calculate(bottle: Bottle): number {
    return this.calculateFromDimensions(bottle.shape, bottle.dimensions);
  }
  
  /**
   * Calculate volume from shape and dimensions
   */
  static calculateFromDimensions(shape: BottleShape, dims: BottleDimensions): number {
    switch (shape) {
      case 'boston-round':
        return this.bostonRound(dims);
      case 'cylinder':
        return this.cylinderBottle(dims);
      case 'oval':
        return this.oval(dims);
      case 'modern-pharmaceutical':
        return this.modernPharmaceutical(dims);
      case 'packer':
        return this.packer(dims);
      case 'wide-mouth':
        return this.widemouth(dims);
      default:
        return this.bostonRound(dims);
    }
  }
  
  /**
   * Calculate surface area (approximate)
   * Used for label sizing calculations
   */
  static calculateSurfaceArea(bottle: Bottle): number {
    const dims = bottle.dimensions;
    const bodyRadius = dims.diameter / 2;
    const bodyHeight = dims.bodyHeight - dims.neckHeight;
    
    // Lateral surface area of cylinder approximation
    const lateralArea = 2 * Math.PI * bodyRadius * bodyHeight;
    
    // Top and bottom circles
    const endAreas = 2 * Math.PI * Math.pow(bodyRadius, 2);
    
    // Total in mm², convert to cm²
    return (lateralArea + endAreas) / 100;
  }
  
  /**
   * Estimate dimensions for a target volume
   * Useful for generating bottles with specific volumes
   */
  static estimateDimensionsForVolume(
    targetVolume: number,
    shape: BottleShape,
    baseDims: Partial<BottleDimensions>
  ): BottleDimensions {
    // Start with base dimensions
    const dims: BottleDimensions = {
      height: baseDims.height || 100,
      bodyHeight: baseDims.bodyHeight || 85,
      diameter: baseDims.diameter || 45,
      neckHeight: baseDims.neckHeight || 15,
      neckDiameter: baseDims.neckDiameter || 22,
      neckFinish: baseDims.neckFinish || '28-400',
      shoulderCurveRadius: baseDims.shoulderCurveRadius || 15,
      shoulderAngle: baseDims.shoulderAngle || 45,
      baseProfile: baseDims.baseProfile || 'flat',
      baseDiameter: baseDims.baseDiameter || 45,
      baseIndentDepth: baseDims.baseIndentDepth || 0,
      wallThickness: baseDims.wallThickness || 1.5,
      widthRatio: baseDims.widthRatio,
    };
    
    // Calculate current volume
    let currentVolume = this.calculateFromDimensions(shape, dims);
    
    // Iteratively adjust dimensions to match target volume
    const maxIterations = 20;
    const tolerance = 0.5; // ml
    
    for (let i = 0; i < maxIterations; i++) {
      if (Math.abs(currentVolume - targetVolume) < tolerance) {
        break;
      }
      
      // Scale factor based on volume ratio (cube root for 3D scaling)
      const scaleFactor = Math.pow(targetVolume / currentVolume, 1/3);
      
      // Apply scaling to dimensions
      dims.diameter *= scaleFactor;
      dims.bodyHeight *= scaleFactor;
      dims.height = dims.bodyHeight + dims.neckHeight;
      dims.baseDiameter = dims.diameter;
      
      // Recalculate
      currentVolume = this.calculateFromDimensions(shape, dims);
    }
    
    // Round dimensions to reasonable precision
    dims.height = Math.round(dims.height * 10) / 10;
    dims.bodyHeight = Math.round(dims.bodyHeight * 10) / 10;
    dims.diameter = Math.round(dims.diameter * 10) / 10;
    dims.baseDiameter = dims.diameter;
    
    return dims;
  }
}

export default VolumeCalculator;
