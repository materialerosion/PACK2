/**
 * Batch Editor Component
 * Allows editing common properties across multiple selected bottles in a series.
 */

import { useState } from 'react';
import { useStore, useActiveSeries } from '@/store';
import {
  CapStyle,
  BottleMaterial,
  CAP_STYLE_NAMES,
  MATERIAL_NAMES,
} from '@/types/bottle';
import { CheckSquare, Square, Edit3 } from 'lucide-react';

export default function BatchEditor() {
  const {
    activeSeriesId,
    batchUpdateBottlesInSeries,
  } = useStore();

  const activeSeries = useActiveSeries();
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  // Batch edit values (null = no change)
  const [batchMaterial, setBatchMaterial] = useState<BottleMaterial | ''>('');
  const [batchCapStyle, setBatchCapStyle] = useState<CapStyle | ''>('');
  const [batchBodyColor, setBatchBodyColor] = useState<string>('');
  const [batchCapColor, setBatchCapColor] = useState<string>('');

  if (!activeSeries || !activeSeriesId) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        <p>Select a series to batch edit bottles</p>
      </div>
    );
  }

  const toggleSelection = (index: number) => {
    setSelectedIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIndices(new Set(activeSeries.bottles.map((_, i) => i)));
  };

  const clearSelection = () => {
    setSelectedIndices(new Set());
  };

  const applyBatchEdit = () => {
    if (selectedIndices.size === 0) return;

    const updates: Record<string, unknown> = {};
    if (batchMaterial) updates.material = batchMaterial;
    if (batchCapStyle) updates.capStyle = batchCapStyle;
    if (batchBodyColor) updates.bodyColor = batchBodyColor;
    if (batchCapColor) updates.capColor = batchCapColor;

    if (Object.keys(updates).length > 0) {
      batchUpdateBottlesInSeries(
        activeSeriesId,
        Array.from(selectedIndices),
        updates
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Edit3 className="w-4 h-4" />
          Batch Edit
        </h3>
        <div className="flex gap-2 text-xs">
          <button onClick={selectAll} className="text-blue-600 hover:text-blue-700">
            Select All
          </button>
          <span className="text-gray-300">|</span>
          <button onClick={clearSelection} className="text-gray-500 hover:text-gray-700">
            Clear
          </button>
        </div>
      </div>

      {/* Bottle selection */}
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {activeSeries.bottles.map((bottle, index) => (
          <label
            key={bottle.id}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm
              ${selectedIndices.has(index)
                ? 'bg-blue-50 border border-blue-200'
                : 'hover:bg-gray-50 border border-transparent'
              }
            `}
          >
            {selectedIndices.has(index) ? (
              <CheckSquare className="w-4 h-4 text-blue-500" onClick={() => toggleSelection(index)} />
            ) : (
              <Square className="w-4 h-4 text-gray-400" onClick={() => toggleSelection(index)} />
            )}
            <input
              type="checkbox"
              checked={selectedIndices.has(index)}
              onChange={() => toggleSelection(index)}
              className="sr-only"
            />
            <span className="font-medium">{bottle.name}</span>
            <span className="text-gray-400 ml-auto">{bottle.volume.toFixed(0)} mL</span>
          </label>
        ))}
      </div>

      {/* Batch edit controls */}
      {selectedIndices.size > 0 && (
        <div className="space-y-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            {selectedIndices.size} bottle{selectedIndices.size > 1 ? 's' : ''} selected
          </p>

          {/* Material */}
          <div>
            <label className="text-xs text-gray-600 font-medium">Material</label>
            <select
              value={batchMaterial}
              onChange={(e) => setBatchMaterial(e.target.value as BottleMaterial | '')}
              className="input text-sm"
            >
              <option value="">— No change —</option>
              {(Object.keys(MATERIAL_NAMES) as BottleMaterial[]).map((mat) => (
                <option key={mat} value={mat}>{MATERIAL_NAMES[mat]}</option>
              ))}
            </select>
          </div>

          {/* Cap Style */}
          <div>
            <label className="text-xs text-gray-600 font-medium">Cap Style</label>
            <select
              value={batchCapStyle}
              onChange={(e) => setBatchCapStyle(e.target.value as CapStyle | '')}
              className="input text-sm"
            >
              <option value="">— No change —</option>
              {(Object.keys(CAP_STYLE_NAMES) as CapStyle[]).map((style) => (
                <option key={style} value={style}>{CAP_STYLE_NAMES[style]}</option>
              ))}
            </select>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 font-medium">Body Color</label>
              <input
                type="color"
                value={batchBodyColor || '#FFFFFF'}
                onChange={(e) => setBatchBodyColor(e.target.value)}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium">Cap Color</label>
              <input
                type="color"
                value={batchCapColor || '#FFFFFF'}
                onChange={(e) => setBatchCapColor(e.target.value)}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Apply button */}
          <button
            onClick={applyBatchEdit}
            className="btn btn-primary w-full text-sm"
          >
            Apply to {selectedIndices.size} Bottle{selectedIndices.size > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}
