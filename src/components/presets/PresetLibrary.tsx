/**
 * Preset Library Component
 * Browse and apply preset templates for OTC categories
 */

import { useState } from 'react';
import { useStore } from '@/store';
import { 
  OTCCategory, 
  CATEGORY_NAMES, 
  CATEGORY_COLORS,
  PresetTemplate 
} from '@/types';
import { presetTemplates } from '@/data/presets';

export default function PresetLibrary() {
  const { createBottleFromShape, createLineup, addBottleToLineup, setActiveLineup } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<OTCCategory | null>(null);
  const [volumeRange, setVolumeRange] = useState({ min: 30, max: 500 });
  const [bottleCount, setBottleCount] = useState(5);
  
  const categories = Object.keys(CATEGORY_NAMES) as OTCCategory[];
  
  const filteredPresets = selectedCategory
    ? presetTemplates.filter(p => p.category === selectedCategory)
    : presetTemplates;
  
  const handleApplyPreset = (preset: PresetTemplate) => {
    // Create a new lineup
    const lineupId = createLineup(`${preset.name} Lineup`, preset.category);
    
    // Generate bottles based on preset
    const volumes = preset.suggestedVolumes.slice(0, bottleCount);
    
    volumes.forEach((volume) => {
      const bottleId = createBottleFromShape(preset.defaultShape, volume);
      addBottleToLineup(lineupId, bottleId);
    });
    
    setActiveLineup(lineupId);
  };
  
  const handleGenerateCustom = () => {
    if (!selectedCategory) return;
    
    const preset = presetTemplates.find(p => p.category === selectedCategory);
    if (!preset) return;
    
    // Create lineup
    const lineupId = createLineup(`Custom ${CATEGORY_NAMES[selectedCategory]} Lineup`, selectedCategory);
    
    // Generate bottles with custom volume range
    const step = (volumeRange.max - volumeRange.min) / (bottleCount - 1);
    
    for (let i = 0; i < bottleCount; i++) {
      const volume = Math.round(volumeRange.min + step * i);
      const bottleId = createBottleFromShape(preset.defaultShape, volume);
      addBottleToLineup(lineupId, bottleId);
    }
    
    setActiveLineup(lineupId);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Preset Templates</h2>
      
      {/* Category filter */}
      <div>
        <label className="label">Category</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`
              px-3 py-1.5 text-sm rounded-full border transition-colors
              ${!selectedCategory 
                ? 'border-primary-500 bg-primary-50 text-primary-700' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            All
          </button>
          {categories.filter(c => c !== 'custom').map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-3 py-1.5 text-sm rounded-full border transition-colors
                ${selectedCategory === category 
                  ? 'border-primary-500 bg-primary-50 text-primary-700' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              style={{
                borderColor: selectedCategory === category ? CATEGORY_COLORS[category] : undefined,
                backgroundColor: selectedCategory === category ? `${CATEGORY_COLORS[category]}20` : undefined,
              }}
            >
              {CATEGORY_NAMES[category]}
            </button>
          ))}
        </div>
      </div>
      
      {/* Preset list */}
      <div className="space-y-2">
        {filteredPresets.map((preset) => (
          <div
            key={preset.id}
            className="p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium text-gray-900">{preset.name}</div>
                <div className="text-sm text-gray-500 mt-1">{preset.description}</div>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>Shape: {preset.defaultShape}</span>
                  <span>Range: {preset.volumeRange.min}-{preset.volumeRange.max}ml</span>
                </div>
                <div className="flex gap-1 mt-2">
                  {preset.suggestedVolumes.slice(0, 6).map((vol) => (
                    <span
                      key={vol}
                      className="px-2 py-0.5 bg-gray-100 rounded text-xs"
                    >
                      {vol}ml
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => handleApplyPreset(preset)}
                className="btn btn-primary text-sm"
              >
                Apply
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Custom range generator */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h3 className="font-medium text-gray-900">Custom Volume Range</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Min Volume (ml)</label>
            <input
              type="number"
              value={volumeRange.min}
              onChange={(e) => setVolumeRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
              className="input"
              min={15}
              max={volumeRange.max - 10}
            />
          </div>
          <div>
            <label className="label">Max Volume (ml)</label>
            <input
              type="number"
              value={volumeRange.max}
              onChange={(e) => setVolumeRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
              className="input"
              min={volumeRange.min + 10}
              max={1000}
            />
          </div>
        </div>
        
        <div>
          <label className="label">Number of Bottles: {bottleCount}</label>
          <input
            type="range"
            value={bottleCount}
            onChange={(e) => setBottleCount(parseInt(e.target.value))}
            className="w-full"
            min={2}
            max={10}
          />
        </div>
        
        <button
          onClick={handleGenerateCustom}
          disabled={!selectedCategory}
          className="btn btn-primary w-full"
        >
          Generate Custom Lineup
        </button>
        
        {!selectedCategory && (
          <p className="text-xs text-gray-500 text-center">
            Select a category first to generate custom lineup
          </p>
        )}
      </div>
    </div>
  );
}
