/**
 * Series Selector Component
 * Two dropdowns for selecting bottle series to compare.
 */

import React, { useState } from 'react';
import { useStore } from '@/store';
import { GENERATION_ALGORITHM_NAMES } from '@/types/bottleSeries';
import { GitCompare } from 'lucide-react';

export default function SeriesSelector() {
  const {
    bottleSeries,
    createSeriesComparison,
  } = useStore();

  const [series1Id, setSeries1Id] = useState<string>('');
  const [series2Id, setSeries2Id] = useState<string>('');

  const seriesList = Object.values(bottleSeries);

  const handleCompare = () => {
    if (series1Id && series2Id && series1Id !== series2Id) {
      createSeriesComparison(series1Id, series2Id);
    }
  };

  const canCompare = series1Id && series2Id && series1Id !== series2Id;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <GitCompare className="w-4 h-4" />
        Compare Series
      </h3>

      {seriesList.length < 2 ? (
        <div className="text-sm text-gray-400 text-center py-4">
          Generate at least 2 series to compare
        </div>
      ) : (
        <>
          {/* Series 1 */}
          <div>
            <label className="text-xs text-gray-600 font-medium">Series 1</label>
            <select
              value={series1Id}
              onChange={(e) => setSeries1Id(e.target.value)}
              className="input text-sm"
            >
              <option value="">Select series...</option>
              {seriesList.map((series) => (
                <option key={series.id} value={series.id} disabled={series.id === series2Id}>
                  {series.name} ({series.bottles.length} bottles, {GENERATION_ALGORITHM_NAMES[series.config.algorithm]})
                </option>
              ))}
            </select>
          </div>

          {/* Series 2 */}
          <div>
            <label className="text-xs text-gray-600 font-medium">Series 2</label>
            <select
              value={series2Id}
              onChange={(e) => setSeries2Id(e.target.value)}
              className="input text-sm"
            >
              <option value="">Select series...</option>
              {seriesList.map((series) => (
                <option key={series.id} value={series.id} disabled={series.id === series1Id}>
                  {series.name} ({series.bottles.length} bottles, {GENERATION_ALGORITHM_NAMES[series.config.algorithm]})
                </option>
              ))}
            </select>
          </div>

          {/* Compare button */}
          <button
            onClick={handleCompare}
            disabled={!canCompare}
            className="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            <GitCompare className="w-4 h-4" />
            Generate Comparison
          </button>
        </>
      )}
    </div>
  );
}
