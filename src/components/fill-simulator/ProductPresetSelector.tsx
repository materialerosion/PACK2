/**
 * Product Preset Selector
 * Dropdown/card selector for choosing product presets with custom option.
 */

import { useState } from 'react';
import { Product, PRODUCT_SHAPE_NAMES } from '@/types/product';
import { PRODUCT_PRESETS, createProduct, calculateProductVolume } from '@/data/presets/products';
import { useStore, useFillSimulation } from '@/store';
import { ChevronUp } from 'lucide-react';

export default function ProductPresetSelector() {
  const { setFillProduct } = useStore();
  const fillSim = useFillSimulation();
  const [showCustom, setShowCustom] = useState(false);
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number | null>(null);
  
  // Custom product state
  const [customName, setCustomName] = useState('Custom Product');
  const [customShape, setCustomShape] = useState<Product['shape']>('round-tablet');
  const [customLength, setCustomLength] = useState(10);
  const [customWidth, setCustomWidth] = useState(10);
  const [customHeight, setCustomHeight] = useState(4);
  const [customMass, setCustomMass] = useState(0.5);
  const [customColor, setCustomColor] = useState('#FFFFFF');
  
  const handlePresetSelect = (index: number) => {
    setSelectedPresetIdx(index);
    setShowCustom(false);
    const preset = PRODUCT_PRESETS[index];
    setFillProduct({
      ...preset,
      dimensions: { ...preset.dimensions },
    });
  };
  
  const handleCustomApply = () => {
    const product = createProduct(
      customName,
      customShape,
      customLength,
      customWidth,
      customHeight,
      customMass,
      customColor
    );
    setFillProduct(product);
    setSelectedPresetIdx(null);
  };
  
  return (
    <div className="space-y-3">
      <label className="text-xs text-gray-600 font-medium">Product Type</label>
      
      {/* Preset selector */}
      <select
        value={selectedPresetIdx ?? ''}
        onChange={(e) => {
          const val = e.target.value;
          if (val === 'custom') {
            setShowCustom(true);
            setSelectedPresetIdx(null);
          } else {
            handlePresetSelect(parseInt(val));
          }
        }}
        className="input text-sm w-full"
      >
        <option value="" disabled>Select a product...</option>
        {PRODUCT_PRESETS.map((preset, idx) => (
          <option key={preset.id} value={idx}>
            {preset.name} ({PRODUCT_SHAPE_NAMES[preset.shape]})
          </option>
        ))}
        <option value="custom">── Custom Product ──</option>
      </select>
      
      {/* Selected product info */}
      {fillSim.fillProduct && !showCustom && (
        <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
          <div className="font-medium text-gray-900">{fillSim.fillProduct.name}</div>
          <div className="text-gray-500">
            {fillSim.fillProduct.dimensions.length} × {fillSim.fillProduct.dimensions.width} × {fillSim.fillProduct.dimensions.height} mm
          </div>
          <div className="text-gray-500">
            Mass: {fillSim.fillProduct.mass}g · Vol: {fillSim.fillProduct.volume.toFixed(1)} mm³
          </div>
        </div>
      )}
      
      {/* Custom dimensions */}
      {showCustom && (
        <div className="space-y-2 bg-gray-50 rounded-lg p-3">
          <button
            onClick={() => setShowCustom(false)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <ChevronUp className="w-3 h-3" />
            Hide Custom
          </button>
          
          <div>
            <label className="text-xs text-gray-600">Name</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="input text-sm w-full"
            />
          </div>
          
          <div>
            <label className="text-xs text-gray-600">Shape</label>
            <select
              value={customShape}
              onChange={(e) => setCustomShape(e.target.value as Product['shape'])}
              className="input text-sm w-full"
            >
              {Object.entries(PRODUCT_SHAPE_NAMES).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-gray-600">Length (mm)</label>
              <input
                type="number"
                value={customLength}
                onChange={(e) => setCustomLength(parseFloat(e.target.value) || 0)}
                min={1}
                max={50}
                step={0.5}
                className="input text-sm w-full"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Width (mm)</label>
              <input
                type="number"
                value={customWidth}
                onChange={(e) => setCustomWidth(parseFloat(e.target.value) || 0)}
                min={1}
                max={50}
                step={0.5}
                className="input text-sm w-full"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Height (mm)</label>
              <input
                type="number"
                value={customHeight}
                onChange={(e) => setCustomHeight(parseFloat(e.target.value) || 0)}
                min={1}
                max={30}
                step={0.5}
                className="input text-sm w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600">Mass (g)</label>
              <input
                type="number"
                value={customMass}
                onChange={(e) => setCustomMass(parseFloat(e.target.value) || 0)}
                min={0.1}
                max={10}
                step={0.1}
                className="input text-sm w-full"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Color</label>
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            Volume: {calculateProductVolume(customShape, customLength, customWidth, customHeight).toFixed(1)} mm³
          </div>
          
          <button
            onClick={handleCustomApply}
            className="btn btn-primary w-full text-sm"
          >
            Apply Custom Product
          </button>
        </div>
      )}
    </div>
  );
}
