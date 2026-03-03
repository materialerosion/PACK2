/**
 * Fill Results Panel
 * Displays simulation results after completion.
 */

import { useFillSimulation } from '@/store';
import { CheckCircle, BarChart3, Clock } from 'lucide-react';

export default function FillResultsPanel() {
  const fillSim = useFillSimulation();
  const { results } = fillSim;
  
  if (!results) return null;
  
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
        Results
      </h4>
      
      {/* Main result */}
      <div className="bg-green-50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">Simulation Complete</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-green-600">Fit Inside</div>
            <div className="text-xl font-bold text-green-800">
              {results.actualQuantity} <span className="text-sm font-normal">/ {results.targetQuantity}</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-red-500">Overflow</div>
            <div className="text-xl font-bold text-red-600">
              {results.overflow}
            </div>
          </div>
        </div>
      </div>
      
      {/* Efficiency */}
      <div className="bg-blue-50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Fill Efficiency</span>
        </div>
        <div className="text-2xl font-bold text-blue-700">
          {results.fillEfficiency.toFixed(1)}%
        </div>
        <div className="text-xs text-blue-500 mt-1">
          Product volume / Bottle internal volume
        </div>
      </div>
      
      {/* Details */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Bottle Volume</span>
          <span className="font-medium">{results.bottleVolume.toFixed(1)} mL</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Product Volume (each)</span>
          <span className="font-medium">{results.productVolume.toFixed(1)} mm³</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Total Product Volume</span>
          <span className="font-medium">{(results.totalProductVolume / 1000).toFixed(1)} mL</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Sim Time
          </span>
          <span className="font-medium">{results.simulationTime.toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
}
