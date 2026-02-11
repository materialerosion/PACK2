/**
 * 3D Scene Component
 * Main Three.js scene using react-three-fiber
 */

import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, PerspectiveCamera } from '@react-three/drei';
import { useStore } from '@/store';
import Bottle3D from './Bottle3D';
import Shelf3D from './Shelf3D';

export default function Scene3D() {
  const { ui, bottles, activeBottleId, lineups, activeLineupId, getBottlesForLineup } = useStore();
  
  // Get bottles to display based on active tab
  const displayBottles = React.useMemo(() => {
    if (ui.activeTab === 'lineup' && activeLineupId) {
      return getBottlesForLineup(activeLineupId);
    }
    // In generator mode, show active bottle or all bottles
    if (activeBottleId && bottles[activeBottleId]) {
      return [bottles[activeBottleId]];
    }
    return Object.values(bottles).slice(0, 10); // Limit for performance
  }, [ui.activeTab, activeLineupId, activeBottleId, bottles, getBottlesForLineup]);
  
  const activeLineup = activeLineupId ? lineups[activeLineupId] : null;
  
  return (
    <div className="w-full h-full three-canvas">
      <Canvas shadows>
        {/* Camera */}
        <PerspectiveCamera makeDefault position={[0, 150, 300]} fov={50} />
        
        {/* Controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={100}
          maxDistance={1000}
          target={[0, 50, 0]}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[100, 200, 100]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight position={[-100, 100, -100]} intensity={0.3} />
        
        {/* Environment */}
        <Environment preset="studio" />
        
        {/* Grid */}
        {ui.showGrid && (
          <Grid
            position={[0, 0, 0]}
            args={[1000, 1000]}
            cellSize={10}
            cellThickness={0.5}
            cellColor="#cbd5e1"
            sectionSize={50}
            sectionThickness={1}
            sectionColor="#94a3b8"
            fadeDistance={500}
            fadeStrength={1}
            followCamera={false}
          />
        )}
        
        {/* Shelf (in lineup mode) */}
        {ui.activeTab === 'lineup' && activeLineup && (
          <Shelf3D 
            width={activeLineup.shelfWidth}
            depth={activeLineup.shelfDepth}
            height={20}
          />
        )}
        
        {/* Bottles */}
        {displayBottles.map((bottle, index) => {
          // Calculate position
          let position: [number, number, number] = [0, 0, 0];
          
          if (ui.activeTab === 'lineup' && activeLineup) {
            const lineupPosition = activeLineup.positions.find(p => p.bottleId === bottle.id);
            if (lineupPosition) {
              position = [
                lineupPosition.x - activeLineup.shelfWidth / 2,
                20, // On top of shelf
                lineupPosition.y
              ];
            }
          } else {
            // Spread bottles in generator view
            const spacing = 80;
            const cols = Math.ceil(Math.sqrt(displayBottles.length));
            const row = Math.floor(index / cols);
            const col = index % cols;
            position = [
              (col - cols / 2) * spacing,
              0,
              (row - Math.ceil(displayBottles.length / cols) / 2) * spacing
            ];
          }
          
          return (
            <Bottle3D
              key={bottle.id}
              bottle={bottle}
              position={position}
              isSelected={bottle.id === activeBottleId}
              showMeasurements={ui.showMeasurements}
            />
          );
        })}
      </Canvas>
    </div>
  );
}
