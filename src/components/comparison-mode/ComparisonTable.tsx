/**
 * Comparison Table Component
 * Detailed table showing bottle specifications, fill ranges, and gaps.
 * Now includes per-series (intra-series) gap/overlap rows alongside combined (inter-series) gaps.
 */

import React from 'react';
import { BottleSeries, SeriesComparison, FillRange, CoverageGap, IntraSeriesAnalysis } from '@/types/bottleSeries';
import { FillRangeService } from '@/services/fillRangeService';

interface ComparisonTableProps {
  series1: BottleSeries;
  series2: BottleSeries;
  comparison: SeriesComparison;
}

export default function ComparisonTable({ series1, series2, comparison }: ComparisonTableProps) {
  const ranges1 = FillRangeService.calculateSeriesFillRanges(series1);
  const ranges2 = FillRangeService.calculateSeriesFillRanges(series2);

  // Build interleaved rows: series1 bottles + internal gaps, combined gaps, series2 bottles + internal gaps
  const rows = buildTableRows(
    series1, ranges1, comparison.series1Analysis,
    series2, ranges2, comparison.series2Analysis,
    comparison.gaps
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900">Detailed Comparison</h4>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Bottle</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Volume (mL)</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Min Fill</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Target Fill</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Max Fill</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Coverage Range</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, index) => {
              if (row.type === 'series-header') {
                return (
                  <tr key={`header-${index}`} className="bg-gray-50">
                    <td colSpan={6} className="px-4 py-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold uppercase tracking-wider ${
                          row.seriesNum === 1 ? 'text-blue-600' : 'text-green-600'
                        }`}>
                          {row.seriesNum === 1 ? '● ' : '● '}{row.label}
                        </span>
                        {row.efficiency !== undefined && (
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            row.efficiency >= 90 ? 'bg-green-100 text-green-700' :
                            row.efficiency >= 70 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {row.efficiency.toFixed(0)}% efficient · {row.internalGapCount} internal gap{row.internalGapCount !== 1 ? 's' : ''} ({row.internalGapTotal?.toFixed(0)} mL)
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }

              if (row.type === 'bottle') {
                return (
                  <tr key={`bottle-${index}`} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">{row.name}</td>
                    <td className="px-4 py-2 text-right font-mono">{row.volume?.toFixed(0)}</td>
                    <td className="px-4 py-2 text-right font-mono text-green-600">{row.minFill?.toFixed(0)}</td>
                    <td className="px-4 py-2 text-right font-mono text-blue-600">{row.targetFill?.toFixed(0)}</td>
                    <td className="px-4 py-2 text-right font-mono text-purple-600">{row.maxFill?.toFixed(0)}</td>
                    <td className="px-4 py-2">
                      <span className="text-xs text-gray-500">
                        {row.minFill?.toFixed(0)}–{row.maxFill?.toFixed(0)} mL
                      </span>
                    </td>
                  </tr>
                );
              }

              if (row.type === 'gap') {
                const isInternal = row.gapScope === 'internal';
                return (
                  <tr key={`gap-${index}`} className={isInternal ? 'bg-orange-50' : 'bg-red-50'}>
                    <td className="px-4 py-2" colSpan={2}>
                      <span className={`font-semibold text-xs uppercase flex items-center gap-1 ${
                        isInternal ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {isInternal ? '↳ INTERNAL GAP' : '⚠ COMBINED GAP'}
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          row.severity === 'major' ? 'bg-red-200 text-red-800' :
                          row.severity === 'moderate' ? 'bg-orange-200 text-orange-800' :
                          'bg-yellow-200 text-yellow-800'
                        }`}>
                          {row.severity}
                        </span>
                      </span>
                    </td>
                    <td className={`px-4 py-2 text-right font-mono ${isInternal ? 'text-orange-600' : 'text-red-600'}`}>{row.gapStart?.toFixed(0)}</td>
                    <td className={`px-4 py-2 text-right ${isInternal ? 'text-orange-500' : 'text-red-500'}`}>—</td>
                    <td className={`px-4 py-2 text-right font-mono ${isInternal ? 'text-orange-600' : 'text-red-600'}`}>{row.gapEnd?.toFixed(0)}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs font-medium ${isInternal ? 'text-orange-600' : 'text-red-600'}`}>
                        {row.gapStart?.toFixed(0)}–{row.gapEnd?.toFixed(0)} mL ({row.gapSize?.toFixed(0)} mL)
                      </span>
                    </td>
                  </tr>
                );
              }

              return null;
            })}
          </tbody>
        </table>
      </div>

      {/* Summary row — now includes per-series metrics */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-xs mb-2">
          <div>
            <span className="text-gray-500">Combined Gaps:</span>
            <span className="ml-1 font-semibold text-red-600">{comparison.gaps.length}</span>
          </div>
          <div>
            <span className="text-gray-500">Cross-Series Overlaps:</span>
            <span className="ml-1 font-semibold text-yellow-600">{comparison.overlaps.length}</span>
          </div>
          <div>
            <span className="text-gray-500">Combined Coverage:</span>
            <span className="ml-1 font-semibold text-green-600">{comparison.combinedCoverage.toFixed(1)}%</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs border-t border-gray-200 pt-2">
          <div>
            <span className="text-blue-500 font-medium">{series1.name}:</span>
            <span className="ml-1 text-gray-600">
              {comparison.series1Analysis.gaps.length} internal gap{comparison.series1Analysis.gaps.length !== 1 ? 's' : ''} ({comparison.series1Analysis.totalGapSize.toFixed(0)} mL) · {comparison.series1Analysis.coverageEfficiency.toFixed(0)}% efficient
            </span>
          </div>
          <div>
            <span className="text-green-500 font-medium">{series2.name}:</span>
            <span className="ml-1 text-gray-600">
              {comparison.series2Analysis.gaps.length} internal gap{comparison.series2Analysis.gaps.length !== 1 ? 's' : ''} ({comparison.series2Analysis.totalGapSize.toFixed(0)} mL) · {comparison.series2Analysis.coverageEfficiency.toFixed(0)}% efficient
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Row Building ─────────────────────────────────────────────────────

interface TableRow {
  type: 'series-header' | 'bottle' | 'gap';
  seriesNum?: number;
  label?: string;
  efficiency?: number;
  internalGapCount?: number;
  internalGapTotal?: number;
  name?: string;
  volume?: number;
  minFill?: number;
  targetFill?: number;
  maxFill?: number;
  gapStart?: number;
  gapEnd?: number;
  gapSize?: number;
  severity?: string;
  gapScope?: 'internal' | 'combined';
}

function buildTableRows(
  series1: BottleSeries,
  ranges1: FillRange[],
  s1Analysis: IntraSeriesAnalysis,
  series2: BottleSeries,
  ranges2: FillRange[],
  s2Analysis: IntraSeriesAnalysis,
  combinedGaps: CoverageGap[]
): TableRow[] {
  const rows: TableRow[] = [];

  // Series 1 header (with efficiency metric)
  rows.push({
    type: 'series-header',
    seriesNum: 1,
    label: series1.name,
    efficiency: s1Analysis.coverageEfficiency,
    internalGapCount: s1Analysis.gaps.length,
    internalGapTotal: s1Analysis.totalGapSize,
  });

  // Series 1 bottles with interleaved internal gaps
  const sorted1 = series1.bottles
    .map((bottle, i) => ({ bottle, range: ranges1[i] }))
    .sort((a, b) => a.range.minFill - b.range.minFill);

  sorted1.forEach(({ bottle, range }, i) => {
    rows.push({
      type: 'bottle',
      name: `${series1.name} — ${bottle.name}`,
      volume: bottle.volume,
      minFill: range.minFill,
      targetFill: range.targetFill,
      maxFill: range.maxFill,
    });

    // Check if there's an internal gap after this bottle
    if (i < sorted1.length - 1) {
      const nextMin = sorted1[i + 1].range.minFill;
      const currentMax = range.maxFill;
      const matchingGap = s1Analysis.gaps.find(
        g => Math.abs(g.startVolume - currentMax) < 0.1 && Math.abs(g.endVolume - nextMin) < 0.1
      );
      if (matchingGap) {
        rows.push({
          type: 'gap',
          gapStart: matchingGap.startVolume,
          gapEnd: matchingGap.endVolume,
          gapSize: matchingGap.gapSize,
          severity: matchingGap.severity,
          gapScope: 'internal',
        });
      }
    }
  });

  // Combined gaps
  if (combinedGaps.length > 0) {
    combinedGaps.forEach((gap) => {
      rows.push({
        type: 'gap',
        gapStart: gap.startVolume,
        gapEnd: gap.endVolume,
        gapSize: gap.gapSize,
        severity: gap.severity,
        gapScope: 'combined',
      });
    });
  }

  // Series 2 header (with efficiency metric)
  rows.push({
    type: 'series-header',
    seriesNum: 2,
    label: series2.name,
    efficiency: s2Analysis.coverageEfficiency,
    internalGapCount: s2Analysis.gaps.length,
    internalGapTotal: s2Analysis.totalGapSize,
  });

  // Series 2 bottles with interleaved internal gaps
  const sorted2 = series2.bottles
    .map((bottle, i) => ({ bottle, range: ranges2[i] }))
    .sort((a, b) => a.range.minFill - b.range.minFill);

  sorted2.forEach(({ bottle, range }, i) => {
    rows.push({
      type: 'bottle',
      name: `${series2.name} — ${bottle.name}`,
      volume: bottle.volume,
      minFill: range.minFill,
      targetFill: range.targetFill,
      maxFill: range.maxFill,
    });

    // Check if there's an internal gap after this bottle
    if (i < sorted2.length - 1) {
      const nextMin = sorted2[i + 1].range.minFill;
      const currentMax = range.maxFill;
      const matchingGap = s2Analysis.gaps.find(
        g => Math.abs(g.startVolume - currentMax) < 0.1 && Math.abs(g.endVolume - nextMin) < 0.1
      );
      if (matchingGap) {
        rows.push({
          type: 'gap',
          gapStart: matchingGap.startVolume,
          gapEnd: matchingGap.endVolume,
          gapSize: matchingGap.gapSize,
          severity: matchingGap.severity,
          gapScope: 'internal',
        });
      }
    }
  });

  return rows;
}
