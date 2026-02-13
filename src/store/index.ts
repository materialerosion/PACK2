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
  Lineup,
  LineupPosition,
  LineupSettings,
  UIState,
  AppSettings,
  AppTab,
  ViewMode,
  DEFAULT_DIMENSIONS,
  DEFAULT_LINEUP_SETTINGS,
  DEFAULT_SHELF_DIMENSIONS,
  BottleSeries,
  SeriesComparison,
  GenerationConfig,
} from '@/types';
import { VolumeCalculator } from '@/services/volumeCalculator';
import { BottleGenerationService } from '@/services/bottleGenerationService';
import { ComparisonService } from '@/services/comparisonService';

// Store state interface
interface AppState {
  // Bottles
  bottles: Record<string, Bottle>;
  activeBottleId: string | null;
  
  // Lineups
  lineups: Record<string, Lineup>;
  activeLineupId: string | null;
  
  // Bottle Series
  bottleSeries: Record<string, BottleSeries>;
  activeSeriesId: string | null;
  
  // Series Comparisons (new)
  seriesComparisons: Record<string, SeriesComparison>;
  activeSeriesComparisonId: string | null;
  
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
  
  // Bottle Series actions
  createBottleSeries: (name: string, config: GenerationConfig) => string;
  updateBottleSeries: (id: string, updates: Partial<BottleSeries>) => void;
  deleteBottleSeries: (id: string) => void;
  setActiveSeries: (id: string | null) => void;
  updateBottleInSeries: (seriesId: string, bottleIndex: number, updates: Partial<Bottle>) => void;
  batchUpdateBottlesInSeries: (seriesId: string, bottleIndices: number[], updates: Partial<Bottle>) => void;
  regenerateSeries: (seriesId: string, config: GenerationConfig) => void;
  
  // Series Comparison actions
  createSeriesComparison: (series1Id: string, series2Id: string) => string | null;
  updateSeriesComparison: (id: string, updates: Partial<SeriesComparison>) => void;
  deleteSeriesComparison: (id: string) => void;
  setActiveSeriesComparison: (id: string | null) => void;
  
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
  bottleSeries: {},
  activeSeriesId: null,
  seriesComparisons: {},
  activeSeriesComparisonId: null,
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
        
        // Default body color: light blue for boston-round, white for others
        const defaultBodyColor = shape === 'boston-round' ? '#9696FF' : '#FFFFFF';

        const bottle: Bottle = {
          id,
          name: bottleData.name || `Bottle ${Object.keys(get().bottles).length + 1}`,
          shape,
          dimensions,
          capStyle: bottleData.capStyle || 'screw-cap',
          capColor: bottleData.capColor || '#FFFFFF',
          bodyColor: bottleData.bodyColor || defaultBodyColor,
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
      
      // Bottle Series actions
      createBottleSeries: (name, config) => {
        const id = uuidv4();
        const now = new Date();
        
        const bottles = BottleGenerationService.generateSeries(config, get().bottles);
        
        const series: BottleSeries = {
          id,
          name,
          description: '',
          config,
          bottles,
          createdAt: now,
          updatedAt: now,
          category: '',
        };
        
        set((state) => {
          state.bottleSeries[id] = series;
          state.activeSeriesId = id;
        });
        
        return id;
      },
      
      updateBottleSeries: (id, updates) => {
        set((state) => {
          if (state.bottleSeries[id]) {
            Object.assign(state.bottleSeries[id], updates);
            state.bottleSeries[id].updatedAt = new Date();
          }
        });
      },
      
      deleteBottleSeries: (id) => {
        set((state) => {
          delete state.bottleSeries[id];
          
          // Remove related comparisons
          Object.keys(state.seriesComparisons).forEach(compId => {
            const comp = state.seriesComparisons[compId];
            if (comp.series1Id === id || comp.series2Id === id) {
              delete state.seriesComparisons[compId];
            }
          });
          
          if (state.activeSeriesId === id) {
            state.activeSeriesId = null;
          }
        });
      },
      
      setActiveSeries: (id) => {
        set((state) => {
          state.activeSeriesId = id;
        });
      },
      
      updateBottleInSeries: (seriesId, bottleIndex, updates) => {
        set((state) => {
          const series = state.bottleSeries[seriesId];
          if (series && series.bottles[bottleIndex]) {
            Object.assign(series.bottles[bottleIndex], updates);
            series.bottles[bottleIndex].updatedAt = new Date();
            
            // Recalculate volume if dimensions changed
            if (updates.dimensions || updates.shape) {
              series.bottles[bottleIndex].volume = VolumeCalculator.calculate(series.bottles[bottleIndex]);
              series.bottles[bottleIndex].surfaceArea = VolumeCalculator.calculateSurfaceArea(series.bottles[bottleIndex]);
            }
            
            series.updatedAt = new Date();
          }
        });
      },
      
      batchUpdateBottlesInSeries: (seriesId, bottleIndices, updates) => {
        set((state) => {
          const series = state.bottleSeries[seriesId];
          if (series) {
            for (const index of bottleIndices) {
              if (series.bottles[index]) {
                Object.assign(series.bottles[index], updates);
                series.bottles[index].updatedAt = new Date();
                
                if (updates.dimensions || updates.shape) {
                  series.bottles[index].volume = VolumeCalculator.calculate(series.bottles[index]);
                  series.bottles[index].surfaceArea = VolumeCalculator.calculateSurfaceArea(series.bottles[index]);
                }
              }
            }
            series.updatedAt = new Date();
          }
        });
      },
      
      regenerateSeries: (seriesId, config) => {
        set((state) => {
          const series = state.bottleSeries[seriesId];
          if (series) {
            const bottles = BottleGenerationService.generateSeries(config, get().bottles);
            series.config = config;
            series.bottles = bottles;
            series.updatedAt = new Date();
          }
        });
      },
      
      // Series Comparison actions
      createSeriesComparison: (series1Id, series2Id) => {
        const state = get();
        const series1 = state.bottleSeries[series1Id];
        const series2 = state.bottleSeries[series2Id];
        
        if (!series1 || !series2) return null;
        
        const comparison = ComparisonService.compareSeries(series1, series2);
        
        set((s) => {
          s.seriesComparisons[comparison.id] = comparison;
          s.activeSeriesComparisonId = comparison.id;
        });
        
        return comparison.id;
      },
      
      updateSeriesComparison: (id, updates) => {
        set((state) => {
          if (state.seriesComparisons[id]) {
            Object.assign(state.seriesComparisons[id], updates);
          }
        });
      },
      
      deleteSeriesComparison: (id) => {
        set((state) => {
          delete state.seriesComparisons[id];
          if (state.activeSeriesComparisonId === id) {
            state.activeSeriesComparisonId = null;
          }
        });
      },
      
      setActiveSeriesComparison: (id) => {
        set((state) => {
          state.activeSeriesComparisonId = id;
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
        bottleSeries: state.bottleSeries,
        seriesComparisons: state.seriesComparisons,
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
export const useBottleSeries = () => useStore((state) => state.bottleSeries);
export const useActiveSeries = () => useStore((state) =>
  state.activeSeriesId ? state.bottleSeries[state.activeSeriesId] : null
);
export const useSeriesComparisons = () => useStore((state) => state.seriesComparisons);
export const useActiveSeriesComparison = () => useStore((state) =>
  state.activeSeriesComparisonId ? state.seriesComparisons[state.activeSeriesComparisonId] : null
);

export default useStore;
