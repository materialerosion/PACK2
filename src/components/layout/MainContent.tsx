/**
 * Main Content Component
 * 3D viewport and visualization area with bottom panels for
 * bottle library, generated bottles display, and comparison views.
 */

import React, { Suspense, useState, useCallback, useEffect, useRef } from 'react';
import { useStore, useActiveSeries, useActiveSeriesComparison } from '@/store';
import Scene3D from '../3d/Scene3D';
import BottleLibrary from '../bottle-generator/BottleLibrary';
import LineupShelf from '../lineup-builder/LineupShelf';
import GeneratedBottlesDisplay from '../lineup-builder/GeneratedBottlesDisplay';
import ComparisonChart from '../comparison-mode/ComparisonChart';
import ComparisonTable from '../comparison-mode/ComparisonTable';
import AnalysisReport from '../comparison-mode/AnalysisReport';

const MIN_PANEL_HEIGHT = 120;
const MAX_PANEL_HEIGHT = 500;
const DEFAULT_PANEL_HEIGHT = 192; // equivalent to h-48

export default function MainContent() {
  const { ui, bottleSeries } = useStore();
  const activeSeries = useActiveSeries();
  const activeComparison = useActiveSeriesComparison();

  // Resizable bottom panel state
  const [panelHeight, setPanelHeight] = useState(DEFAULT_PANEL_HEIGHT);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    startY.current = e.clientY;
    startHeight.current = panelHeight;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, [panelHeight]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = startY.current - e.clientY;
      const newHeight = Math.min(MAX_PANEL_HEIGHT, Math.max(MIN_PANEL_HEIGHT, startHeight.current + delta));
      setPanelHeight(newHeight);
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Resolve comparison series
  const compSeries1 = activeComparison ? bottleSeries[activeComparison.series1Id] : null;
  const compSeries2 = activeComparison ? bottleSeries[activeComparison.series2Id] : null;

  const isComparisonView = ui.activeTab === 'comparison' && activeComparison && compSeries1 && compSeries2;

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-gray-100">
      {/* Main viewport */}
      <div className="flex-1 relative min-h-0">
        {isComparisonView ? (
          /* Comparison view replaces 3D viewport */
          <div className="w-full h-full overflow-auto p-6 space-y-6">
            <ComparisonChart
              series1={compSeries1}
              series2={compSeries2}
              comparison={activeComparison}
            />
            <ComparisonTable
              series1={compSeries1}
              series2={compSeries2}
              comparison={activeComparison}
            />
            <AnalysisReport
              series1={compSeries1}
              series2={compSeries2}
              comparison={activeComparison}
            />
          </div>
        ) : (
          /* Normal 3D viewport */
          <>
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
          </>
        )}
      </div>

      {/* Bottom panel - context-dependent, resizable */}
      {!isComparisonView && (
        <div className="flex flex-col flex-shrink-0" style={{ height: `${panelHeight}px` }}>
          {/* Resize handle */}
          <div
            onMouseDown={handleResizeStart}
            className="h-1.5 bg-gray-200 hover:bg-primary-300 cursor-row-resize flex items-center justify-center group transition-colors"
          >
            <div className="w-8 h-0.5 bg-gray-400 group-hover:bg-primary-500 rounded-full" />
          </div>
          {/* Panel content */}
          <div className="flex-1 bg-white border-t border-gray-200 overflow-hidden">
            {ui.activeTab === 'lineup' ? (
              activeSeries ? (
                <GeneratedBottlesDisplay />
              ) : (
                <LineupShelf />
              )
            ) : (
              <div className="p-4">
                <BottleLibrary />
              </div>
            )}
          </div>
        </div>
      )}
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
