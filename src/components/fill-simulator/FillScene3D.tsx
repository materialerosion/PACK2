/**
 * Fill Scene 3D
 * Dedicated Three.js canvas with Rapier physics for fill simulation.
 * Renders the bottle as a transparent static collider and products as dynamic bodies.
 */

import { useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Grid } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { useStore, useFillSimulation } from '@/store';
import BottleCollider from './BottleCollider';
import ProductBody from './ProductBody';
import SimulationController from './SimulationController';
import { Droplets } from 'lucide-react';

export default function FillScene3D() {
  const { ui } = useStore();
  const fillSim = useFillSimulation();
  const { fillBottle, fillProduct, status, productBodies } = fillSim;
  
  const isComplete = status === 'complete';
  
  // Camera position based on bottle height
  const cameraPosition = useMemo<[number, number, number]>(() => {
    if (fillBottle) {
      const h = fillBottle.dimensions.bodyHeight;
      return [h * 0.8, h * 0.7, h * 1.2];
    }
    return [100, 80, 150];
  }, [fillBottle]);
  
  const cameraTarget = useMemo<[number, number, number]>(() => {
    if (fillBottle) {
      return [0, fillBottle.dimensions.bodyHeight * 0.4, 0];
    }
    return [0, 40, 0];
  }, [fillBottle]);
  
  // No bottle selected - show placeholder
  if (!fillBottle) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center text-gray-400">
          <Droplets className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No bottle loaded</p>
          <p className="text-sm mt-2">
            Send a bottle from the Bottle Generator or Library to begin
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full three-canvas">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={cameraPosition} fov={50} />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={50}
          maxDistance={500}
          target={cameraTarget}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[100, 200, 100]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight position={[-100, 100, -100]} intensity={0.3} />
        
        <Environment preset="studio" />
        
        {/* Grid */}
        {ui.showGrid && (
          <Grid
            position={[0, -0.5, 0]}
            args={[500, 500]}
            cellSize={10}
            cellThickness={0.5}
            cellColor="#cbd5e1"
            sectionSize={50}
            sectionThickness={1}
            sectionColor="#94a3b8"
            fadeDistance={300}
            fadeStrength={1}
            followCamera={false}
          />
        )}
        
        {/* Ground plane for catching fallen products */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
          <planeGeometry args={[500, 500]} />
          <meshStandardMaterial color="#f1f5f9" transparent opacity={0.5} />
        </mesh>
        
        {/* Physics world */}
        <Suspense fallback={null}>
          <Physics
            gravity={[0, -9810, 0]}
            timeStep={1 / 240}
            interpolate={true}
          >
            {/* Static bottle collider */}
            <BottleCollider bottle={fillBottle} />
            
            {/* Dynamic product bodies */}
            {fillProduct && productBodies.map((body) => (
              <ProductBody
                key={body.id}
                id={body.id}
                product={fillProduct}
                position={body.position}
                rotation={body.rotation}
                isInside={body.isInside}
                isComplete={isComplete}
              />
            ))}
            
            {/* Ground collider to catch fallen products */}
            {/* Using a simple invisible floor */}
            
            {/* Simulation controller (no visual output) */}
            <SimulationController />
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}
