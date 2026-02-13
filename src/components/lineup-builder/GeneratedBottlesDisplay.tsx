/**
 * Generated Bottles Display Component
 * Shows the bottles in a series with fill range information.
 * Provides both a visual shelf view and a detailed list view.
 * Includes per-series gap/overlap analysis and space utilization metrics.
 */

import { useState, useMemo } from 'react';
import { useStore, useActiveSeries } from '@/store';
import { BottleSeries, FillRange, IntraSeriesAnalysis } from '@/types/bottleSeries';
import { Bottle } from '@/types/bottle';
import { FillRangeService } from '@/services/fillRangeService';
import { ComparisonService } from '@/services/comparisonService';
import { GENERATION_ALGORITHM_NAMES } from '@/types/bottleSeries';
import { List, LayoutGrid, Trash2, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react';

type DisplayMode = 'list' | 'grid';

export default function GeneratedBottlesDisplay() {
  const {
    deleteBottleSeries,
  } = useStore();

  const activeSeries = useActiveSeries();
  const [displayMode, setDisplayMode] = useState<DisplayMode>('list');
  const [selectedBottleIndex, setSelectedBottleIndex] = useState<number | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(true);

  // Compute fill ranges and per-series analysis
  const fillRanges = useMemo(
    () => activeSeries ? FillRangeService.calculateSeriesFillRanges(activeSeries) : [],
    [activeSeries]
  );

  const seriesAnalysis = useMemo(
    () => activeSeries ? ComparisonService.analyzeSeriesInternal(activeSeries, fillRanges) : null,
    [activeSeries, fillRanges]
  );

  if (!activeSeries) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        <p>Generate a series to see bottles here</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
        <div>
          <h3 className="font-semibold text-sm text-gray-900">{activeSeries.name}</h3>
          <p className="text-xs text-gray-500">
            {activeSeries.bottles.length} bottles · {GENERATION_ALGORITHM_NAMES[activeSeries.config.algorithm]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Analysis toggle */}
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className={`p-1.5 rounded transition-colors ${showAnalysis ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            title="Toggle gap analysis"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          {/* View toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setDisplayMode('list')}
              className={`p-1.5 rounded ${displayMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDisplayMode('grid')}
              className={`p-1.5 rounded ${displayMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => {
              deleteBottleSeries(activeSeries.id);
            }}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete series"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Series Gap Analysis Panel */}
      {showAnalysis && seriesAnalysis && (
        <SeriesAnalysisPanel analysis={seriesAnalysis} />
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {displayMode === 'list' ? (
          <BottleListView
            series={activeSeries}
            fillRanges={fillRanges}
            selectedIndex={selectedBottleIndex}
            onSelect={setSelectedBottleIndex}
          />
        ) : (
          <BottleGridView
            series={activeSeries}
            fillRanges={fillRanges}
            selectedIndex={selectedBottleIndex}
            onSelect={setSelectedBottleIndex}
          />
        )}
      </div>

      {/* Selected bottle details */}
      {selectedBottleIndex !== null && activeSeries.bottles[selectedBottleIndex] && (
        <BottleDetailsPanel
          bottle={activeSeries.bottles[selectedBottleIndex]}
          fillRange={fillRanges[selectedBottleIndex]}
          index={selectedBottleIndex}
        />
      )}
    </div>
  );
}

// ─── List View ────────────────────────────────────────────────────────

interface BottleViewProps {
  series: BottleSeries;
  fillRanges: FillRange[];
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
}

function BottleListView({ series, fillRanges, selectedIndex, onSelect }: BottleViewProps) {
  return (
    <div className="space-y-1">
      {/* Table header */}
      <div className="grid grid-cols-6 gap-2 px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
        <span>#</span>
        <span>Volume</span>
        <span>Height</span>
        <span>Diameter</span>
        <span>Min Fill</span>
        <span>Max Fill</span>
      </div>

      {/* Table rows */}
      {series.bottles.map((bottle, index) => {
        const range = fillRanges[index];
        return (
          <div
            key={bottle.id}
            onClick={() => onSelect(selectedIndex === index ? null : index)}
            className={`
              grid grid-cols-6 gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm
              ${selectedIndex === index
                ? 'bg-blue-50 border border-blue-200'
                : 'hover:bg-gray-50 border border-transparent'
              }
            `}
          >
            <span className="text-gray-400 font-mono">{index + 1}</span>
            <span className="font-medium text-gray-900">{bottle.volume.toFixed(0)} mL</span>
            <span className="text-gray-600">{bottle.dimensions.height.toFixed(1)} mm</span>
            <span className="text-gray-600">{bottle.dimensions.diameter.toFixed(1)} mm</span>
            <span className="text-green-600">{range.minFill.toFixed(0)} mL</span>
            <span className="text-blue-600">{range.maxFill.toFixed(0)} mL</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Grid View ────────────────────────────────────────────────────────

function BottleGridView({ series, fillRanges, selectedIndex, onSelect }: BottleViewProps) {
  // Find max height and diameter for relative sizing
  const maxHeight = Math.max(...series.bottles.map(b => b.dimensions.height));
  const maxDiameter = Math.max(...series.bottles.map(b => b.dimensions.diameter));

  return (
    <div className="flex items-end justify-center gap-4 h-full pb-4">
      {series.bottles.map((bottle, index) => {
        const range = fillRanges[index];
        // Use percentage of max height so bottles scale relative to the tallest
        const heightPercent = (bottle.dimensions.height / maxHeight) * 100;
        // Scale diameter relative to the widest bottle in the series
        const relativeDiameter = Math.max(30, (bottle.dimensions.diameter / maxDiameter) * 60);

        return (
          <div
            key={bottle.id}
            onClick={() => onSelect(selectedIndex === index ? null : index)}
            className={`
              flex flex-col items-center cursor-pointer transition-all
              ${selectedIndex === index ? 'scale-110' : 'hover:scale-105'}
            `}
          >
            {/* Bottle visual */}
            <div
              className={`
                relative overflow-hidden rounded-t-lg border-2 transition-colors
                ${selectedIndex === index
                  ? 'border-blue-500 bg-blue-100'
                  : 'border-gray-300 bg-gray-100'
                }
              `}
              style={{
                width: `${relativeDiameter}px`,
                height: `${heightPercent}%`,
                minHeight: '40px',
                maxHeight: '100%',
              }}
            >
              {/* Fill level indicator */}
              <div
                className="w-full bg-blue-200 rounded-b absolute bottom-0 left-0"
                style={{
                  height: `${((range.targetFill / bottle.volume) * 100)}%`,
                }}
              />
            </div>

            {/* Label */}
            <div className="text-center mt-2">
              <div className="text-xs font-medium text-gray-900">{bottle.volume.toFixed(0)} mL</div>
              <div className="text-[10px] text-gray-500">
                {range.minFill.toFixed(0)}–{range.maxFill.toFixed(0)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Details Panel ────────────────────────────────────────────────────

interface BottleDetailsPanelProps {
  bottle: Bottle;
  fillRange: FillRange;
  index: number;
}

function BottleDetailsPanel({ bottle, fillRange, index }: BottleDetailsPanelProps) {
  return (
    <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-900">
          Bottle #{index + 1} — {bottle.volume.toFixed(1)} mL
        </h4>
      </div>
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div>
          <span className="text-gray-500 block">Dimensions</span>
          <span className="font-medium">
            {bottle.dimensions.height.toFixed(1)} × {bottle.dimensions.diameter.toFixed(1)} mm
          </span>
        </div>
        <div>
          <span className="text-gray-500 block">Body Height</span>
          <span className="font-medium">{bottle.dimensions.bodyHeight.toFixed(1)} mm</span>
        </div>
        <div>
          <span className="text-gray-500 block">Surface Area</span>
          <span className="font-medium">{bottle.surfaceArea.toFixed(1)} cm²</span>
        </div>
        <div>
          <span className="text-gray-500 block">Min Fill ({fillRange.minPercent}%)</span>
          <span className="font-medium text-green-600">{fillRange.minFill.toFixed(1)} mL</span>
        </div>
        <div>
          <span className="text-gray-500 block">Target Fill ({fillRange.targetPercent.toFixed(0)}%)</span>
          <span className="font-medium text-blue-600">{fillRange.targetFill.toFixed(1)} mL</span>
        </div>
        <div>
          <span className="text-gray-500 block">Max Fill ({fillRange.maxPercent}%)</span>
          <span className="font-medium text-purple-600">{fillRange.maxFill.toFixed(1)} mL</span>
        </div>
      </div>
    </div>
  );
}

// ─── Series Analysis Panel ────────────────────────────────────────────

interface SeriesAnalysisPanelProps {
  analysis: IntraSeriesAnalysis;
}

function SeriesAnalysisPanel({ analysis }: SeriesAnalysisPanelProps) {
  const hasGaps = analysis.gaps.length > 0;
  const hasOverlaps = analysis.overlaps.length > 0;
  const efficiencyColor = analysis.coverageEfficiency >= 90 ? 'green' :
    analysis.coverageEfficiency >= 70 ? 'yellow' : 'red';

  return (
    <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
      {/* Efficiency summary bar */}
      <div className="flex items-center gap-2 mb-3">
        {analysis.coverageEfficiency >= 90 ? (
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
        ) : (
          <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${
            efficiencyColor === 'yellow' ? 'text-yellow-500' : 'text-red-500'
          }`} />
        )}
        <span className="text-xs font-semibold text-gray-700">Series Gap Analysis</span>
        <span className={`ml-auto text-xs font-bold ${
          efficiencyColor === 'green' ? 'text-green-600' :
          efficiencyColor === 'yellow' ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {analysis.coverageEfficiency.toFixed(1)}% efficient
        </span>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-4 gap-3 text-xs">
        <div className="bg-white rounded-lg p-2 border border-gray-100">
          <span className="text-gray-500 block text-[10px] uppercase tracking-wider">Coverage Span</span>
          <span className="font-bold text-gray-900">{analysis.coverageSpan.toFixed(0)} mL</span>
        </div>
        <div className="bg-white rounded-lg p-2 border border-gray-100">
          <span className="text-gray-500 block text-[10px] uppercase tracking-wider">Covered</span>
          <span className="font-bold text-blue-600">{analysis.coveredRange.toFixed(0)} mL</span>
        </div>
        <div className={`rounded-lg p-2 border ${
          hasGaps ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'
        }`}>
          <span className="text-gray-500 block text-[10px] uppercase tracking-wider">Total Gaps</span>
          <span className={`font-bold ${hasGaps ? 'text-red-600' : 'text-green-600'}`}>
            {analysis.totalGapSize.toFixed(0)} mL
          </span>
          {hasGaps && (
            <span className="text-[10px] text-red-400 block">
              {analysis.gaps.length} gap{analysis.gaps.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className={`rounded-lg p-2 border ${
          hasOverlaps ? 'bg-yellow-50 border-yellow-100' : 'bg-white border-gray-100'
        }`}>
          <span className="text-gray-500 block text-[10px] uppercase tracking-wider">Overlaps</span>
          <span className={`font-bold ${hasOverlaps ? 'text-yellow-600' : 'text-gray-400'}`}>
            {analysis.totalOverlapSize.toFixed(0)} mL
          </span>
          {hasOverlaps && (
            <span className="text-[10px] text-yellow-500 block">
              {analysis.overlaps.length} overlap{analysis.overlaps.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Coverage efficiency bar */}
      <div className="mt-3">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              efficiencyColor === 'green' ? 'bg-green-500' :
              efficiencyColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, analysis.coverageEfficiency)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-gray-400">
          <span>Space utilization: {analysis.spaceUtilization.toFixed(1)}%</span>
          <span>{analysis.coveredRange.toFixed(0)} / {analysis.coverageSpan.toFixed(0)} mL</span>
        </div>
      </div>

      {/* Gap details (collapsed by default for space) */}
      {hasGaps && (
        <div className="mt-2 space-y-1">
          {analysis.gaps.map((gap, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px]">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                gap.severity === 'major' ? 'bg-red-500' :
                gap.severity === 'moderate' ? 'bg-orange-500' : 'bg-yellow-500'
              }`} />
              <span className="text-gray-600">
                {gap.startVolume.toFixed(0)}–{gap.endVolume.toFixed(0)} mL
              </span>
              <span className={`font-medium ${
                gap.severity === 'major' ? 'text-red-600' :
                gap.severity === 'moderate' ? 'text-orange-600' : 'text-yellow-600'
              }`}>
                {gap.gapSize.toFixed(0)} mL {gap.severity}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
