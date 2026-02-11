/**
 * Zustand Store
 * Central state management for the PACK2 application
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import { 
  Bottle, 
  BottleShape, 
  BottleDimensions, 
  CapStyle,
  Lineup, 
  LineupPosition, 
  LineupSettings,
  LineupComparison,
  UIState,
  AppSettings,
  AppTab,
  ViewMode,
  DEFAULT_DIMENSIONS,
  DEFAULT_LINEUP_SETTINGS,
  DEFAULT_SHELF_DIMENSIONS,
  OTCCategory
} from '@/types';
import { VolumeCalculator } from '@/services/volumeCalculator';

// Store state interface
interface AppState {
  // Bottles
  bottles: Record<string, Bottle>;
  activeBottleId: string | null;
  
  // Lineups
  lineups: Record<string, Lineup>;
  activeLineupId: string | null;
  
  // Comparisons
  comparisons: Record<string, LineupComparison>;
  activeComparisonId: string | null;
  
  // UI State
  ui: UIState;
  
  // Settings
  settings: AppSettings;
}

// Store actions interface
interface AppActions {
  // Bottle actions
  addBottle: (bottle: Partial<Bottle>) => string;
  updateBottle: (id: string, updates: Partial<Bottle>) => void;
  deleteBottle: (id: string) => void;
  duplicateBottle: (id: string) => string | null;
  setActiveBottle: (id: string | null) => void;
  createBottleFromShape: (shape: BottleShape, targetVolume?: number) => string;
  
  // Lineup actions
  createLineup: (name: string, category?: string) => string;
  updateLineup: (id: string, updates: Partial<Lineup>) => void;
  deleteLineup: (id: string) => void;
  addBottleToLineup: (lineupId: string, bottleId: string) => void;
  removeBottleFromLineup: (lineupId: string, bottleId: string) => void;
  reorderLineup: (lineupId: string, positions: LineupPosition[]) => void;
  updateLineupSettings: (lineupId: string, settings: Partial<LineupSettings>) => void;
  setActiveLineup: (id: string | null) => void;
  
  // Comparison actions
  createComparison: (name: string, lineupIds: string[]) => string;
  updateComparison: (id: string, updates: Partial<LineupComparison>) => void;
  deleteComparison: (id: string) => void;
  setActiveComparison: (id: string | null) => void;
  
  // UI actions
  toggleSidebar: () => void;
  setActiveTab: (tab: AppTab) => void;
  toggleGrid: () => void;
  toggleMeasurements: () => void;
  setViewMode: (mode: ViewMode) => void;
  selectBottle: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Settings actions
  updateSettings: (updates: Partial<AppSettings>) => void;
  
  // Utility actions
  getBottlesForLineup: (lineupId: string) => Bottle[];
  recalculateBottleVolume: (id: string) => void;
}

// Combined store type
type Store = AppState & AppActions;

// Initial state
const initialState: AppState = {
  bottles: {},
  activeBottleId: null,
  lineups: {},
  activeLineupId: null,
  comparisons: {},
  activeComparisonId: null,
  ui: {
    sidebarOpen: true,
    activeTab: 'generator',
    showGrid: true,
    showMeasurements: true,
    viewMode: '3d',
    selectedBottleIds: [],
    isLoading: false,
    error: null,
  },
  settings: {
    units: 'metric',
    defaultCategory: 'pain-relievers',
    autoSave: true,
    theme: 'light',
    showTooltips: true,
    animationsEnabled: true,
  },
};

// Create the store
export const useStore = create<Store>()(
  persist(
    immer((set, get) => ({
      ...initialState,
      
      // Bottle actions
      addBottle: (bottleData) => {
        const id = uuidv4();
        const now = new Date();
        
        const shape = bottleData.shape || 'boston-round';
        const defaultDims = DEFAULT_DIMENSIONS[shape];
        
        const dimensions: BottleDimensions = {
          ...defaultDims,
          ...bottleData.dimensions,
        } as BottleDimensions;
        
        const bottle: Bottle = {
          id,
          name: bottleData.name || `Bottle ${Object.keys(get().bottles).length + 1}`,
          shape,
          dimensions,
          capStyle: bottleData.capStyle || 'screw-cap',
          capColor: bottleData.capColor || '#FFFFFF',
          bodyColor: bottleData.bodyColor || '#FFFFFF',
          material: bottleData.material || 'HDPE',
          opacity: bottleData.opacity ?? 1,
          labelZones: bottleData.labelZones || [],
          volume: 0,
          surfaceArea: 0,
          createdAt: now,
          updatedAt: now,
          isCustom: true,
          presetId: bottleData.presetId,
        };
        
        // Calculate volume
        bottle.volume = VolumeCalculator.calculate(bottle);
        bottle.surfaceArea = VolumeCalculator.calculateSurfaceArea(bottle);
        
        set((state) => {
          state.bottles[id] = bottle;
        });
        
        return id;
      },
      
      updateBottle: (id, updates) => {
        set((state) => {
          if (state.bottles[id]) {
            Object.assign(state.bottles[id], updates);
            state.bottles[id].updatedAt = new Date();
            
            // Recalculate volume if dimensions changed
            if (updates.dimensions || updates.shape) {
              state.bottles[id].volume = VolumeCalculator.calculate(state.bottles[id]);
              state.bottles[id].surfaceArea = VolumeCalculator.calculateSurfaceArea(state.bottles[id]);
            }
          }
        });
      },
      
      deleteBottle: (id) => {
        set((state) => {
          delete state.bottles[id];
          
          // Remove from all lineups
          Object.values(state.lineups).forEach(lineup => {
            lineup.positions = lineup.positions.filter(p => p.bottleId !== id);
          });
          
          // Clear selection if deleted
          state.ui.selectedBottleIds = state.ui.selectedBottleIds.filter(bid => bid !== id);
          if (state.activeBottleId === id) {
            state.activeBottleId = null;
          }
        });
      },
      
      duplicateBottle: (id) => {
        const original = get().bottles[id];
        if (!original) return null;
        
        const newId = get().addBottle({
          ...original,
          name: `${original.name} (Copy)`,
        });
        
        return newId;
      },
      
      setActiveBottle: (id) => {
        set((state) => {
          state.activeBottleId = id;
        });
      },
      
      createBottleFromShape: (shape, targetVolume) => {
        const defaultDims = DEFAULT_DIMENSIONS[shape];
        
        let dimensions: BottleDimensions;
        if (targetVolume) {
          dimensions = VolumeCalculator.estimateDimensionsForVolume(
            targetVolume,
            shape,
            defaultDims
          );
        } else {
          dimensions = { ...defaultDims } as BottleDimensions;
        }
        
        return get().addBottle({
          shape,
          dimensions,
          name: targetVolume ? `${targetVolume}ml ${shape}` : `New ${shape}`,
        });
      },
      
      // Lineup actions
      createLineup: (name, category = 'custom') => {
        const id = uuidv4();
        const now = new Date();
        
        const lineup: Lineup = {
          id,
          name,
          description: '',
          positions: [],
          settings: { ...DEFAULT_LINEUP_SETTINGS },
          shelfWidth: DEFAULT_SHELF_DIMENSIONS.width,
          shelfDepth: DEFAULT_SHELF_DIMENSIONS.depth,
          shelfHeight: DEFAULT_SHELF_DIMENSIONS.height,
          rating: 0,
          notes: '',
          tags: [],
          createdAt: now,
          updatedAt: now,
          category,
        };
        
        set((state) => {
          state.lineups[id] = lineup;
          state.activeLineupId = id;
        });
        
        return id;
      },
      
      updateLineup: (id, updates) => {
        set((state) => {
          if (state.lineups[id]) {
            Object.assign(state.lineups[id], updates);
            state.lineups[id].updatedAt = new Date();
          }
        });
      },
      
      deleteLineup: (id) => {
        set((state) => {
          delete state.lineups[id];
          
          // Remove from comparisons
          Object.values(state.comparisons).forEach(comparison => {
            comparison.lineupIds = comparison.lineupIds.filter(lid => lid !== id);
          });
          
          if (state.activeLineupId === id) {
            state.activeLineupId = null;
          }
        });
      },
      
      addBottleToLineup: (lineupId, bottleId) => {
        set((state) => {
          const lineup = state.lineups[lineupId];
          const bottle = state.bottles[bottleId];
          
          if (lineup && bottle) {
            // Check if bottle already in lineup
            if (!lineup.positions.find(p => p.bottleId === bottleId)) {
              // Calculate position
              const existingBottles = lineup.positions.map(p => state.bottles[p.bottleId]).filter(Boolean);
              const totalWidth = existingBottles.reduce((sum, b) => sum + (b?.dimensions.diameter || 0), 0);
              
              lineup.positions.push({
                bottleId,
                x: totalWidth + lineup.settings.spacing * (lineup.positions.length + 1) + bottle.dimensions.diameter / 2,
                y: 0,
                rotation: 0,
                locked: false,
              });
              
              lineup.updatedAt = new Date();
            }
          }
        });
      },
      
      removeBottleFromLineup: (lineupId, bottleId) => {
        set((state) => {
          const lineup = state.lineups[lineupId];
          if (lineup) {
            lineup.positions = lineup.positions.filter(p => p.bottleId !== bottleId);
            lineup.updatedAt = new Date();
          }
        });
      },
      
      reorderLineup: (lineupId, positions) => {
        set((state) => {
          const lineup = state.lineups[lineupId];
          if (lineup) {
            lineup.positions = positions;
            lineup.updatedAt = new Date();
          }
        });
      },
      
      updateLineupSettings: (lineupId, settings) => {
        set((state) => {
          const lineup = state.lineups[lineupId];
          if (lineup) {
            Object.assign(lineup.settings, settings);
            lineup.updatedAt = new Date();
          }
        });
      },
      
      setActiveLineup: (id) => {
        set((state) => {
          state.activeLineupId = id;
        });
      },
      
      // Comparison actions
      createComparison: (name, lineupIds) => {
        const id = uuidv4();
        
        const comparison: LineupComparison = {
          id,
          name,
          lineupIds,
          notes: '',
          createdAt: new Date(),
        };
        
        set((state) => {
          state.comparisons[id] = comparison;
          state.activeComparisonId = id;
        });
        
        return id;
      },
      
      updateComparison: (id, updates) => {
        set((state) => {
          if (state.comparisons[id]) {
            Object.assign(state.comparisons[id], updates);
          }
        });
      },
      
      deleteComparison: (id) => {
        set((state) => {
          delete state.comparisons[id];
          if (state.activeComparisonId === id) {
            state.activeComparisonId = null;
          }
        });
      },
      
      setActiveComparison: (id) => {
        set((state) => {
          state.activeComparisonId = id;
        });
      },
      
      // UI actions
      toggleSidebar: () => {
        set((state) => {
          state.ui.sidebarOpen = !state.ui.sidebarOpen;
        });
      },
      
      setActiveTab: (tab) => {
        set((state) => {
          state.ui.activeTab = tab;
        });
      },
      
      toggleGrid: () => {
        set((state) => {
          state.ui.showGrid = !state.ui.showGrid;
        });
      },
      
      toggleMeasurements: () => {
        set((state) => {
          state.ui.showMeasurements = !state.ui.showMeasurements;
        });
      },
      
      setViewMode: (mode) => {
        set((state) => {
          state.ui.viewMode = mode;
        });
      },
      
      selectBottle: (id, multi = false) => {
        set((state) => {
          if (multi) {
            const index = state.ui.selectedBottleIds.indexOf(id);
            if (index === -1) {
              state.ui.selectedBottleIds.push(id);
            } else {
              state.ui.selectedBottleIds.splice(index, 1);
            }
          } else {
            state.ui.selectedBottleIds = [id];
          }
        });
      },
      
      clearSelection: () => {
        set((state) => {
          state.ui.selectedBottleIds = [];
        });
      },
      
      setLoading: (loading) => {
        set((state) => {
          state.ui.isLoading = loading;
        });
      },
      
      setError: (error) => {
        set((state) => {
          state.ui.error = error;
        });
      },
      
      // Settings actions
      updateSettings: (updates) => {
        set((state) => {
          Object.assign(state.settings, updates);
        });
      },
      
      // Utility actions
      getBottlesForLineup: (lineupId) => {
        const state = get();
        const lineup = state.lineups[lineupId];
        if (!lineup) return [];
        
        return lineup.positions
          .map(p => state.bottles[p.bottleId])
          .filter((b): b is Bottle => b !== undefined);
      },
      
      recalculateBottleVolume: (id) => {
        set((state) => {
          const bottle = state.bottles[id];
          if (bottle) {
            bottle.volume = VolumeCalculator.calculate(bottle);
            bottle.surfaceArea = VolumeCalculator.calculateSurfaceArea(bottle);
          }
        });
      },
    })),
    {
      name: 'pack2-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        bottles: state.bottles,
        lineups: state.lineups,
        comparisons: state.comparisons,
        settings: state.settings,
      }),
    }
  )
);

// Selector hooks for common patterns
export const useBottles = () => useStore((state) => state.bottles);
export const useActiveBottle = () => useStore((state) => 
  state.activeBottleId ? state.bottles[state.activeBottleId] : null
);
export const useLineups = () => useStore((state) => state.lineups);
export const useActiveLineup = () => useStore((state) => 
  state.activeLineupId ? state.lineups[state.activeLineupId] : null
);
export const useUI = () => useStore((state) => state.ui);
export const useSettings = () => useStore((state) => state.settings);

export default useStore;
