/**
 * Lineup Controls Component
 * Controls for lineup builder - sorting, spacing, algorithms
 */

import React from 'react';
import { useStore } from '@/store';
import { 
  SortAlgorithm, 
  SortDirection,
  ALGORITHM_NAMES,
  ALGORITHM_DESCRIPTIONS,
  DEFAULT_LINEUP_SETTINGS
} from '@/types';
import { LineupAlgorithms } from '@/services/lineupAlgorithms';
import { Plus, ArrowUpDown, Trash2, Save } from 'lucide-react';

export default function LineupControls() {
  const { 
    lineups, 
    activeLineupId, 
    bottles,
    createLineup, 
    updateLineup,
    updateLineupSettings,
    deleteLineup,
    setActiveLineup,
    getBottlesForLineup,
    reorderLineup
  } = useStore();
  
  const activeLineup = activeLineupId ? lineups[activeLineupId] : null;
  const lineupBottles = activeLineupId ? getBottlesForLineup(activeLineupId) : [];
  
  // Create new lineup
  const handleCreateLineup = () => {
    const id = createLineup('New Lineup');
    setActiveLineup(id);
  };
  
  // Apply sorting algorithm
  const handleApplySort = () => {
    if (!activeLineup || lineupBottles.length === 0) return;
    
    const newPositions = LineupAlgorithms.generatePositions(
      lineupBottles,
      activeLineup.settings,
      activeLineup.shelfWidth
    );
    
    reorderLineup(activeLineup.id, newPositions);
  };
  
  // Calculate scores
  const harmonyScore = activeLineup && lineupBottles.length > 1
    ? LineupAlgorithms.calculateHarmonyScore(lineupBottles, activeLineup.positions)
    : 0;
  
  const shelfPresenceScore = activeLineup && lineupBottles.length > 0
    ? LineupAlgorithms.calculateShelfPresenceScore(lineupBottles, activeLineup.positions, activeLineup.shelfWidth)
    : 0;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Lineup Builder</h2>
        <button
          onClick={handleCreateLineup}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Lineup
        </button>
      </div>
      
      {/* Lineup selector */}
      <div>
        <label className="label">Select Lineup</label>
        <select
          value={activeLineupId || ''}
          onChange={(e) => setActiveLineup(e.target.value || null)}
          className="input"
        >
          <option value="">-- Select a lineup --</option>
          {Object.values(lineups).map((lineup) => (
            <option key={lineup.id} value={lineup.id}>
              {lineup.name} ({lineup.positions.length} bottles)
            </option>
          ))}
        </select>
      </div>
      
      {activeLineup ? (
        <>
          {/* Lineup name */}
          <div>
            <label className="label">Lineup Name</label>
            <input
              type="text"
              value={activeLineup.name}
              onChange={(e) => updateLineup(activeLineup.id, { name: e.target.value })}
              className="input"
            />
          </div>
          
          {/* Sorting Algorithm */}
          <div>
            <label className="label">Sorting Algorithm</label>
            <div className="space-y-2">
              {(Object.keys(ALGORITHM_NAMES) as SortAlgorithm[]).map((algo) => (
                <button
                  key={algo}
                  onClick={() => updateLineupSettings(activeLineup.id, { sortAlgorithm: algo })}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg border transition-colors
                    ${activeLineup.settings.sortAlgorithm === algo 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="font-medium text-sm">{ALGORITHM_NAMES[algo]}</div>
                  <div className="text-xs text-gray-500">{ALGORITHM_DESCRIPTIONS[algo]}</div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Sort Direction */}
          <div>
            <label className="label">Sort Direction</label>
            <div className="flex gap-2">
              <button
                onClick={() => updateLineupSettings(activeLineup.id, { sortDirection: 'ascending' })}
                className={`
                  flex-1 px-3 py-2 rounded-lg border text-sm
                  ${activeLineup.settings.sortDirection === 'ascending' 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                Ascending ↑
              </button>
              <button
                onClick={() => updateLineupSettings(activeLineup.id, { sortDirection: 'descending' })}
                className={`
                  flex-1 px-3 py-2 rounded-lg border text-sm
                  ${activeLineup.settings.sortDirection === 'descending' 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                Descending ↓
              </button>
            </div>
          </div>
          
          {/* Spacing */}
          <div>
            <label className="label">Bottle Spacing: {activeLineup.settings.spacing}mm</label>
            <input
              type="range"
              min={5}
              max={100}
              value={activeLineup.settings.spacing}
              onChange={(e) => updateLineupSettings(activeLineup.id, { spacing: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          
          {/* Shelf Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Shelf Width (mm)</label>
              <input
                type="number"
                value={activeLineup.shelfWidth}
                onChange={(e) => updateLineup(activeLineup.id, { shelfWidth: parseInt(e.target.value) })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Shelf Depth (mm)</label>
              <input
                type="number"
                value={activeLineup.shelfDepth}
                onChange={(e) => updateLineup(activeLineup.id, { shelfDepth: parseInt(e.target.value) })}
                className="input"
              />
            </div>
          </div>
          
          {/* Apply Sort Button */}
          <button
            onClick={handleApplySort}
            disabled={lineupBottles.length === 0}
            className="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            <ArrowUpDown className="w-4 h-4" />
            Apply Sorting
          </button>
          
          {/* Scores */}
          {lineupBottles.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-xs text-green-600 font-medium">Visual Harmony</div>
                <div className="text-2xl font-bold text-green-700">{harmonyScore}/10</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-blue-600 font-medium">Shelf Presence</div>
                <div className="text-2xl font-bold text-blue-700">{shelfPresenceScore}/10</div>
              </div>
            </div>
          )}
          
          {/* Rating */}
          <div>
            <label className="label">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => updateLineup(activeLineup.id, { rating: star })}
                  className={`text-2xl ${
                    star <= activeLineup.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          
          {/* Notes */}
          <div>
            <label className="label">Notes</label>
            <textarea
              value={activeLineup.notes}
              onChange={(e) => updateLineup(activeLineup.id, { notes: e.target.value })}
              className="input h-24 resize-none"
              placeholder="Add notes about this lineup..."
            />
          </div>
          
          {/* Bottle count */}
          <div className="text-sm text-gray-500">
            {lineupBottles.length} bottles in lineup
          </div>
          
          {/* Delete */}
          <button
            onClick={() => {
              deleteLineup(activeLineup.id);
              setActiveLineup(null);
            }}
            className="btn btn-ghost text-red-600 hover:bg-red-50 w-full flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Lineup
          </button>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>No lineup selected</p>
          <p className="text-sm mt-2">Create a new lineup or select an existing one</p>
        </div>
      )}
    </div>
  );
}
