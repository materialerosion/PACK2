/**
 * Bottle Collider Component
 * R3F component that renders the bottle as a static trimesh collider
 * with a transparent visual mesh.
 */

import { useMemo } from 'react';
import { RigidBody, TrimeshCollider } from '@react-three/rapier';
import { Bottle } from '@/types/bottle';
import { buildBottleColliderGeometry } from '@/services/bottleColliderBuilder';
import * as THREE from 'three';

interface BottleColliderProps {
  bottle: Bottle;
}

export default function BottleCollider({ bottle }: BottleColliderProps) {
  const dims = bottle.dimensions;
  
  // Build collider geometry
  const colliderGeometry = useMemo(() => {
    return buildBottleColliderGeometry(dims);
  }, [dims]);
  
  // Build visual geometry for the transparent bottle
  const visualGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(colliderGeometry.vertices, 3));
    geo.setIndex(new THREE.BufferAttribute(colliderGeometry.indices, 1));
    geo.computeVertexNormals();
    return geo;
  }, [colliderGeometry]);
  
  return (
    <RigidBody type="fixed" colliders={false}>
      {/* Physics collider */}
      <TrimeshCollider
        args={[colliderGeometry.vertices, colliderGeometry.indices]}
        friction={0.6}
        restitution={0.05}
      />
      
      {/* Visual mesh - transparent */}
      <mesh geometry={visualGeometry}>
        <meshPhysicalMaterial
          color={bottle.bodyColor}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          roughness={0.1}
          metalness={0}
          transmission={0.5}
        />
      </mesh>
      
      {/* Wireframe overlay for better visibility */}
      <mesh geometry={visualGeometry}>
        <meshBasicMaterial
          color={bottle.bodyColor}
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>
    </RigidBody>
  );
}
