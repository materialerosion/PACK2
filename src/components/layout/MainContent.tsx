/**
 * Main Content Component
 * 3D viewport and visualization area
 */

import React, { Suspense } from 'react';
import { useStore } from '@/store';
import Scene3D from '../3d/Scene3D';
import BottleLibrary from '../bottle-generator/BottleLibrary';
import LineupShelf from '../lineup-builder/LineupShelf';

export default function MainContent() {
  const { ui } = useStore();
  
  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-gray-100">
      {/* 3D Viewport */}
      <div className="flex-1 relative">
        <Suspense fallback={<LoadingSpinner />}>
          <Scene3D />
        </Suspense>
        
        {/* Overlay controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          <ViewControls />
        </div>
        
        {/* Grid toggle indicator */}
        {ui.showGrid && (
          <div className="absolute bottom-4 left-4 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
            Grid: 10mm
          </div>
        )}
      </div>
      
      {/* Bottom panel - Bottle library or lineup slots */}
      <div className="h-40 bg-white border-t border-gray-200 p-4">
        {ui.activeTab === 'lineup' ? (
          <LineupShelf />
        ) : (
          <BottleLibrary />
        )}
      </div>
    </main>
  );
}

function LoadingSpinner() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-4">
        <div className="spinner" />
        <span className="text-gray-500">Loading 3D scene...</span>
      </div>
    </div>
  );
}

function ViewControls() {
  const { ui, toggleGrid, toggleMeasurements, setViewMode } = useStore();
  
  return (
    <div className="flex gap-2 bg-white rounded-lg shadow-sm p-1">
      <button
        onClick={toggleGrid}
        className={`px-3 py-1.5 text-sm rounded ${
          ui.showGrid ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        Grid
      </button>
      <button
        onClick={toggleMeasurements}
        className={`px-3 py-1.5 text-sm rounded ${
          ui.showMeasurements ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        Measurements
      </button>
      <div className="w-px bg-gray-200" />
      <button
        onClick={() => setViewMode('3d')}
        className={`px-3 py-1.5 text-sm rounded ${
          ui.viewMode === '3d' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        3D
      </button>
      <button
        onClick={() => setViewMode('2d')}
        className={`px-3 py-1.5 text-sm rounded ${
          ui.viewMode === '2d' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        2D
      </button>
    </div>
  );
}
