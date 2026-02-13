/**
 * Analysis Report Component
 * Displays coverage metrics, gap analysis, and recommendations.
 * Now includes per-series (intra-series) gap analysis and space efficiency metrics.
 */

import React from 'react';
import { useStore } from '@/store';
import { BottleSeries, SeriesComparison, IntraSeriesAnalysis } from '@/types/bottleSeries';
import { AlertTriangle, CheckCircle, Info, TrendingUp, BarChart3 } from 'lucide-react';

interface AnalysisReportProps {
  series1: BottleSeries;
  series2: BottleSeries;
  comparison: SeriesComparison;
}

export default function AnalysisReport({ series1, series2, comparison }: AnalysisReportProps) {
  const { updateSeriesComparison } = useStore();

  const majorGaps = comparison.gaps.filter(g => g.severity === 'major');
  const moderateGaps = comparison.gaps.filter(g => g.severity === 'moderate');
  const minorGaps = comparison.gaps.filter(g => g.severity === 'minor');

  // Determine overall health
  const overallHealth = comparison.combinedCoverage >= 90 ? 'good' :
    comparison.combinedCoverage >= 70 ? 'moderate' : 'poor';

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900">Coverage Analysis Report</h4>
      </div>

      <div className="p-4 space-y-5">
        {/* Overall Status */}
        <div className={`rounded-lg p-4 ${
          overallHealth === 'good' ? 'bg-green-50 border border-green-200' :
          overallHealth === 'moderate' ? 'bg-yellow-50 border border-yellow-200' :
          'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {overallHealth === 'good' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : overallHealth === 'moderate' ? (
              <Info className="w-5 h-5 text-yellow-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            )}
            <span className={`font-semibold text-sm ${
              overallHealth === 'good' ? 'text-green-800' :
              overallHealth === 'moderate' ? 'text-yellow-800' :
              'text-red-800'
            }`}>
              {overallHealth === 'good' ? 'Good Coverage' :
               overallHealth === 'moderate' ? 'Moderate Coverage' :
               'Poor Coverage'}
            </span>
          </div>
          <p className={`text-xs ${
            overallHealth === 'good' ? 'text-green-700' :
            overallHealth === 'moderate' ? 'text-yellow-700' :
            'text-red-700'
          }`}>
            Combined coverage of {comparison.combinedCoverage.toFixed(1)}% with {comparison.gaps.length} combined gap{comparison.gaps.length !== 1 ? 's' : ''} detected.
          </p>
        </div>

        {/* Coverage Metrics */}
        <div>
          <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Coverage Metrics</h5>
          <div className="grid grid-cols-3 gap-3">
            <CoverageMetric
              label={series1.name}
              value={comparison.series1Coverage}
              color="blue"
            />
            <CoverageMetric
              label={series2.name}
              value={comparison.series2Coverage}
              color="green"
            />
            <CoverageMetric
              label="Combined"
              value={comparison.combinedCoverage}
              color={overallHealth === 'good' ? 'green' : overallHealth === 'moderate' ? 'yellow' : 'red'}
            />
          </div>
        </div>

        {/* Per-Series Space Efficiency */}
        <div>
          <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            Per-Series Space Efficiency
          </h5>
          <div className="grid grid-cols-2 gap-3">
            <SeriesEfficiencyCard
              analysis={comparison.series1Analysis}
              color="blue"
            />
            <SeriesEfficiencyCard
              analysis={comparison.series2Analysis}
              color="green"
            />
          </div>
        </div>

        {/* Combined Gap Summary */}
        <div>
          <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Combined Gap Analysis</h5>
          {comparison.gaps.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              No combined coverage gaps detected
            </div>
          ) : (
            <div className="space-y-2">
              {majorGaps.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-red-700 font-medium">{majorGaps.length} major gap{majorGaps.length > 1 ? 's' : ''}</span>
                  <span className="text-gray-400 text-xs">(&gt;50 mL)</span>
                </div>
              )}
              {moderateGaps.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-orange-700 font-medium">{moderateGaps.length} moderate gap{moderateGaps.length > 1 ? 's' : ''}</span>
                  <span className="text-gray-400 text-xs">(20–50 mL)</span>
                </div>
              )}
              {minorGaps.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-yellow-700 font-medium">{minorGaps.length} minor gap{minorGaps.length > 1 ? 's' : ''}</span>
                  <span className="text-gray-400 text-xs">(&lt;20 mL)</span>
                </div>
              )}

              {/* Gap details */}
              <div className="mt-3 space-y-2">
                {comparison.gaps.map((gap, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        Combined Gap {i + 1}: {gap.startVolume.toFixed(0)}–{gap.endVolume.toFixed(0)} mL
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        gap.severity === 'major' ? 'bg-red-100 text-red-700' :
                        gap.severity === 'moderate' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {gap.gapSize.toFixed(0)} mL
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cross-Series Overlap Summary */}
        {comparison.overlaps.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Cross-Series Overlaps</h5>
            <p className="text-xs text-gray-600 mb-2">
              {comparison.overlaps.length} overlapping fill range{comparison.overlaps.length > 1 ? 's' : ''} detected between the two series.
            </p>
            <div className="space-y-1">
              {comparison.overlaps.slice(0, 5).map((overlap, i) => (
                <div key={i} className="text-xs text-gray-500">
                  • {overlap.startVolume.toFixed(0)}–{overlap.endVolume.toFixed(0)} mL ({overlap.overlapSize.toFixed(0)} mL overlap)
                </div>
              ))}
              {comparison.overlaps.length > 5 && (
                <div className="text-xs text-gray-400">
                  ...and {comparison.overlaps.length - 5} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div>
          <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Recommendations
          </h5>
          <div className="space-y-2">
            {comparison.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-700 bg-blue-50 rounded-lg p-3">
                <span className="text-blue-500 font-bold mt-0.5">→</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Notes</h5>
          <textarea
            value={comparison.notes}
            onChange={(e) => updateSeriesComparison(comparison.id, { notes: e.target.value })}
            className="input h-20 resize-none text-sm"
            placeholder="Add notes about this comparison..."
          />
        </div>
      </div>
    </div>
  );
}

// ─── Coverage Metric Card ─────────────────────────────────────────────

interface CoverageMetricProps {
  label: string;
  value: number;
  color: 'blue' | 'green' | 'yellow' | 'red';
}

function CoverageMetric({ label, value, color }: CoverageMetricProps) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-700 bg-blue-50',
    green: 'text-green-700 bg-green-50',
    yellow: 'text-yellow-700 bg-yellow-50',
    red: 'text-red-700 bg-red-50',
  };

  const barColorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  return (
    <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
      <div className="text-[10px] uppercase tracking-wider opacity-70 truncate">{label}</div>
      <div className="text-lg font-bold">{value.toFixed(1)}%</div>
      <div className="w-full h-1.5 bg-white/50 rounded-full mt-1">
        <div
          className={`h-full rounded-full ${barColorClasses[color]}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

// ─── Series Efficiency Card ───────────────────────────────────────────

interface SeriesEfficiencyCardProps {
  analysis: IntraSeriesAnalysis;
  color: 'blue' | 'green';
}

function SeriesEfficiencyCard({ analysis, color }: SeriesEfficiencyCardProps) {
  const borderColor = color === 'blue' ? 'border-blue-200' : 'border-green-200';
  const bgColor = color === 'blue' ? 'bg-blue-50' : 'bg-green-50';
  const textColor = color === 'blue' ? 'text-blue-700' : 'text-green-700';
  const barColor = color === 'blue' ? 'bg-blue-500' : 'bg-green-500';

  const effHealth = analysis.coverageEfficiency >= 90 ? 'good' :
    analysis.coverageEfficiency >= 70 ? 'moderate' : 'poor';

  return (
    <div className={`rounded-lg p-3 border ${borderColor} ${bgColor}`}>
      <div className={`text-[10px] uppercase tracking-wider font-semibold ${textColor} mb-1`}>
        {analysis.seriesName}
      </div>

      {/* Efficiency score */}
      <div className="flex items-baseline gap-1 mb-2">
        <span className={`text-lg font-bold ${
          effHealth === 'good' ? 'text-green-600' :
          effHealth === 'moderate' ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {analysis.coverageEfficiency.toFixed(0)}%
        </span>
        <span className="text-[10px] text-gray-500">efficiency</span>
      </div>

      {/* Efficiency bar */}
      <div className="w-full h-1.5 bg-white/50 rounded-full mb-2">
        <div
          className={`h-full rounded-full ${
            effHealth === 'good' ? 'bg-green-500' :
            effHealth === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${Math.min(100, analysis.coverageEfficiency)}%` }}
        />
      </div>

      {/* Metrics */}
      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span className="text-gray-500">Span:</span>
          <span className="font-medium text-gray-700">{analysis.coverageSpan.toFixed(0)} mL</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Covered:</span>
          <span className="font-medium text-gray-700">{analysis.coveredRange.toFixed(0)} mL</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Internal gaps:</span>
          <span className={`font-medium ${analysis.gaps.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {analysis.gaps.length} ({analysis.totalGapSize.toFixed(0)} mL)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Internal overlaps:</span>
          <span className={`font-medium ${analysis.overlaps.length > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
            {analysis.overlaps.length} ({analysis.totalOverlapSize.toFixed(0)} mL)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Space utilization:</span>
          <span className="font-medium text-gray-700">{analysis.spaceUtilization.toFixed(0)}%</span>
        </div>
      </div>

      {/* Internal gap details */}
      {analysis.gaps.length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/50 space-y-0.5">
          {analysis.gaps.map((gap, i) => (
            <div key={i} className="flex items-center gap-1 text-[10px]">
              <span className={`w-1 h-1 rounded-full ${
                gap.severity === 'major' ? 'bg-red-500' :
                gap.severity === 'moderate' ? 'bg-orange-500' : 'bg-yellow-500'
              }`} />
              <span className="text-gray-600">
                {gap.startVolume.toFixed(0)}–{gap.endVolume.toFixed(0)} mL ({gap.gapSize.toFixed(0)} mL)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
