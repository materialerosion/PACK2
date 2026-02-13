/**
 * 3D Scene Component
 * Main Three.js scene using react-three-fiber
 */

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, PerspectiveCamera } from '@react-three/drei';
import { useStore, useActiveSeries } from '@/store';
import Bottle3D from './Bottle3D';
import Shelf3D from './Shelf3D';

export default function Scene3D() {
  const { ui, bottles, activeBottleId, lineups, activeLineupId, getBottlesForLineup } = useStore();
  const activeSeries = useActiveSeries();
  
  // Determine if we're showing a series lineup
  const isSeriesView = ui.activeTab === 'lineup' && activeSeries && activeSeries.bottles.length > 0;
  
  // Get bottles to display based on active tab
  const displayBottles = React.useMemo(() => {
    // Series view: show all bottles from the active series side by side
    if (isSeriesView) {
      return activeSeries!.bottles;
    }
    if (ui.activeTab === 'lineup' && activeLineupId) {
      return getBottlesForLineup(activeLineupId);
    }
    // In generator mode, show active bottle or all bottles
    if (activeBottleId && bottles[activeBottleId]) {
      return [bottles[activeBottleId]];
    }
    return Object.values(bottles).slice(0, 10); // Limit for performance
  }, [ui.activeTab, activeLineupId, activeBottleId, bottles, getBottlesForLineup, isSeriesView, activeSeries]);
  
  const activeLineup = activeLineupId ? lineups[activeLineupId] : null;
  
  // Calculate shelf dimensions for series view
  const seriesShelfWidth = React.useMemo(() => {
    if (!isSeriesView) return 0;
    const seriesBottles = activeSeries!.bottles;
    // Calculate total width needed: sum of diameters + spacing
    const totalDiameterWidth = seriesBottles.reduce((sum, b) => sum + b.dimensions.diameter, 0);
    const spacing = (seriesBottles.length - 1) * 30; // 30mm spacing between bottles
    return Math.max(totalDiameterWidth + spacing + 80, 400); // min 400mm shelf
  }, [isSeriesView, activeSeries]);
  
  // Calculate camera position based on view
  const cameraPosition = React.useMemo<[number, number, number]>(() => {
    if (isSeriesView) {
      const maxHeight = Math.max(...activeSeries!.bottles.map(b => b.dimensions.height));
      const distance = Math.max(seriesShelfWidth * 0.8, 300);
      return [0, maxHeight * 0.8, distance];
    }
    return [0, 150, 300];
  }, [isSeriesView, activeSeries, seriesShelfWidth]);
  
  const cameraTarget = React.useMemo<[number, number, number]>(() => {
    if (isSeriesView) {
      const maxHeight = Math.max(...activeSeries!.bottles.map(b => b.dimensions.height));
      return [0, maxHeight * 0.4, 0];
    }
    return [0, 50, 0];
  }, [isSeriesView, activeSeries]);
  
  return (
    <div className="w-full h-full three-canvas">
      <Canvas shadows>
        {/* Camera */}
        <PerspectiveCamera makeDefault position={cameraPosition} fov={50} />
        
        {/* Controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={100}
          maxDistance={1000}
          target={cameraTarget}
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
        
        {/* Shelf (in lineup mode with legacy lineup) */}
        {ui.activeTab === 'lineup' && activeLineup && !isSeriesView && (
          <Shelf3D 
            width={activeLineup.shelfWidth}
            depth={activeLineup.shelfDepth}
            height={20}
          />
        )}
        
        {/* Shelf for series view */}
        {isSeriesView && (
          <Shelf3D 
            width={seriesShelfWidth}
            depth={200}
            height={20}
          />
        )}
        
        {/* Bottles */}
        {displayBottles.map((bottle, index) => {
          // Calculate position
          let position: [number, number, number] = [0, 0, 0];
          
          if (isSeriesView) {
            // Series view: arrange bottles side by side on the shelf, evenly spaced
            const count = displayBottles.length;
            const totalWidth = seriesShelfWidth - 80; // Leave margin on edges
            const spacing = count > 1 ? totalWidth / (count - 1) : 0;
            const startX = count > 1 ? -totalWidth / 2 : 0;
            position = [
              startX + index * spacing,
              20, // On top of shelf
              0
            ];
          } else if (ui.activeTab === 'lineup' && activeLineup) {
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
