/**
 * Preset Type Definitions
 * Types for OTC category presets and templates
 */

import { BottleShape, CapStyle, BottleDimensions, BottleMaterial } from './bottle';

export type OTCCategory = 
  | 'pain-relievers'
  | 'cough-syrups'
  | 'vitamins'
  | 'antacids'
  | 'allergy'
  | 'first-aid'
  | 'digestive'
  | 'sleep-aids'
  | 'custom';

export interface VolumeRange {
  min: number;                 // ml
  max: number;                 // ml
  typical: number[];           // Common volumes in range
}

export interface PresetTemplate {
  id: string;
  name: string;
  category: OTCCategory;
  description: string;
  
  // Default bottle configuration
  defaultShape: BottleShape;
  defaultCapStyle: CapStyle;
  defaultMaterial: BottleMaterial;
  
  // Volume specifications
  volumeRange: VolumeRange;
  suggestedVolumes: number[];  // e.g., [30, 60, 120, 240, 500]
  
  // Typical dimensions for this category
  typicalDimensions: Partial<BottleDimensions>;
  
  // Visual defaults
  defaultColors: {
    body: string;
    cap: string;
  };
  
  // Metadata
  isBuiltIn: boolean;
  createdAt: Date;
}

// Category display names
export const CATEGORY_NAMES: Record<OTCCategory, string> = {
  'pain-relievers': 'Pain Relievers',
  'cough-syrups': 'Cough Syrups',
  'vitamins': 'Vitamins & Supplements',
  'antacids': 'Antacids',
  'allergy': 'Allergy Medicine',
  'first-aid': 'First Aid',
  'digestive': 'Digestive Health',
  'sleep-aids': 'Sleep Aids',
  'custom': 'Custom',
};

// Category icons (Lucide icon names)
export const CATEGORY_ICONS: Record<OTCCategory, string> = {
  'pain-relievers': 'Pill',
  'cough-syrups': 'Droplet',
  'vitamins': 'Apple',
  'antacids': 'Beaker',
  'allergy': 'Flower2',
  'first-aid': 'Cross',
  'digestive': 'Activity',
  'sleep-aids': 'Moon',
  'custom': 'Settings',
};

// Category colors for UI
export const CATEGORY_COLORS: Record<OTCCategory, string> = {
  'pain-relievers': '#EF4444',
  'cough-syrups': '#F59E0B',
  'vitamins': '#22C55E',
  'antacids': '#3B82F6',
  'allergy': '#EC4899',
  'first-aid': '#EF4444',
  'digestive': '#8B5CF6',
  'sleep-aids': '#6366F1',
  'custom': '#6B7280',
};
