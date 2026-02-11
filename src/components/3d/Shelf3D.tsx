/**
 * Shelf 3D Component
 * Renders a 3D shelf for bottle lineup display
 */

import React from 'react';
import * as THREE from 'three';

interface Shelf3DProps {
  width: number;
  depth: number;
  height: number;
}

export default function Shelf3D({ width, depth, height }: Shelf3DProps) {
  return (
    <group position={[0, 0, 0]}>
      {/* Main shelf surface */}
      <mesh position={[0, height / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial 
          color="#8b7355"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Front edge highlight */}
      <mesh position={[0, height, depth / 2 - 2]} receiveShadow>
        <boxGeometry args={[width, 4, 4]} />
        <meshStandardMaterial 
          color="#6b5344"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      
      {/* Back wall (optional) */}
      <mesh position={[0, height + 100, -depth / 2 - 5]} receiveShadow>
        <boxGeometry args={[width + 20, 200, 10]} />
        <meshStandardMaterial 
          color="#e5e7eb"
          roughness={0.9}
          metalness={0}
        />
      </mesh>
      
      {/* Side supports */}
      <mesh position={[-width / 2 - 5, height / 2 + 50, 0]} receiveShadow castShadow>
        <boxGeometry args={[10, height + 100, depth]} />
        <meshStandardMaterial 
          color="#6b5344"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[width / 2 + 5, height / 2 + 50, 0]} receiveShadow castShadow>
        <boxGeometry args={[10, height + 100, depth]} />
        <meshStandardMaterial 
          color="#6b5344"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}
