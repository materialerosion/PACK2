/**
 * Comparison Chart Component
 * Horizontal bar chart showing fill ranges for two series with gap/overlap indicators.
 * Now includes per-series (intra-series) gap indicators alongside the combined (inter-series) gaps.
 */

import { useMemo, useState } from 'react';
import { BottleSeries, SeriesComparison, FillRange, CoverageGap, CoverageOverlap } from '@/types/bottleSeries';
import { FillRangeService } from '@/services/fillRangeService';

interface ComparisonChartProps {
  series1: BottleSeries;
  series2: BottleSeries;
  comparison: SeriesComparison;
}

export default function ComparisonChart({ series1, series2, comparison }: ComparisonChartProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Calculate fill ranges
  const ranges1 = useMemo(() => FillRangeService.calculateSeriesFillRanges(series1), [series1]);
  const ranges2 = useMemo(() => FillRangeService.calculateSeriesFillRanges(series2), [series2]);

  // Calculate chart bounds
  const allRanges = [...ranges1, ...ranges2];
  const minVol = Math.min(...allRanges.map(r => r.minFill), 0);
  const maxVol = Math.max(...allRanges.map(r => r.maxFill)) * 1.05;
  const totalRange = maxVol - minVol;

  // Convert volume to percentage position
  const toPercent = (vol: number) => ((vol - minVol) / totalRange) * 100;

  // Generate axis ticks
  const tickCount = 8;
  const tickStep = Math.ceil(totalRange / tickCount / 10) * 10;
  const ticks: number[] = [];
  for (let v = Math.ceil(minVol / tickStep) * tickStep; v <= maxVol; v += tickStep) {
    ticks.push(v);
  }

  const s1Analysis = comparison.series1Analysis;
  const s2Analysis = comparison.series2Analysis;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-4">Fill Range Comparison</h4>

      <div className="space-y-4">
        {/* Series 1 fill ranges */}
        <div>
          <div className="text-xs font-medium text-blue-600 mb-1 flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            {series1.name}
            <span className="text-[10px] text-gray-400 ml-auto">
              {s1Analysis.coverageEfficiency.toFixed(0)}% efficient
            </span>
          </div>
          <div className="relative h-8 bg-gray-50 rounded">
            {ranges1.map((range, i) => (
              <FillRangeBar
                key={range.bottleId}
                range={range}
                minVol={minVol}
                totalRange={totalRange}
                color="blue"
                label={`${range.bottleVolume.toFixed(0)} mL`}
                isHovered={hoveredItem === `s1-${i}`}
                onHover={() => setHoveredItem(`s1-${i}`)}
                onLeave={() => setHoveredItem(null)}
              />
            ))}
          </div>
          {/* Series 1 internal gaps */}
          {s1Analysis.gaps.length > 0 && (
            <div className="relative h-4 mt-0.5">
              {s1Analysis.gaps.map((gap, i) => (
                <GapIndicator
                  key={`s1-gap-${i}`}
                  gap={gap}
                  minVol={minVol}
                  totalRange={totalRange}
                  isHovered={hoveredItem === `s1-gap-${i}`}
                  onHover={() => setHoveredItem(`s1-gap-${i}`)}
                  onLeave={() => setHoveredItem(null)}
                  compact
                  label={`${series1.name} internal gap`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Combined gap indicators */}
        {comparison.gaps.length > 0 && (
          <div>
            <div className="text-xs font-medium text-red-600 mb-1 flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              Combined Gaps ({comparison.gaps.length})
            </div>
            <div className="relative h-6 bg-gray-50 rounded">
              {comparison.gaps.map((gap, i) => (
                <GapIndicator
                  key={i}
                  gap={gap}
                  minVol={minVol}
                  totalRange={totalRange}
                  isHovered={hoveredItem === `gap-${i}`}
                  onHover={() => setHoveredItem(`gap-${i}`)}
                  onLeave={() => setHoveredItem(null)}
                  label="Combined gap"
                />
              ))}
            </div>
          </div>
        )}

        {/* Overlap indicators */}
        {comparison.overlaps.length > 0 && (
          <div>
            <div className="text-xs font-medium text-yellow-600 mb-1 flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-400" />
              Cross-Series Overlaps ({comparison.overlaps.length})
            </div>
            <div className="relative h-6 bg-gray-50 rounded">
              {comparison.overlaps.map((overlap, i) => (
                <OverlapIndicator
                  key={i}
                  overlap={overlap}
                  minVol={minVol}
                  totalRange={totalRange}
                  isHovered={hoveredItem === `overlap-${i}`}
                  onHover={() => setHoveredItem(`overlap-${i}`)}
                  onLeave={() => setHoveredItem(null)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Series 2 fill ranges */}
        <div>
          <div className="text-xs font-medium text-green-600 mb-1 flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            {series2.name}
            <span className="text-[10px] text-gray-400 ml-auto">
              {s2Analysis.coverageEfficiency.toFixed(0)}% efficient
            </span>
          </div>
          <div className="relative h-8 bg-gray-50 rounded">
            {ranges2.map((range, i) => (
              <FillRangeBar
                key={range.bottleId}
                range={range}
                minVol={minVol}
                totalRange={totalRange}
                color="green"
                label={`${range.bottleVolume.toFixed(0)} mL`}
                isHovered={hoveredItem === `s2-${i}`}
                onHover={() => setHoveredItem(`s2-${i}`)}
                onLeave={() => setHoveredItem(null)}
              />
            ))}
          </div>
          {/* Series 2 internal gaps */}
          {s2Analysis.gaps.length > 0 && (
            <div className="relative h-4 mt-0.5">
              {s2Analysis.gaps.map((gap, i) => (
                <GapIndicator
                  key={`s2-gap-${i}`}
                  gap={gap}
                  minVol={minVol}
                  totalRange={totalRange}
                  isHovered={hoveredItem === `s2-gap-${i}`}
                  onHover={() => setHoveredItem(`s2-gap-${i}`)}
                  onLeave={() => setHoveredItem(null)}
                  compact
                  label={`${series2.name} internal gap`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Volume axis */}
        <div className="relative h-6 border-t border-gray-300">
          {ticks.map((tick) => {
            const left = toPercent(tick);
            return (
              <div
                key={tick}
                className="absolute top-0 flex flex-col items-center"
                style={{ left: `${left}%`, transform: 'translateX(-50%)' }}
              >
                <div className="w-px h-2 bg-gray-400" />
                <span className="text-[10px] text-gray-500 mt-0.5">{tick}</span>
              </div>
            );
          })}
          <div className="absolute -bottom-1 right-0 text-[10px] text-gray-400">mL</div>
        </div>
      </div>
    </div>
  );
}

// ─── Fill Range Bar ───────────────────────────────────────────────────

interface FillRangeBarProps {
  range: FillRange;
  minVol: number;
  totalRange: number;
  color: 'blue' | 'green';
  label: string;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}

function FillRangeBar({ range, minVol, totalRange, color, label, isHovered, onHover, onLeave }: FillRangeBarProps) {
  const left = ((range.minFill - minVol) / totalRange) * 100;
  const width = ((range.maxFill - range.minFill) / totalRange) * 100;

  const colorClasses = color === 'blue'
    ? 'bg-blue-400 hover:bg-blue-500'
    : 'bg-green-400 hover:bg-green-500';

  return (
    <div
      className={`absolute top-1 bottom-1 rounded transition-all cursor-pointer ${colorClasses} ${isHovered ? 'ring-2 ring-offset-1 ring-blue-300 z-10' : ''}`}
      style={{ left: `${left}%`, width: `${Math.max(width, 0.5)}%` }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Target fill line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/60"
        style={{ left: `${((range.targetFill - range.minFill) / (range.maxFill - range.minFill)) * 100}%` }}
      />

      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-20 shadow-lg">
          <div className="font-medium">{label}</div>
          <div className="text-gray-300">
            Fill: {range.minFill.toFixed(0)}–{range.maxFill.toFixed(0)} mL
          </div>
          <div className="text-gray-300">
            Target: {range.targetFill.toFixed(0)} mL ({range.targetPercent.toFixed(0)}%)
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
        </div>
      )}
    </div>
  );
}

// ─── Gap Indicator ────────────────────────────────────────────────────

interface GapIndicatorProps {
  gap: CoverageGap;
  minVol: number;
  totalRange: number;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  compact?: boolean;   // Smaller height for inline per-series gaps
  label?: string;      // Custom label for the tooltip header
}

function GapIndicator({ gap, minVol, totalRange, isHovered, onHover, onLeave, compact, label }: GapIndicatorProps) {
  const left = ((gap.startVolume - minVol) / totalRange) * 100;
  const width = ((gap.endVolume - gap.startVolume) / totalRange) * 100;

  const severityColors: Record<string, string> = {
    minor: 'bg-red-200',
    moderate: 'bg-red-300',
    major: 'bg-red-400',
  };

  return (
    <div
      className={`absolute ${compact ? 'top-0.5 bottom-0.5' : 'top-1 bottom-1'} rounded cursor-pointer transition-all ${severityColors[gap.severity]} ${isHovered ? 'ring-2 ring-red-400 z-10' : ''}`}
      style={{
        left: `${left}%`,
        width: `${Math.max(width, 0.5)}%`,
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.3) 3px, rgba(255,255,255,0.3) 6px)',
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {isHovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-red-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-20 shadow-lg">
          <div className="font-medium">{label || 'Gap'} ({gap.severity})</div>
          <div className="text-red-200">
            {gap.startVolume.toFixed(0)}–{gap.endVolume.toFixed(0)} mL ({gap.gapSize.toFixed(0)} mL)
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-red-800 rotate-45 -mt-1" />
        </div>
      )}
    </div>
  );
}

// ─── Overlap Indicator ────────────────────────────────────────────────

interface OverlapIndicatorProps {
  overlap: CoverageOverlap;
  minVol: number;
  totalRange: number;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}

function OverlapIndicator({ overlap, minVol, totalRange, isHovered, onHover, onLeave }: OverlapIndicatorProps) {
  const left = ((overlap.startVolume - minVol) / totalRange) * 100;
  const width = ((overlap.endVolume - overlap.startVolume) / totalRange) * 100;

  return (
    <div
      className={`absolute top-1 bottom-1 rounded cursor-pointer transition-all bg-yellow-300 ${isHovered ? 'ring-2 ring-yellow-500 z-10' : ''}`}
      style={{
        left: `${left}%`,
        width: `${Math.max(width, 0.5)}%`,
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.4) 2px, rgba(255,255,255,0.4) 4px), repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(255,255,255,0.4) 2px, rgba(255,255,255,0.4) 4px)',
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {isHovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-yellow-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-20 shadow-lg">
          <div className="font-medium">Overlap</div>
          <div className="text-yellow-200">
            {overlap.startVolume.toFixed(0)}–{overlap.endVolume.toFixed(0)} mL ({overlap.overlapSize.toFixed(0)} mL)
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-800 rotate-45 -mt-1" />
        </div>
      )}
    </div>
  );
}
