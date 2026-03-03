/**
 * Bottle Collider Builder
 * Builds trimesh geometry data from bottle dimensions for Rapier physics colliders.
 * Generates a hollow open-top bottle shape from four geometric pieces:
 * - Bottom disc (solid floor)
 * - Body shell (hollow cylinder)
 * - Neck shell (hollow cylinder, narrower)
 * - Shoulder transition ring
 */

import { BottleDimensions } from '@/types/bottle';

export interface ColliderGeometry {
  vertices: Float32Array;
  indices: Uint32Array;
}

const SEGMENTS = 24; // Number of radial segments for cylinder approximation

/**
 * Generate a ring of vertices at a given height and radius.
 */
function generateRing(
  vertices: number[],
  radius: number,
  y: number,
  segments: number
): void {
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    vertices.push(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius
    );
  }
}

/**
 * Connect two rings of vertices with triangles.
 * ring1Start and ring2Start are the starting vertex indices.
 */
function connectRings(
  indices: number[],
  ring1Start: number,
  ring2Start: number,
  segments: number
): void {
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    const a = ring1Start + i;
    const b = ring1Start + next;
    const c = ring2Start + i;
    const d = ring2Start + next;
    
    // Two triangles per quad
    indices.push(a, c, b);
    indices.push(b, c, d);
  }
}

/**
 * Generate a solid disc (filled circle) at a given height.
 */
function generateDisc(
  vertices: number[],
  indices: number[],
  radius: number,
  y: number,
  segments: number
): void {
  const centerIdx = vertices.length / 3;
  vertices.push(0, y, 0); // center vertex
  
  const ringStart = vertices.length / 3;
  generateRing(vertices, radius, y, segments);
  
  // Fan triangles from center
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    indices.push(centerIdx, ringStart + i, ringStart + next);
  }
}

/**
 * Generate an annulus (ring) connecting two radii at a given height.
 */
function generateAnnulus(
  vertices: number[],
  indices: number[],
  innerRadius: number,
  outerRadius: number,
  y: number,
  segments: number
): void {
  const outerStart = vertices.length / 3;
  generateRing(vertices, outerRadius, y, segments);
  
  const innerStart = vertices.length / 3;
  generateRing(vertices, innerRadius, y, segments);
  
  connectRings(indices, outerStart, innerStart, segments);
}

/**
 * Build the complete bottle collider geometry from bottle dimensions.
 * Returns vertices and indices suitable for Rapier trimesh collider.
 */
export function buildBottleColliderGeometry(dims: BottleDimensions): ColliderGeometry {
  const vertices: number[] = [];
  const indices: number[] = [];
  
  const wt = dims.wallThickness;
  const bodyOuterR = dims.diameter / 2;
  const bodyInnerR = bodyOuterR - wt;
  const neckOuterR = dims.neckDiameter / 2;
  const neckInnerR = neckOuterR - wt;
  
  // Use a thicker floor to prevent clipping (at least 3mm or 3x wall thickness)
  const floorThickness = Math.max(wt * 3, 3);
  
  // Heights
  const floorBottomY = 0;
  const floorTopY = floorThickness; // top of floor slab
  const bodyTopY = dims.bodyHeight - dims.neckHeight; // where body meets shoulder
  const neckBottomY = bodyTopY; // shoulder/neck transition
  const neckTopY = dims.bodyHeight; // top of neck (open)
  
  // 1. Bottom disc (solid floor - bottom face)
  generateDisc(vertices, indices, bodyOuterR, floorBottomY, SEGMENTS);
  
  // 1b. Top of floor disc (inner floor surface)
  generateDisc(vertices, indices, bodyInnerR, floorTopY, SEGMENTS);
  
  // 1c. Floor outer wall (short cylinder connecting bottom to top of floor)
  const floorOuterBottomStart = vertices.length / 3;
  generateRing(vertices, bodyOuterR, floorBottomY, SEGMENTS);
  const floorOuterTopStart = vertices.length / 3;
  generateRing(vertices, bodyOuterR, floorTopY, SEGMENTS);
  connectRings(indices, floorOuterBottomStart, floorOuterTopStart, SEGMENTS);
  
  // 2. Bottom annulus (connects floor top to inner wall start)
  generateAnnulus(vertices, indices, bodyInnerR, bodyOuterR, floorTopY, SEGMENTS);
  
  // 3. Body outer wall
  const bodyOuterBottomStart = vertices.length / 3;
  generateRing(vertices, bodyOuterR, floorBottomY, SEGMENTS);
  const bodyOuterTopStart = vertices.length / 3;
  generateRing(vertices, bodyOuterR, bodyTopY, SEGMENTS);
  connectRings(indices, bodyOuterBottomStart, bodyOuterTopStart, SEGMENTS);
  
  // 4. Body inner wall (starts from top of floor slab, not from y=0)
  const bodyInnerBottomStart = vertices.length / 3;
  generateRing(vertices, bodyInnerR, floorTopY, SEGMENTS);
  const bodyInnerTopStart = vertices.length / 3;
  generateRing(vertices, bodyInnerR, bodyTopY, SEGMENTS);
  connectRings(indices, bodyInnerTopStart, bodyInnerBottomStart, SEGMENTS); // reversed winding for inner
  
  // 5. Shoulder transition - outer (body outer to neck outer)
  const shoulderOuterBodyStart = vertices.length / 3;
  generateRing(vertices, bodyOuterR, bodyTopY, SEGMENTS);
  const shoulderOuterNeckStart = vertices.length / 3;
  generateRing(vertices, neckOuterR, neckBottomY + 2, SEGMENTS); // slight offset for shoulder
  connectRings(indices, shoulderOuterBodyStart, shoulderOuterNeckStart, SEGMENTS);
  
  // 6. Shoulder transition - inner (body inner to neck inner)
  const shoulderInnerBodyStart = vertices.length / 3;
  generateRing(vertices, bodyInnerR, bodyTopY, SEGMENTS);
  const shoulderInnerNeckStart = vertices.length / 3;
  generateRing(vertices, neckInnerR, neckBottomY + 2, SEGMENTS);
  connectRings(indices, shoulderInnerNeckStart, shoulderInnerBodyStart, SEGMENTS); // reversed
  
  // 7. Shoulder top annulus (connects outer to inner at shoulder)
  generateAnnulus(vertices, indices, neckInnerR, neckOuterR, neckBottomY + 2, SEGMENTS);
  
  // 8. Neck outer wall
  const neckOuterBottomStart = vertices.length / 3;
  generateRing(vertices, neckOuterR, neckBottomY + 2, SEGMENTS);
  const neckOuterTopStart = vertices.length / 3;
  generateRing(vertices, neckOuterR, neckTopY, SEGMENTS);
  connectRings(indices, neckOuterBottomStart, neckOuterTopStart, SEGMENTS);
  
  // 9. Neck inner wall
  const neckInnerBottomStart = vertices.length / 3;
  generateRing(vertices, neckInnerR, neckBottomY + 2, SEGMENTS);
  const neckInnerTopStart = vertices.length / 3;
  generateRing(vertices, neckInnerR, neckTopY, SEGMENTS);
  connectRings(indices, neckInnerTopStart, neckInnerBottomStart, SEGMENTS); // reversed
  
  // 10. Top rim annulus (open top - just the rim)
  generateAnnulus(vertices, indices, neckInnerR, neckOuterR, neckTopY, SEGMENTS);
  
  return {
    vertices: new Float32Array(vertices),
    indices: new Uint32Array(indices),
  };
}

/**
 * Check if a position is inside the bottle.
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
