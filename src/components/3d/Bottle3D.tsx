/**
 * Bottle 3D Component
 * Renders a 3D bottle mesh based on bottle parameters
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Bottle } from '@/types';
import { useStore } from '@/store';

interface Bottle3DProps {
  bottle: Bottle;
  position: [number, number, number];
  isSelected?: boolean;
  showMeasurements?: boolean;
}

export default function Bottle3D({ 
  bottle, 
  position, 
  isSelected = false,
  showMeasurements = false 
}: Bottle3DProps) {
  const meshRef = useRef<THREE.Group>(null);
  const { setActiveBottle } = useStore();
  
  // Generate bottle geometry based on shape
  // Use JSON-serialized dimensions as dependency to ensure proper change detection
  const dimensionsKey = JSON.stringify(bottle.dimensions);
  const { bodyGeometry, neckGeometry, capGeometry } = useMemo(() => {
    return generateBottleGeometry(bottle);
  }, [bottle.shape, dimensionsKey, bottle.capStyle]);
  
  // Materials
  const bodyMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: bottle.bodyColor,
      transparent: bottle.opacity < 1,
      opacity: bottle.opacity,
      roughness: 0.2,
      metalness: 0,
      clearcoat: 0.3,
      clearcoatRoughness: 0.2,
    });
  }, [bottle.bodyColor, bottle.opacity]);
  
  const capMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: bottle.capColor,
      roughness: 0.5,
      metalness: 0.1,
    });
  }, [bottle.capColor]);
  
  // Selection highlight animation
  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });
  
  const handleClick = (e: any) => {
    e.stopPropagation?.();
    setActiveBottle(bottle.id);
  };
  
  const dims = bottle.dimensions;
  
  // Calculate body height used in geometry (body minus neck for shapes that include shoulder)
  const bodyOnlyHeight = dims.bodyHeight - dims.neckHeight;
  
  // Cap dimensions for positioning
  const capHeight = dims.neckDiameter * 0.5;
  // Adjust cap height based on style
  let effectiveCapHeight = capHeight;
  switch (bottle.capStyle) {
    case 'child-resistant': effectiveCapHeight = capHeight * 1.2; break;
    case 'flip-top': effectiveCapHeight = capHeight * 0.8; break;
    case 'dropper': effectiveCapHeight = capHeight * 2.5; break;
    case 'pump': effectiveCapHeight = capHeight * 2; break;
    case 'spray': effectiveCapHeight = capHeight * 1.8; break;
    default: effectiveCapHeight = capHeight; break;
  }
  
  return (
    <group
      ref={meshRef}
      position={position}
      onClick={handleClick}
    >
      {/* Body - positioned so bottom sits at y=0 */}
      <mesh
        geometry={bodyGeometry}
        material={bodyMaterial}
        castShadow
        receiveShadow
        position={[0, 0, 0]}
      />
      
      {/* Neck - sits on top of body */}
      <mesh
        geometry={neckGeometry}
        material={bodyMaterial}
        castShadow
        position={[0, bodyOnlyHeight, 0]}
      />
      
      {/* Cap - sits on top of neck */}
      <mesh
        geometry={capGeometry}
        material={capMaterial}
        castShadow
        position={[0, bodyOnlyHeight + dims.neckHeight + effectiveCapHeight / 2, 0]}
      />
      
      {/* Selection ring */}
      {isSelected && (
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[dims.diameter / 2 + 5, dims.diameter / 2 + 8, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} />
        </mesh>
      )}
      
      {/* Label zones */}
      {bottle.labelZones.map((zone) => (
        <mesh
          key={zone.id}
          position={[0, bodyOnlyHeight - zone.topOffset - zone.height / 2, 0]}
        >
          <cylinderGeometry
            args={[
              dims.diameter / 2 + 0.5,
              dims.diameter / 2 + 0.5,
              zone.height,
              32,
              1,
              true,
              0,
              (zone.wrapAngle / 360) * Math.PI * 2
            ]}
          />
          <meshBasicMaterial
            color={zone.color || '#e5e7eb'}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      
      {/* Measurements overlay */}
      {showMeasurements && (
        <Html position={[dims.diameter / 2 + 20, dims.height / 2, 0]}>
          <div className="bg-white/90 px-2 py-1 rounded shadow text-xs whitespace-nowrap">
            <div className="font-medium">{bottle.name}</div>
            <div className="text-gray-600">
              {bottle.volume.toFixed(1)} ml
            </div>
            <div className="text-gray-500">
              H: {dims.height}mm × Ø{dims.diameter}mm
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

/**
 * Generate bottle geometry based on shape type.
 * All body geometries are created with their base at y=0.
 */
function generateBottleGeometry(bottle: Bottle) {
  const dims = bottle.dimensions;
  const bodyOnlyHeight = dims.bodyHeight - dims.neckHeight;
  
  let bodyGeometry: THREE.BufferGeometry;
  let neckGeometry: THREE.BufferGeometry;
  let capGeometry: THREE.BufferGeometry;
  
  switch (bottle.shape) {
    case 'boston-round':
      // LatheGeometry already starts at y=0
      bodyGeometry = createBostonRoundBody(dims);
      break;
    case 'cylinder': {
      // CylinderGeometry is centered at origin; translate so bottom is at y=0
      bodyGeometry = new THREE.CylinderGeometry(
        dims.diameter / 2,
        dims.diameter / 2,
        bodyOnlyHeight,
        32
      );
      bodyGeometry.translate(0, bodyOnlyHeight / 2, 0);
      break;
    }
    case 'oval':
      bodyGeometry = createOvalBody(dims);
      break;
    case 'modern-pharmaceutical':
      bodyGeometry = createModernPharmBody(dims);
      break;
    case 'packer':
    case 'wide-mouth':
      // LatheGeometry already starts at y=0
      bodyGeometry = createPackerBody(dims);
      break;
    default: {
      bodyGeometry = new THREE.CylinderGeometry(
        dims.diameter / 2,
        dims.diameter / 2,
        bodyOnlyHeight,
        32
      );
      bodyGeometry.translate(0, bodyOnlyHeight / 2, 0);
      break;
    }
  }
  
  // Neck geometry (common for all shapes) — bottom at y=0, translated up in JSX
  neckGeometry = new THREE.CylinderGeometry(
    dims.neckDiameter / 2,
    dims.neckDiameter / 2,
    dims.neckHeight,
    32
  );
  neckGeometry.translate(0, dims.neckHeight / 2, 0);
  
  // Cap geometry based on style
  capGeometry = createCapGeometry(bottle.capStyle, dims.neckDiameter);
  
  return { bodyGeometry, neckGeometry, capGeometry };
}

/**
 * Create Boston Round bottle body using lathe geometry
 */
function createBostonRoundBody(dims: Bottle['dimensions']): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  const segments = 32;
  
  const bodyRadius = dims.diameter / 2;
  const neckRadius = dims.neckDiameter / 2;
  const bodyHeight = dims.bodyHeight - dims.neckHeight;
  const shoulderHeight = dims.shoulderCurveRadius;
  
  // Base
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(bodyRadius, 0));
  
  // Body
  points.push(new THREE.Vector2(bodyRadius, bodyHeight - shoulderHeight));
  
  // Shoulder curve
  for (let i = 0; i <= segments / 4; i++) {
    const t = i / (segments / 4);
    const angle = t * Math.PI / 2;
    const r = bodyRadius - (bodyRadius - neckRadius) * Math.sin(angle);
    const h = bodyHeight - shoulderHeight + shoulderHeight * (1 - Math.cos(angle));
    points.push(new THREE.Vector2(r, h));
  }
  
  // Top
  points.push(new THREE.Vector2(neckRadius, bodyHeight));
  points.push(new THREE.Vector2(0, bodyHeight));
  
  return new THREE.LatheGeometry(points, 32);
}

/**
 * Create oval bottle body.
 * Base sits at y=0, top at y=bodyOnlyHeight.
 */
function createOvalBody(dims: Bottle['dimensions']): THREE.BufferGeometry {
  const widthRatio = dims.widthRatio || 0.6;
  const a = dims.diameter / 2;
  const b = a * widthRatio;
  const height = dims.bodyHeight - dims.neckHeight;
  const bevelThickness = Math.min(5, height * 0.05);
  const bevelSize = Math.min(5, a * 0.1);
  
  // Create elliptical cylinder using extrusion
  const shape = new THREE.Shape();
  const segments = 32;
  
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = a * Math.cos(angle);
    const y = b * Math.sin(angle);
    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }
  
  const extrudeSettings = {
    depth: height,
    bevelEnabled: true,
    bevelThickness,
    bevelSize,
    bevelSegments: 8,
  };
  
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.rotateX(-Math.PI / 2);
  // After rotation, geometry spans y from -bevelThickness to height+bevelThickness.
  // Shift up so the base sits at y=0.
  geometry.translate(0, bevelThickness, 0);
  
  return geometry;
}

/**
 * Create modern pharmaceutical bottle body (rounded rectangle).
 * Base sits at y=0, top at y=bodyOnlyHeight.
 */
function createModernPharmBody(dims: Bottle['dimensions']): THREE.BufferGeometry {
  const width = dims.diameter;
  const depth = width * (dims.widthRatio || 0.5);
  const height = dims.bodyHeight - dims.neckHeight;
  const radius = Math.min(dims.shoulderCurveRadius, width / 4, depth / 4);
  const bevelThickness = Math.min(3, height * 0.03);
  const bevelSize = Math.min(3, width * 0.05);
  
  // Create rounded rectangle shape
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -depth / 2;
  
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + depth - radius);
  shape.quadraticCurveTo(x + width, y + depth, x + width - radius, y + depth);
  shape.lineTo(x + radius, y + depth);
  shape.quadraticCurveTo(x, y + depth, x, y + depth - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  
  const extrudeSettings = {
    depth: height,
    bevelEnabled: true,
    bevelThickness,
    bevelSize,
    bevelSegments: 4,
  };
  
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.rotateX(-Math.PI / 2);
  // After rotation, geometry spans y from -bevelThickness to height+bevelThickness.
  // Shift up so the base sits at y=0.
  geometry.translate(0, bevelThickness, 0);
  
  return geometry;
}

/**
 * Create packer/wide-mouth bottle body
 */
function createPackerBody(dims: Bottle['dimensions']): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  
  const bodyRadius = dims.diameter / 2;
  const neckRadius = dims.neckDiameter / 2;
  const bodyHeight = dims.bodyHeight - dims.neckHeight;
  const shoulderHeight = dims.shoulderCurveRadius;
  
  // Base
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(bodyRadius, 0));
  
  // Body (straight sides)
  points.push(new THREE.Vector2(bodyRadius, bodyHeight - shoulderHeight));
  
  // Short shoulder transition
  points.push(new THREE.Vector2(neckRadius, bodyHeight));
  
  // Top
  points.push(new THREE.Vector2(0, bodyHeight));
  
  return new THREE.LatheGeometry(points, 32);
}

