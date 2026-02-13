/**
 * Series Generator Component
 * Configuration panel for generating bottle series using mathematical algorithms.
 */

import React, { useState } from 'react';
import { useStore } from '@/store';
import {
  GenerationAlgorithm,
  GenerationConfig,
  DEFAULT_GENERATION_CONFIG,
  GENERATION_ALGORITHM_NAMES,
  GENERATION_ALGORITHM_DESCRIPTIONS,
} from '@/types/bottleSeries';
import {
  BottleShape,
  SHAPE_NAMES,
} from '@/types/bottle';
import { BottleGenerationService } from '@/services/bottleGenerationService';
import { Sparkles, Info } from 'lucide-react';

export default function SeriesGenerator() {
  const {
    createBottleSeries,
    activeSeriesId,
    bottleSeries,
    setActiveSeries,
    regenerateSeries,
  } = useStore();

  const [config, setConfig] = useState<GenerationConfig>({ ...DEFAULT_GENERATION_CONFIG });
  const [seriesName, setSeriesName] = useState('New Series');
  const [previewVolumes, setPreviewVolumes] = useState<number[]>([]);

  // Update config and preview
  const updateConfig = (updates: Partial<GenerationConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    // Update volume preview
    try {
      const volumes = BottleGenerationService.calculateVolumes(newConfig);
      setPreviewVolumes(volumes);
    } catch {
      setPreviewVolumes([]);
    }
  };

  // Generate series
  const handleGenerate = () => {
    createBottleSeries(seriesName, config);
    setSeriesName('New Series');
  };

  // Regenerate active series with new config
  const handleRegenerate = () => {
    if (activeSeriesId) {
      regenerateSeries(activeSeriesId, config);
    }
  };

  // Initialize preview on mount
  React.useEffect(() => {
    try {
      const volumes = BottleGenerationService.calculateVolumes(config);
      setPreviewVolumes(volumes);
    } catch {
      setPreviewVolumes([]);
    }
  }, []);

  const algorithms: GenerationAlgorithm[] = ['linear', 'golden-ratio', 'logarithmic'];
  const shapes: BottleShape[] = ['boston-round', 'cylinder', 'oval', 'modern-pharmaceutical', 'packer', 'wide-mouth'];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Series Generator</h2>
      </div>

      {/* Series Name */}
      <div>
        <label className="label">Series Name</label>
        <input
          type="text"
          value={seriesName}
          onChange={(e) => setSeriesName(e.target.value)}
          className="input"
          placeholder="Enter series name..."
        />
      </div>

      {/* Algorithm Selection */}
      <div>
        <label className="label">Generation Algorithm</label>
        <div className="space-y-2">
          {algorithms.map((algo) => (
            <label
              key={algo}
              className={`
                flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                ${config.algorithm === algo
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <input
                type="radio"
                name="algorithm"
                value={algo}
                checked={config.algorithm === algo}
                onChange={() => updateConfig({ algorithm: algo })}
                className="mt-0.5"
              />
              <div>
                <div className="font-medium text-sm">{GENERATION_ALGORITHM_NAMES[algo]}</div>
                <div className="text-xs text-gray-500">{GENERATION_ALGORITHM_DESCRIPTIONS[algo]}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Volume Range */}
      <div>
        <label className="label">Volume Range (mL)</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">Minimum</label>
            <input
              type="number"
              value={config.minVolume}
              onChange={(e) => updateConfig({ minVolume: Math.max(1, parseInt(e.target.value) || 1) })}
              min={1}
              max={config.maxVolume - 1}
              className="input"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Maximum</label>
            <input
              type="number"
              value={config.maxVolume}
              onChange={(e) => updateConfig({ maxVolume: Math.max(config.minVolume + 1, parseInt(e.target.value) || 100) })}
              min={config.minVolume + 1}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Bottle Count */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <label className="label mb-0">Number of Bottles</label>
          <span className="font-mono text-gray-900 font-medium">{config.bottleCount}</span>
        </div>
        <input
          type="range"
          min={3}
          max={10}
          value={config.bottleCount}
          onChange={(e) => updateConfig({ bottleCount: parseInt(e.target.value) })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>3</span>
          <span>10</span>
        </div>
      </div>

      {/* Base Template */}
      <div>
        <label className="label">Base Bottle Shape</label>
        <select
          value={config.baseTemplateId}
          onChange={(e) => updateConfig({ baseTemplateId: e.target.value })}
          className="input"
        >
          {shapes.map((shape) => (
            <option key={shape} value={shape}>
              {SHAPE_NAMES[shape]}
            </option>
          ))}
        </select>
      </div>

      {/* Fill Range */}
      <div>
        <label className="label">Fill Range (%)</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">Min Fill %</label>
            <input
              type="number"
              value={config.fillRangeMin}
              onChange={(e) => updateConfig({ fillRangeMin: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
              min={0}
              max={config.fillRangeMax - 1}
              className="input"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Max Fill %</label>
            <input
              type="number"
              value={config.fillRangeMax}
              onChange={(e) => updateConfig({ fillRangeMax: Math.max(config.fillRangeMin + 1, Math.min(100, parseInt(e.target.value) || 100)) })}
              min={config.fillRangeMin + 1}
              max={100}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Volume Preview */}
      {previewVolumes.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <Info className="w-3 h-3" />
            <span>Volume Preview</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {previewVolumes.map((vol, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
              >
                {vol} mL
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!seriesName.trim() || config.minVolume >= config.maxVolume}
        className="btn btn-primary w-full flex items-center justify-center gap-2"
      >
        <Sparkles className="w-4 h-4" />
        Generate Series
      </button>

      {/* Regenerate button (if active series exists) */}
      {activeSeriesId && (
        <button
          onClick={handleRegenerate}
          className="btn btn-secondary w-full text-sm"
        >
          Regenerate Active Series
        </button>
      )}

      {/* Existing Series List */}
      {Object.keys(bottleSeries).length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Saved Series</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {Object.values(bottleSeries).map((series) => (
              <div
                key={series.id}
                onClick={() => setActiveSeries(series.id)}
                className={`
                  p-3 rounded-lg border cursor-pointer transition-colors
                  ${activeSeriesId === series.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="font-medium text-sm">{series.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {series.bottles.length} bottles · {GENERATION_ALGORITHM_NAMES[series.config.algorithm]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
