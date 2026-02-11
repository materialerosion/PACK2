/**
 * Type Definitions Index
 * Re-exports all types for convenient importing
 */

export * from './bottle';
export * from './lineup';
export * from './preset';

// Common utility types
export type ViewMode = '3d' | '2d';
export type Theme = 'light' | 'dark';
export type Units = 'metric' | 'imperial';

// Tab types
export type AppTab = 'generator' | 'lineup' | 'comparison' | 'presets' | 'export';

// UI State types
export interface UIState {
  sidebarOpen: boolean;
  activeTab: AppTab;
  showGrid: boolean;
  showMeasurements: boolean;
  viewMode: ViewMode;
  selectedBottleIds: string[];
  isLoading: boolean;
  error: string | null;
}

// Settings types
export interface AppSettings {
  units: Units;
  defaultCategory: import('./preset').OTCCategory;
  autoSave: boolean;
  theme: Theme;
  showTooltips: boolean;
  animationsEnabled: boolean;
}

// Export types
export type ExportFormat = 'pdf' | 'excel' | 'image';

export interface ExportOptions {
  format: ExportFormat;
  includeSpecifications: boolean;
  includeVisual: boolean;
  imageFormat?: 'png' | 'jpeg';
  imageQuality?: number;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
