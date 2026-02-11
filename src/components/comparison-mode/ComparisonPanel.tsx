/**
 * Comparison Panel Component
 * Side-by-side lineup comparison with ratings
 */

import React, { useState } from 'react';
import { useStore } from '@/store';
import { Plus, X, Star } from 'lucide-react';

export default function ComparisonPanel() {
  const { 
    lineups, 
    comparisons,
    activeComparisonId,
    createComparison,
    updateComparison,
    deleteComparison,
    setActiveComparison,
    getBottlesForLineup
  } = useStore();
  
  const [newComparisonName, setNewComparisonName] = useState('');
  const [selectedLineups, setSelectedLineups] = useState<string[]>([]);
  
  const activeComparison = activeComparisonId ? comparisons[activeComparisonId] : null;
  const lineupList = Object.values(lineups);
  
  const handleCreateComparison = () => {
    if (newComparisonName && selectedLineups.length >= 2) {
      const id = createComparison(newComparisonName, selectedLineups);
      setNewComparisonName('');
      setSelectedLineups([]);
    }
  };
  
  const toggleLineupSelection = (lineupId: string) => {
    setSelectedLineups(prev => 
      prev.includes(lineupId)
        ? prev.filter(id => id !== lineupId)
        : [...prev, lineupId]
    );
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Compare Lineups</h2>
      
      {/* Create new comparison */}
      <div className="space-y-3">
        <input
          type="text"
          value={newComparisonName}
          onChange={(e) => setNewComparisonName(e.target.value)}
          placeholder="Comparison name..."
          className="input"
        />
        
        <div className="text-sm text-gray-600 mb-2">Select lineups to compare:</div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {lineupList.map((lineup) => (
            <label
              key={lineup.id}
              className={`
                flex items-center gap-2 p-2 rounded-lg border cursor-pointer
                ${selectedLineups.includes(lineup.id) 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <input
                type="checkbox"
                checked={selectedLineups.includes(lineup.id)}
                onChange={() => toggleLineupSelection(lineup.id)}
                className="rounded"
              />
              <span className="text-sm">{lineup.name}</span>
              <span className="text-xs text-gray-500">({lineup.positions.length} bottles)</span>
            </label>
          ))}
        </div>
        
        <button
          onClick={handleCreateComparison}
          disabled={!newComparisonName || selectedLineups.length < 2}
          className="btn btn-primary w-full"
        >
          Create Comparison
        </button>
      </div>
      
      {/* Existing comparisons */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Saved Comparisons</h3>
        <div className="space-y-2">
          {Object.values(comparisons).map((comparison) => (
            <div
              key={comparison.id}
              className={`
                p-3 rounded-lg border cursor-pointer
                ${activeComparisonId === comparison.id 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => setActiveComparison(comparison.id)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{comparison.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteComparison(comparison.id);
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {comparison.lineupIds.length} lineups compared
              </div>
            </div>
          ))}
          
          {Object.keys(comparisons).length === 0 && (
            <div className="text-sm text-gray-400 text-center py-4">
              No comparisons yet
            </div>
          )}
        </div>
      </div>
      
      {/* Active comparison details */}
      {activeComparison && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Comparison Details</h3>
          
          {activeComparison.lineupIds.map((lineupId) => {
            const lineup = lineups[lineupId];
            if (!lineup) return null;
            
            const bottles = getBottlesForLineup(lineupId);
            const totalVolume = bottles.reduce((sum, b) => sum + b.volume, 0);
            
            return (
              <div key={lineupId} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{lineup.name}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= lineup.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Bottles:</span>
                    <span className="ml-1 font-medium">{bottles.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Volume:</span>
                    <span className="ml-1 font-medium">{totalVolume.toFixed(0)} ml</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Shelf Width:</span>
                    <span className="ml-1 font-medium">{lineup.shelfWidth} mm</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Algorithm:</span>
                    <span className="ml-1 font-medium">{lineup.settings.sortAlgorithm}</span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Notes */}
          <div>
            <label className="label">Comparison Notes</label>
            <textarea
              value={activeComparison.notes}
              onChange={(e) => updateComparison(activeComparison.id, { notes: e.target.value })}
              className="input h-24 resize-none"
              placeholder="Add notes about this comparison..."
            />
          </div>
        </div>
      )}
    </div>
  );
}
