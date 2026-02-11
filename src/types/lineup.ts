/**
 * Lineup Type Definitions
 * Types for bottle lineup management and display
 */

import { Bottle } from './bottle';

export type SortAlgorithm = 
  | 'linear'
  | 'golden-ratio'
  | 'logarithmic'
  | 'custom';

export type SortDirection = 'ascending' | 'descending';

export type LineupAlignment = 'left' | 'center' | 'right';

export interface LineupPosition {
  bottleId: string;
  x: number;                   // Position on shelf (mm)
  y: number;                   // Depth position (mm)
  rotation: number;            // Y-axis rotation (degrees)
  locked: boolean;             // Prevent auto-repositioning
}

export interface LineupSettings {
  sortAlgorithm: SortAlgorithm;
  sortDirection: SortDirection;
  spacing: number;             // mm between bottles
  alignment: LineupAlignment;
  showLabels: boolean;
  showMeasurements: boolean;
  showGrid: boolean;
  gridSize: number;            // mm
}

export interface Lineup {
  id: string;
  name: string;
  description: string;
  positions: LineupPosition[];
  settings: LineupSettings;
  
  // Shelf dimensions
  shelfWidth: number;          // mm
  shelfDepth: number;          // mm
  shelfHeight: number;         // mm (for visualization)
  
  // Rating & comparison
  rating: number;              // 1-5 stars
  notes: string;
  tags: string[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  category: string;
}

export interface LineupComparison {
  id: string;
  name: string;
  lineupIds: string[];
  notes: string;
  createdAt: Date;
}

// Lineup with resolved bottles (for display)
export interface ResolvedLineup extends Lineup {
  bottles: Bottle[];
}

// Default lineup settings
export const DEFAULT_LINEUP_SETTINGS: LineupSettings = {
  sortAlgorithm: 'linear',
  sortDirection: 'ascending',
  spacing: 20,
  alignment: 'center',
  showLabels: true,
  showMeasurements: true,
  showGrid: true,
  gridSize: 10,
};

// Default shelf dimensions
export const DEFAULT_SHELF_DIMENSIONS = {
  width: 800,    // mm
  depth: 200,    // mm
  height: 300,   // mm
};

// Algorithm display names
export const ALGORITHM_NAMES: Record<SortAlgorithm, string> = {
  'linear': 'Linear Progression',
  'golden-ratio': 'Golden Ratio',
  'logarithmic': 'Logarithmic Scale',
  'custom': 'Custom Order',
};

// Algorithm descriptions
export const ALGORITHM_DESCRIPTIONS: Record<SortAlgorithm, string> = {
  'linear': 'Equal volume increments between bottles',
  'golden-ratio': 'Each bottle is φ (1.618) times the previous',
  'logarithmic': 'Volumes increase on a logarithmic scale',
  'custom': 'Manual ordering with drag and drop',
};
