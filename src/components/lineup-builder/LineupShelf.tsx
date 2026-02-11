/**
 * Lineup Shelf Component
 * Drag and drop interface for arranging bottles on shelf
 */

import React from 'react';
import { useStore } from '@/store';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bottle } from '@/types';
import { Plus, X } from 'lucide-react';

export default function LineupShelf() {
  const { 
    lineups, 
    activeLineupId, 
    bottles,
    getBottlesForLineup,
    addBottleToLineup,
    removeBottleFromLineup,
    reorderLineup
  } = useStore();
  
  const activeLineup = activeLineupId ? lineups[activeLineupId] : null;
  const lineupBottles = activeLineupId ? getBottlesForLineup(activeLineupId) : [];
  const availableBottles = Object.values(bottles).filter(
    b => !lineupBottles.find(lb => lb.id === b.id)
  );
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id && activeLineup) {
      const oldIndex = activeLineup.positions.findIndex(p => p.bottleId === active.id);
      const newIndex = activeLineup.positions.findIndex(p => p.bottleId === over.id);
      
      const newPositions = arrayMove(activeLineup.positions, oldIndex, newIndex);
      reorderLineup(activeLineup.id, newPositions);
    }
  };
  
  if (!activeLineup) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Select or create a lineup to start arranging bottles
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">
          {activeLineup.name} - Shelf View
        </h3>
        <div className="text-xs text-gray-500">
          Drag bottles to reorder
        </div>
      </div>
      
      <div className="flex-1 flex gap-4">
        {/* Lineup shelf */}
        <div className="flex-1 bg-gradient-to-b from-amber-100 to-amber-200 rounded-lg p-3 overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={activeLineup.positions.map(p => p.bottleId)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex gap-3 h-full items-end min-w-max">
                {lineupBottles.length === 0 ? (
                  <div className="flex items-center justify-center w-full text-amber-600 text-sm">
                    Add bottles from the library →
                  </div>
                ) : (
                  lineupBottles.map((bottle) => (
                    <SortableBottle
                      key={bottle.id}
                      bottle={bottle}
                      onRemove={() => removeBottleFromLineup(activeLineup.id, bottle.id)}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
        
        {/* Available bottles */}
        <div className="w-48 bg-gray-50 rounded-lg p-3 overflow-y-auto">
          <div className="text-xs font-medium text-gray-500 mb-2">Available Bottles</div>
          <div className="space-y-2">
            {availableBottles.length === 0 ? (
              <div className="text-xs text-gray-400 text-center py-4">
                All bottles are in the lineup
              </div>
            ) : (
              availableBottles.map((bottle) => (
                <button
                  key={bottle.id}
                  onClick={() => addBottleToLineup(activeLineup.id, bottle.id)}
                  className="w-full flex items-center gap-2 p-2 bg-white rounded border border-gray-200 hover:border-primary-300 transition-colors"
                >
                  <div 
                    className="w-4 h-8 rounded-t"
                    style={{ backgroundColor: bottle.bodyColor }}
                  />
                  <div className="flex-1 text-left">
                    <div className="text-xs font-medium truncate">{bottle.name}</div>
                    <div className="text-xs text-gray-500">{bottle.volume.toFixed(0)} ml</div>
                  </div>
                  <Plus className="w-4 h-4 text-gray-400" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SortableBottleProps {
  bottle: Bottle;
  onRemove: () => void;
}

function SortableBottle({ bottle, onRemove }: SortableBottleProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bottle.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  // Scale height based on bottle dimensions (normalized)
  const heightScale = Math.min(bottle.dimensions.height / 150, 1);
  const widthScale = Math.min(bottle.dimensions.diameter / 60, 1);
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group cursor-grab active:cursor-grabbing"
    >
      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
      >
        <X className="w-3 h-3" />
      </button>
      
      {/* Bottle visualization */}
      <div className="flex flex-col items-center">
        {/* Cap */}
        <div 
          className="rounded-t"
          style={{ 
            backgroundColor: bottle.capColor,
            width: `${20 * widthScale}px`,
            height: '8px'
          }}
        />
        {/* Body */}
        <div 
          className="rounded-b shadow-md"
          style={{ 
            backgroundColor: bottle.bodyColor,
            width: `${40 * widthScale}px`,
            height: `${80 * heightScale}px`,
            minHeight: '40px'
          }}
        />
        {/* Label */}
        <div className="mt-1 text-center">
          <div className="text-xs font-medium text-gray-700 truncate max-w-16">
            {bottle.volume.toFixed(0)}ml
          </div>
        </div>
      </div>
    </div>
  );
}
