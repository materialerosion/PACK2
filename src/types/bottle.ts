/**
 * Bottle Type Definitions
 * Core types for pharmaceutical bottle modeling
 */

export type BottleShape = 
  | 'boston-round'
  | 'cylinder'
  | 'oval'
  | 'modern-pharmaceutical'
  | 'packer'
  | 'wide-mouth';

export type CapStyle = 
  | 'screw-cap'
  | 'child-resistant'
  | 'flip-top'
  | 'dropper'
  | 'pump'
  | 'spray';

export type BaseProfile = 
  | 'flat'
  | 'concave'
  | 'convex'
  | 'petaloid';

export type BottleMaterial = 'HDPE' | 'PET' | 'glass' | 'PP';

export interface BottleDimensions {
  // Primary dimensions (mm)
  height: number;              // Total height including cap
  bodyHeight: number;          // Body height without cap
  diameter: number;            // Maximum body diameter
  
  // Neck dimensions (mm)
  neckHeight: number;
  neckDiameter: number;
  neckFinish: string;          // e.g., "28-400", "33-400"
  
  // Shoulder parameters
  shoulderCurveRadius: number;
  shoulderAngle: number;       // degrees
  
  // Base parameters
  baseProfile: BaseProfile;
  baseDiameter: number;
  baseIndentDepth: number;     // For concave bases
  
  // For oval bottles
  widthRatio?: number;         // Width to depth ratio (0-1)
  
  // Wall thickness (for volume calculation)
  wallThickness: number;
}

export interface LabelZone {
  id: string;
  name: string;
  topOffset: number;           // mm from shoulder
  height: number;              // mm
  wrapAngle: number;           // degrees (360 for full wrap)
  color?: string;              // Preview color
}

export interface Bottle {
  id: string;
  name: string;
  shape: BottleShape;
  dimensions: BottleDimensions;
  capStyle: CapStyle;
  capColor: string;
  bodyColor: string;
  material: BottleMaterial;
  opacity: number;             // 0-1 for transparency
  labelZones: LabelZone[];
  
  // Calculated values
  volume: number;              // ml (calculated)
  surfaceArea: number;         // cm² (calculated)
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  isCustom: boolean;
  presetId?: string;
}

// Default bottle dimensions for different shapes
export const DEFAULT_DIMENSIONS: Record<BottleShape, Partial<BottleDimensions>> = {
  'boston-round': {
    height: 90,
    bodyHeight: 85,
    diameter: 45,
    neckHeight: 5,
    neckDiameter: 37,
    neckFinish: '28-400',
    shoulderCurveRadius: 4,
    shoulderAngle: 45,
    baseProfile: 'flat',
    baseDiameter: 45,
    baseIndentDepth: 0,
    wallThickness: 1.5,
  },
  'cylinder': {
    height: 120,
    bodyHeight: 105,
    diameter: 50,
    neckHeight: 15,
    neckDiameter: 24,
    neckFinish: '28-400',
    shoulderCurveRadius: 5,
    shoulderAngle: 90,
    baseProfile: 'flat',
    baseDiameter: 50,
    baseIndentDepth: 0,
    wallThickness: 1.5,
  },
  'oval': {
    height: 110,
    bodyHeight: 95,
    diameter: 55,
    neckHeight: 15,
    neckDiameter: 24,
    neckFinish: '28-400',
    shoulderCurveRadius: 12,
    shoulderAngle: 40,
    baseProfile: 'flat',
    baseDiameter: 55,
    baseIndentDepth: 0,
    widthRatio: 0.6,
    wallThickness: 1.5,
  },
  'modern-pharmaceutical': {
    height: 130,
    bodyHeight: 115,
    diameter: 60,
    neckHeight: 15,
    neckDiameter: 28,
    neckFinish: '33-400',
    shoulderCurveRadius: 8,
    shoulderAngle: 60,
    baseProfile: 'flat',
    baseDiameter: 60,
    baseIndentDepth: 0,
    widthRatio: 0.5,
    wallThickness: 2.0,
  },
  'packer': {
    height: 95,
    bodyHeight: 80,
    diameter: 55,
    neckHeight: 15,
    neckDiameter: 38,
    neckFinish: '38-400',
    shoulderCurveRadius: 10,
    shoulderAngle: 70,
    baseProfile: 'flat',
    baseDiameter: 55,
    baseIndentDepth: 0,
    wallThickness: 2.0,
  },
  'wide-mouth': {
    height: 85,
    bodyHeight: 70,
    diameter: 60,
    neckHeight: 15,
    neckDiameter: 53,
    neckFinish: '53-400',
    shoulderCurveRadius: 8,
    shoulderAngle: 80,
    baseProfile: 'flat',
    baseDiameter: 60,
    baseIndentDepth: 0,
    wallThickness: 2.0,
  },
};

// Shape display names
export const SHAPE_NAMES: Record<BottleShape, string> = {
  'boston-round': 'Boston Round',
  'cylinder': 'Cylinder',
  'oval': 'Oval',
  'modern-pharmaceutical': 'Modern Pharmaceutical',
  'packer': 'Packer',
  'wide-mouth': 'Wide Mouth',
};

// Cap style display names
export const CAP_STYLE_NAMES: Record<CapStyle, string> = {
  'screw-cap': 'Screw Cap',
  'child-resistant': 'Child Resistant',
  'flip-top': 'Flip Top',
  'dropper': 'Dropper',
  'pump': 'Pump Dispenser',
  'spray': 'Spray Nozzle',
};

// Material display names
export const MATERIAL_NAMES: Record<BottleMaterial, string> = {
  'HDPE': 'HDPE (High-Density Polyethylene)',
  'PET': 'PET (Polyethylene Terephthalate)',
  'glass': 'Glass',
  'PP': 'PP (Polypropylene)',
};
