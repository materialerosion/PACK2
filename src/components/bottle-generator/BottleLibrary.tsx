/**
 * Bottle Library Component
 * Displays all created bottles in a horizontal scrollable list
 */

import React from 'react';
import { useStore } from '@/store';
import { Bottle } from '@/types';
import { Plus } from 'lucide-react';

export default function BottleLibrary() {
  const { bottles, activeBottleId, setActiveBottle, createBottleFromShape } = useStore();
  
  const bottleList = Object.values(bottles);
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">Bottle Library ({bottleList.length})</h3>
        <button
          onClick={() => createBottleFromShape('boston-round')}
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
      
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-3 h-full pb-2">
          {bottleList.length === 0 ? (
            <div className="flex items-center justify-center w-full text-gray-400 text-sm">
              No bottles yet. Create one to get started.
            </div>
          ) : (
            bottleList.map((bottle) => (
              <BottleCard
                key={bottle.id}
                bottle={bottle}
                isSelected={bottle.id === activeBottleId}
                onClick={() => setActiveBottle(bottle.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface BottleCardProps {
  bottle: Bottle;
  isSelected: boolean;
  onClick: () => void;
}

function BottleCard({ bottle, isSelected, onClick }: BottleCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-shrink-0 w-24 h-full rounded-lg border-2 p-2
        flex flex-col items-center justify-center gap-1
        transition-all duration-200 hover:shadow-md
        ${isSelected 
          ? 'border-primary-500 bg-primary-50' 
          : 'border-gray-200 bg-white hover:border-gray-300'
        }
      `}
    >
      {/* Mini bottle visualization */}
      <div 
        className="w-8 h-16 rounded-t-lg relative"
        style={{ backgroundColor: bottle.bodyColor }}
      >
        {/* Cap */}
        <div 
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-3 rounded-t"
          style={{ backgroundColor: bottle.capColor }}
        />
      </div>
      
      {/* Info */}
      <div className="text-center">
        <div className="text-xs font-medium text-gray-900 truncate w-20">
          {bottle.name}
        </div>
        <div className="text-xs text-gray-500">
          {bottle.volume.toFixed(0)} ml
        </div>
      </div>
    </button>
  );
}
