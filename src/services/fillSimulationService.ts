/**
 * Fill Simulation Service
 * Core simulation logic for dropping products into bottles.
 * This service provides utility functions used by the SimulationController
 * component which runs inside the React Three Fiber render loop.
 */

import { BottleDimensions } from '@/types/bottle';
import { Product } from '@/types/product';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a random spawn position above the bottle neck.
 * Products are spawned within 85% of the neck inner radius.
 */
export function getSpawnPosition(dims: BottleDimensions): [number, number, number] {
  const neckInnerR = (dims.neckDiameter / 2 - dims.wallThickness) * 0.85;
  const spawnHeight = dims.bodyHeight + 30; // 30mm above bottle top
  
  // Random position within circle
  const angle = Math.random() * Math.PI * 2;
  const r = Math.random() * neckInnerR;
  
  return [
    Math.cos(angle) * r,
    spawnHeight,
    Math.sin(angle) * r,
  ];
}

/**
 * Generate a random quaternion for initial product orientation.
 */
export function getRandomRotation(): [number, number, number, number] {
  // Random unit quaternion using Marsaglia's method
  let u1: number, u2: number, s1: number;
  do {
    u1 = Math.random() * 2 - 1;
    u2 = Math.random() * 2 - 1;
    s1 = u1 * u1 + u2 * u2;
  } while (s1 >= 1);
  
  let u3: number, u4: number, s2: number;
  do {
    u3 = Math.random() * 2 - 1;
    u4 = Math.random() * 2 - 1;
    s2 = u3 * u3 + u4 * u4;
  } while (s2 >= 1);
  
  const root = Math.sqrt((1 - s1) / s2);
  return [u1, u2, u3 * root, u4 * root];
}

/**
 * Generate a unique ID for a product body instance.
 */
export function generateBodyId(): string {
  return uuidv4();
}

/**
 * Get the Rapier collider parameters for a product shape.
 * Returns the collider type and dimensions needed for @react-three/rapier.
 */
export interface ProductColliderParams {
  type: 'cylinder' | 'capsule' | 'cuboid';
  args: number[]; // Collider-specific arguments
}

export function getProductColliderParams(product: Product): ProductColliderParams {
  const { shape, dimensions } = product;
  const { length, width, height } = dimensions;
  
  switch (shape) {
    case 'round-tablet':
      // Cylinder: halfHeight, radius
      return {
        type: 'cylinder',
        args: [height / 2, length / 2],
      };
    case 'capsule':
      // Capsule: halfHeight (of cylinder part), radius
      return {
        type: 'capsule',
        args: [(length - width) / 2, width / 2],
      };
    case 'oblong-tablet':
      // Approximate as capsule
      return {
        type: 'capsule',
        args: [(length - height) / 2, height / 2],
      };
    case 'gummy':
      // Cuboid: halfExtents [x, y, z]
      return {
        type: 'cuboid',
        args: [length / 2, height / 2, width / 2],
      };
    case 'dome':
      // Semi-sphere approximated as a sphere collider (half height)
      // Use a cylinder as best approximation for Rapier
      return {
        type: 'cylinder',
        args: [height / 2, length / 2],
      };
    case 'gummy-cylinder':
      // Cylinder: halfHeight, radius
      return {
        type: 'cylinder',
        args: [height / 2, length / 2],
      };
    default:
      return {
        type: 'cuboid',
        args: [length / 2, height / 2, width / 2],
      };
  }
}

/**
 * Get the Three.js mesh geometry type and args for visual rendering.
 */
export interface ProductMeshParams {
  geometryType: 'cylinder' | 'capsule' | 'box' | 'sphere';
  args: number[];
}

export function getProductMeshParams(product: Product): ProductMeshParams {
  const { shape, dimensions } = product;
  const { length, width, height } = dimensions;
  
  switch (shape) {
    case 'round-tablet':
      // CylinderGeometry: radiusTop, radiusBottom, height, segments
      return {
        geometryType: 'cylinder',
        args: [length / 2, length / 2, height, 16],
      };
    case 'capsule':
      // CapsuleGeometry: radius, length, capSegments, radialSegments
      return {
        geometryType: 'capsule',
        args: [width / 2, length - width, 8, 16],
      };
    case 'oblong-tablet':
      // Approximate as capsule
      return {
        geometryType: 'capsule',
        args: [height / 2, length - height, 8, 16],
      };
    case 'gummy':
      // BoxGeometry: width, height, depth
      return {
        geometryType: 'box',
        args: [length, height, width],
      };
    case 'dome':
      // SphereGeometry rendered as half-sphere visually, but use sphere for simplicity
      // SphereGeometry: radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength
      return {
        geometryType: 'sphere',
        args: [length / 2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2],
      };
    case 'gummy-cylinder':
      // CylinderGeometry: radiusTop, radiusBottom, height, segments
      return {
        geometryType: 'cylinder',
        args: [length / 2, length / 2, height, 16],
      };
    default:
      return {
        geometryType: 'box',
        args: [length, height, width],
      };
  }
}

/**
 * Check if a position is inside the bottle bounds.
 */
export function isInsideBottle(
  position: [number, number, number],
  dims: BottleDimensions
): boolean {
  const [x, y, z] = position;
  const wt = dims.wallThickness;
  const floorThickness = Math.max(wt * 3, 3);
  const bodyR = dims.diameter / 2;
  const neckR = dims.neckDiameter / 2;
  const bodyH = dims.bodyHeight - dims.neckHeight;
  const totalH = dims.bodyHeight;
  
  // Must be above floor slab
  if (y < floorThickness) return false;
  
  // Must be below top (2% tolerance)
  if (y > totalH * 1.02) return false;
  
  // Radial check
  const horizontalDist = Math.sqrt(x * x + z * z);
  const maxR = y < bodyH
    ? bodyR - wt * 0.75
    : neckR - wt * 0.75;
  
  return horizontalDist <= maxR;
}

/**
 * Determine the color for a product based on simulation state.
 */
export function getProductColor(
  baseColor: string,
  isInside: boolean,
  isComplete: boolean
): string {
  if (!isComplete) return baseColor;
  return isInside ? '#22c55e' : '#ef4444'; // green / red
}

/**
 * Calculate fill simulation results.
 */
export function calculateResults(
  targetQuantity: number,
  productBodies: Array<{ isInside: boolean }>,
  product: Product,
  bottleVolumeMl: number,
  simulationTime: number
): {
  targetQuantity: number;
  actualQuantity: number;
  overflow: number;
  fillEfficiency: number;
  bottleVolume: number;
  productVolume: number;
  totalProductVolume: number;
  simulationTime: number;
  productPositions: Array<{ id: string; position: [number, number, number]; rotation: [number, number, number, number]; isInside: boolean }>;
} {
  const actualQuantity = productBodies.filter(b => b.isInside).length;
  const overflow = productBodies.filter(b => !b.isInside).length;
  const productVolumeMm3 = product.volume;
  const totalProductVolumeMm3 = actualQuantity * productVolumeMm3;
  const bottleVolumeInMm3 = bottleVolumeMl * 1000; // ml to mm³
  const fillEfficiency = bottleVolumeInMm3 > 0
    ? (totalProductVolumeMm3 / bottleVolumeInMm3) * 100
    : 0;
  
  return {
    targetQuantity,
    actualQuantity,
    overflow,
    fillEfficiency,
    bottleVolume: bottleVolumeMl,
    productVolume: productVolumeMm3,
    totalProductVolume: totalProductVolumeMm3,
    simulationTime,
    productPositions: [],
  };
}
