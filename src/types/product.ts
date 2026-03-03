/**
 * Product Type Definitions
 * Types for pharmaceutical products used in fill simulation
 */

export type ProductShape = 'round-tablet' | 'capsule' | 'oblong-tablet' | 'gummy' | 'dome' | 'gummy-cylinder';

export interface ProductDimensions {
  // All in mm
  length: number;       // For capsules/oblongs: total length; for round: diameter
  width: number;        // For gummies: width; for round/capsule: same as length
  height: number;       // Thickness
  radius?: number;      // For capsule end-cap radius
}

export interface Product {
  id: string;
  name: string;
  shape: ProductShape;
  dimensions: ProductDimensions;
  mass: number;         // grams
  color: string;
  volume: number;       // mm³ (calculated)
}

// Product shape display names
export const PRODUCT_SHAPE_NAMES: Record<ProductShape, string> = {
  'round-tablet': 'Round Tablet',
  'capsule': 'Capsule',
  'oblong-tablet': 'Oblong Tablet',
  'gummy': 'Gummy',
  'dome': 'Dome (Semi-sphere)',
  'gummy-cylinder': 'Gummy Cylinder',
};
