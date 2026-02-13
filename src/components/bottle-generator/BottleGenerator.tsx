/**
 * Bottle Generator Component
 * Main control panel for creating and editing bottles
 */

import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import { 
  BottleShape, 
  CapStyle, 
  BottleMaterial,
  SHAPE_NAMES, 
  CAP_STYLE_NAMES,
  MATERIAL_NAMES,
  DEFAULT_DIMENSIONS 
} from '@/types';
import { Plus, Copy, Trash2, RotateCcw } from 'lucide-react';

export default function BottleGenerator() {
  const { 
    bottles, 
    activeBottleId, 
    updateBottle, 
    deleteBottle,
    duplicateBottle,
    setActiveBottle,
    createBottleFromShape
  } = useStore();
  
  const activeBottle = activeBottleId ? bottles[activeBottleId] : null;
  
  // Local state for form
  const [localDims, setLocalDims] = useState(activeBottle?.dimensions || DEFAULT_DIMENSIONS['boston-round']);
  
  // Sync local state with active bottle
  useEffect(() => {
    if (activeBottle) {
      setLocalDims(activeBottle.dimensions);
    }
  }, [activeBottle?.id]);
  
  // Handle dimension change with debounce
  const handleDimensionChange = (key: string, value: number) => {
    const newDims = { ...localDims, [key]: value };
    setLocalDims(newDims);
    
    if (activeBottle) {
      updateBottle(activeBottle.id, { 
        dimensions: newDims 
      });
    }
  };
  
  // Handle shape change
  const handleShapeChange = (shape: BottleShape) => {
    if (activeBottle) {
      const newDims = { ...DEFAULT_DIMENSIONS[shape], ...localDims };
      updateBottle(activeBottle.id, { 
        shape,
        dimensions: newDims
      });
    }
  };
  
  // Create new bottle
  const handleCreateBottle = () => {
    const id = createBottleFromShape('boston-round');
    setActiveBottle(id);
  };
  
  // Reset to defaults
  const handleReset = () => {
    if (activeBottle) {
      const defaults = DEFAULT_DIMENSIONS[activeBottle.shape];
      updateBottle(activeBottle.id, { dimensions: defaults });
      setLocalDims(defaults);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Bottle Generator</h2>
        <button
          onClick={handleCreateBottle}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Bottle
        </button>
      </div>
      
      {activeBottle ? (
        <>
          {/* Bottle Name */}
          <div>
            <label className="label">Bottle Name</label>
            <input
              type="text"
              value={activeBottle.name}
              onChange={(e) => updateBottle(activeBottle.id, { name: e.target.value })}
              className="input"
            />
          </div>
          
          {/* Shape Selection */}
          <div>
            <label className="label">Shape</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(SHAPE_NAMES) as BottleShape[]).map((shape) => (
                <button
                  key={shape}
                  onClick={() => handleShapeChange(shape)}
                  className={`
                    px-3 py-2 text-sm rounded-lg border transition-colors
                    ${activeBottle.shape === shape 
                      ? 'border-primary-500 bg-primary-50 text-primary-700' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  {SHAPE_NAMES[shape]}
                </button>
              ))}
            </div>
          </div>
          
          {/* Dimensions */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Dimensions (mm)</h3>
            
            <DimensionSlider
              label="Total Height"
              value={localDims.height}
              min={30}
              max={300}
              onChange={(v) => handleDimensionChange('height', v)}
            />
            
            <DimensionSlider
              label="Body Height"
              value={localDims.bodyHeight}
              min={20}
              max={280}
              onChange={(v) => handleDimensionChange('bodyHeight', v)}
            />
            
            <DimensionSlider
              label="Diameter"
              value={localDims.diameter}
              min={20}
              max={150}
              onChange={(v) => handleDimensionChange('diameter', v)}
            />
            
            <DimensionSlider
              label="Neck Height"
              value={localDims.neckHeight}
              min={5}
              max={50}
              onChange={(v) => handleDimensionChange('neckHeight', v)}
            />
            
            <DimensionSlider
              label="Neck Diameter"
              value={localDims.neckDiameter}
              min={10}
              max={80}
              onChange={(v) => handleDimensionChange('neckDiameter', v)}
            />
            
            <DimensionSlider
              label="Shoulder Curve"
              value={localDims.shoulderCurveRadius}
              min={0}
              max={50}
              onChange={(v) => handleDimensionChange('shoulderCurveRadius', v)}
            />
            
            <DimensionSlider
              label="Wall Thickness"
              value={localDims.wallThickness}
              min={0.5}
              max={5}
              step={0.1}
              onChange={(v) => handleDimensionChange('wallThickness', v)}
            />
          </div>
          
          {/* Cap Style */}
          <div>
            <label className="label">Cap Style</label>
            <select
              value={activeBottle.capStyle}
              onChange={(e) => updateBottle(activeBottle.id, { capStyle: e.target.value as CapStyle })}
              className="input"
            >
              {(Object.keys(CAP_STYLE_NAMES) as CapStyle[]).map((style) => (
                <option key={style} value={style}>
                  {CAP_STYLE_NAMES[style]}
                </option>
              ))}
            </select>
          </div>
          
          {/* Material */}
          <div>
            <label className="label">Material</label>
            <select
              value={activeBottle.material}
              onChange={(e) => updateBottle(activeBottle.id, { material: e.target.value as BottleMaterial })}
              className="input"
            >
              {(Object.keys(MATERIAL_NAMES) as BottleMaterial[]).map((mat) => (
                <option key={mat} value={mat}>
                  {MATERIAL_NAMES[mat]}
                </option>
              ))}
            </select>
          </div>
          
          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Body Color</label>
              <input
                type="color"
                value={activeBottle.bodyColor}
                onChange={(e) => updateBottle(activeBottle.id, { bodyColor: e.target.value })}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="label">Cap Color</label>
              <input
                type="color"
                value={activeBottle.capColor}
                onChange={(e) => updateBottle(activeBottle.id, { capColor: e.target.value })}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
          </div>
          
          {/* Opacity */}
          <div>
            <label className="label">Opacity</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={activeBottle.opacity}
              onChange={(e) => updateBottle(activeBottle.id, { opacity: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="text-sm text-gray-500 text-right">{Math.round(activeBottle.opacity * 100)}%</div>
          </div>
          
          {/* Volume Display */}
          <div className="bg-primary-50 rounded-lg p-4">
            <div className="text-sm text-primary-600 font-medium">Calculated Volume</div>
            <div className="text-3xl font-bold text-primary-700">
              {activeBottle.volume.toFixed(1)} <span className="text-lg">ml</span>
            </div>
            <div className="text-sm text-primary-500 mt-1">
              Surface Area: {activeBottle.surfaceArea.toFixed(1)} cm²
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => duplicateBottle(activeBottle.id)}
              className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>
            <button
              onClick={handleReset}
              className="btn btn-secondary flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                deleteBottle(activeBottle.id);
                setActiveBottle(null);
              }}
              className="btn btn-ghost text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>No bottle selected</p>
          <p className="text-sm mt-2">Create a new bottle or select one from the library</p>
        </div>
      )}
    </div>
  );
}

// Dimension slider component
interface DimensionSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

function DimensionSlider({ label, value, min, max, step = 1, onChange }: DimensionSliderProps) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-mono text-gray-900">{value.toFixed(step < 1 ? 1 : 0)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