/**
 * Create cap geometry based on style
 */
function createCapGeometry(style: Bottle['capStyle'], neckDiameter: number): THREE.BufferGeometry {
  const capRadius = neckDiameter / 2 * 1.2;
  const capHeight = neckDiameter * 0.5;
  
  switch (style) {
    case 'child-resistant':
      // Wider cap with ridges
      return new THREE.CylinderGeometry(
        capRadius * 1.1,
        capRadius * 1.1,
        capHeight * 1.2,
        32
      );
      
    case 'flip-top':
      // Cap with hinge indication
      const flipGeom = new THREE.CylinderGeometry(
        capRadius,
        capRadius,
        capHeight * 0.8,
        32
      );
      return flipGeom;
      
    case 'dropper':
      // Elongated dropper cap
      return new THREE.CylinderGeometry(
        capRadius * 0.7,
        capRadius * 0.5,
        capHeight * 2.5,
        32
      );
      
    case 'pump':
      // Pump dispenser (simplified)
      const pumpGeom = new THREE.CylinderGeometry(
        capRadius * 0.8,
        capRadius,
        capHeight * 2,
        32
      );
      return pumpGeom;
      
    case 'spray':
      // Spray nozzle
      return new THREE.CylinderGeometry(
        capRadius * 0.6,
        capRadius * 0.8,
        capHeight * 1.8,
        32
      );
      
    case 'screw-cap':
    default:
      return new THREE.CylinderGeometry(
        capRadius,
        capRadius,
        capHeight,
        32
      );
  }
}
