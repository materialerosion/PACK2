/**
 * Product Presets
 * Pre-configured pharmaceutical product definitions for fill simulation
 */

import { Product, ProductShape } from '@/types/product';
import { v4 as uuidv4 } from 'uuid';

/**
 * Calculate approximate volume for a product based on its shape and dimensions.
 * All dimensions in mm, volume returned in mm³.
 */
export function calculateProductVolume(
  shape: ProductShape,
  length: number,
  width: number,
  height: number
): number {
  switch (shape) {
    case 'round-tablet': {
      // Cylinder: π * r² * h
      const r = length / 2;
      return Math.PI * r * r * height;
    }
    case 'capsule': {
      // Capsule: cylinder + two hemispheres
      const r = width / 2;
      const cylinderLength = length - width; // subtract the two end-cap radii
      const cylinderVol = Math.PI * r * r * cylinderLength;
      const sphereVol = (4 / 3) * Math.PI * r * r * r;
      return cylinderVol + sphereVol;
    }
    case 'oblong-tablet': {
      // Approximate as capsule shape
      const r = height / 2;
      const cylLen = length - height;
      const cylVol = Math.PI * r * r * cylLen;
      const sphVol = (4 / 3) * Math.PI * r * r * r;
      return cylVol + sphVol;
    }
    case 'gummy': {
      // Cuboid approximation
      return length * width * height;
    }
    case 'dome': {
      // Semi-sphere (oblate spheroid half): V = (2/3) * π * (d/2)² * h
      // where d = length (diameter), h = height
      const r = length / 2;
      return (2 / 3) * Math.PI * r * r * height;
    }
    case 'gummy-cylinder': {
      // Cylinder: π * r² * h
      // where d = length (diameter), h = height
      const cylR = length / 2;
      return Math.PI * cylR * cylR * height;
    }
    default:
      return length * width * height;
  }
}

/**
 * Create a product from parameters, auto-calculating volume.
 */
export function createProduct(
  name: string,
  shape: ProductShape,
  length: number,
  width: number,
  height: number,
  mass: number,
  color: string
): Product {
  return {
    id: uuidv4(),
    name,
    shape,
    dimensions: { length, width, height },
    mass,
    color,
    volume: calculateProductVolume(shape, length, width, height),
  };
}

/**
 * Product presets for common pharmaceutical products.
 * Dimensions in mm, mass in grams.
 */
export const PRODUCT_PRESETS: Product[] = [
  createProduct('Small Round Tablet', 'round-tablet', 8, 8, 3.5, 0.3, '#FFFFFF'),
  createProduct('Medium Round Tablet', 'round-tablet', 10, 10, 4.5, 0.5, '#F5F5DC'),
  createProduct('Large Round Tablet', 'round-tablet', 13, 13, 5.5, 0.8, '#FFFDD0'),
  createProduct('Standard Capsule (Size 0)', 'capsule', 21.7, 7.65, 7.65, 0.5, '#C41E3A'),
  createProduct('Large Capsule (Size 00)', 'capsule', 23.3, 8.53, 8.53, 0.7, '#1E3A5F'),
  createProduct('Oblong Tablet', 'oblong-tablet', 18, 8, 6, 0.9, '#FFFFFF'),
  createProduct('Softgel', 'capsule', 20, 8, 8, 0.8, '#DAA520'),
  createProduct('Gummy Bear', 'gummy', 15, 12, 8, 1.5, '#FF6347'),
  createProduct('Gummy Vitamin', 'gummy', 18, 14, 10, 2.0, '#FFA500'),
  createProduct('Dome Gummy', 'dome', 16, 16, 10, 1.8, '#FF69B4'),
  createProduct('Cylinder Gummy', 'gummy-cylinder', 14, 14, 10, 1.6, '#9370DB'),
];

/**
 * Get a fresh copy of a preset (with new ID) for use in simulation.
 */
export function getPresetCopy(presetIndex: number): Product {
  const preset = PRODUCT_PRESETS[presetIndex];
  if (!preset) throw new Error(`Invalid preset index: ${presetIndex}`);
  return {
    ...preset,
    id: uuidv4(),
    dimensions: { ...preset.dimensions },
  };
}
