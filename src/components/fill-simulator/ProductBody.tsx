/**
 * Product Body Component
 * R3F component for a single dynamic product rigid body.
 * Renders the appropriate mesh shape and collider based on product type.
 */

import { useRef } from 'react';
import { RigidBody, CuboidCollider, CylinderCollider, CapsuleCollider } from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { Product } from '@/types/product';
import { getProductColliderParams, getProductMeshParams, getProductColor } from '@/services/fillSimulationService';

interface ProductBodyProps {
  product: Product;
  position: [number, number, number];
  rotation: [number, number, number, number];
  isInside: boolean;
  isComplete: boolean;
  id: string;
}

export default function ProductBody({
  product,
  position,
  rotation,
  isInside,
  isComplete,
  id,
}: ProductBodyProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  
  const colliderParams = getProductColliderParams(product);
  const meshParams = getProductMeshParams(product);
  const color = getProductColor(product.color, isInside, isComplete);
  
  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      quaternion={rotation}
      colliders={false}
      type="dynamic"
      mass={product.mass}
      linearDamping={0.5}
      angularDamping={0.5}
      name={id}
    >
      {/* Collider */}
      {colliderParams.type === 'cylinder' && (
        <CylinderCollider
          args={[colliderParams.args[0], colliderParams.args[1]]}
          friction={0.4}
          restitution={0.05}
        />
      )}
      {colliderParams.type === 'capsule' && (
        <CapsuleCollider
          args={[colliderParams.args[0], colliderParams.args[1]]}
          friction={0.4}
          restitution={0.05}
        />
      )}
      {colliderParams.type === 'cuboid' && (
        <CuboidCollider
          args={[colliderParams.args[0], colliderParams.args[1], colliderParams.args[2]]}
          friction={0.4}
          restitution={0.05}
        />
      )}
      
      {/* Visual mesh - standard shapes */}
      {product.shape !== 'dome' && (
        <mesh castShadow>
          {meshParams.geometryType === 'cylinder' && (
            <cylinderGeometry args={meshParams.args as [number, number, number, number]} />
          )}
          {meshParams.geometryType === 'capsule' && (
            <capsuleGeometry args={meshParams.args as [number, number, number, number]} />
          )}
          {meshParams.geometryType === 'box' && (
            <boxGeometry args={meshParams.args as [number, number, number]} />
          )}
          <meshStandardMaterial
            color={color}
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>
      )}
      
      {/* Dome shape: half-sphere + flat base disc */}
      {product.shape === 'dome' && (
        <group>
          {/* Half-sphere top */}
          <mesh castShadow>
            <sphereGeometry args={[product.dimensions.length / 2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial
              color={color}
              roughness={0.4}
              metalness={0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Flat base disc */}
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[product.dimensions.length / 2, 16]} />
            <meshStandardMaterial
              color={color}
              roughness={0.4}
              metalness={0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
    </RigidBody>
  );
}
