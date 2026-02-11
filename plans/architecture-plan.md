# Pharmaceutical Packaging Design Application - Architecture Plan

## Executive Summary

This document outlines the architecture for a sophisticated single-page web application for pharmaceutical packaging design. The application enables users to generate and compare bottle lineups for over-the-counter (OTC) medicine products with realistic 3D visualization, precise volume calculations, and comprehensive export capabilities.

---

## 1. Technology Stack

### Core Framework
- **React 18+** - Component-based UI framework with hooks
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and development server

### 3D Rendering
- **Three.js** - WebGL-based 3D graphics library
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for react-three-fiber
- **@react-three/cannon** (future) - Physics engine integration for pills/capsules simulation

### State Management
- **Zustand** - Lightweight state management with persistence
- **Immer** - Immutable state updates

### UI Components
- **Radix UI** - Accessible, unstyled component primitives
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library

### Drag & Drop
- **@dnd-kit/core** - Modern drag and drop toolkit
- **@dnd-kit/sortable** - Sortable preset for dnd-kit

### Export & Reports
- **jsPDF** - PDF generation
- **xlsx** - Excel spreadsheet generation
- **html2canvas** - Screenshot capture for image export

### Data Persistence
- **IndexedDB** via **Dexie.js** - Client-side database for configurations
- **localStorage** - Quick settings and preferences

---

## 2. Application Architecture

### 2.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PACK2 Application                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        Presentation Layer                            │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐  │   │
│  │  │   Header &   │ │   Bottle     │ │   Lineup     │ │ Comparison │  │   │
│  │  │  Navigation  │ │  Generator   │ │   Builder    │ │    Mode    │  │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘  │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐  │   │
│  │  │   3D Scene   │ │   Control    │ │   Presets    │ │   Export   │  │   │
│  │  │   Viewport   │ │    Panels    │ │   Library    │ │   Panel    │  │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────▼───────────────────────────────────┐   │
│  │                         Business Logic Layer                         │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐  │   │
│  │  │   Volume     │ │   Lineup     │ │   Bottle     │ │   Export   │  │   │
│  │  │ Calculator   │ │  Algorithms  │ │   Factory    │ │   Service  │  │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘  │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐  │   │
│  │  │   Geometry   │ │   Preset     │ │   Rating     │ │  Validation│  │   │
│  │  │   Engine     │ │   Manager    │ │   System     │ │   Service  │  │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────▼───────────────────────────────────┐   │
│  │                          Data Layer                                  │   │
│  │  ┌──────────────────────────┐  ┌──────────────────────────────────┐ │   │
│  │  │      Zustand Store       │  │         IndexedDB (Dexie)        │ │   │
│  │  │  ┌────────┐ ┌─────────┐  │  │  ┌─────────┐ ┌────────────────┐  │ │   │
│  │  │  │Bottles │ │ Lineups │  │  │  │ Saved   │ │  Configurations │  │ │   │
│  │  │  │ State  │ │  State  │  │  │  │ Lineups │ │    & Presets    │  │ │   │
│  │  │  └────────┘ └─────────┘  │  │  └─────────┘ └────────────────┘  │ │   │
│  │  │  ┌────────┐ ┌─────────┐  │  │  ┌─────────┐ ┌────────────────┐  │ │   │
│  │  │  │  UI    │ │Settings │  │  │  │ Export  │ │    Ratings     │  │ │   │
│  │  │  │ State  │ │  State  │  │  │  │ History │ │    & Notes     │  │ │   │
│  │  │  └────────┘ └─────────┘  │  │  └─────────┘ └────────────────┘  │ │   │
│  │  └──────────────────────────┘  └──────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Architecture

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MainContent.tsx
│   │   └── Footer.tsx
│   │
│   ├── bottle-generator/
│   │   ├── BottleGenerator.tsx          # Main container
│   │   ├── BottleParameterPanel.tsx     # Dimension inputs
│   │   ├── BottleShapeSelector.tsx      # Shape type selection
│   │   ├── BottlePreview3D.tsx          # 3D preview component
│   │   ├── CapStyleSelector.tsx         # Cap/closure options
│   │   ├── LabelZoneEditor.tsx          # Label placement
│   │   └── VolumeDisplay.tsx            # Calculated volume
│   │
│   ├── lineup-builder/
│   │   ├── LineupBuilder.tsx            # Main container
│   │   ├── ShelfDisplay.tsx             # Virtual shelf 3D scene
│   │   ├── BottleSlot.tsx               # Individual bottle position
│   │   ├── DragDropContext.tsx          # DnD wrapper
│   │   ├── SortingControls.tsx          # Sort algorithm selection
│   │   ├── GridOverlay.tsx              # Alignment grid
│   │   └── MeasurementOverlay.tsx       # Dimension overlays
│   │
│   ├── comparison-mode/
│   │   ├── ComparisonPanel.tsx          # Side-by-side view
│   │   ├── LineupCard.tsx               # Saved lineup display
│   │   ├── RatingWidget.tsx             # Star rating + notes
│   │   └── ComparisonTable.tsx          # Specs comparison
│   │
│   ├── presets/
│   │   ├── PresetLibrary.tsx            # Preset browser
│   │   ├── PresetCard.tsx               # Individual preset
│   │   ├── CategoryFilter.tsx           # OTC category filter
│   │   └── CustomRangeEditor.tsx        # Volume range editor
│   │
│   ├── export/
│   │   ├── ExportPanel.tsx              # Export options
│   │   ├── PDFPreview.tsx               # PDF preview
│   │   └── ExportProgress.tsx           # Export status
│   │
│   ├── 3d/
│   │   ├── Scene.tsx                    # Main Three.js scene
│   │   ├── Bottle3D.tsx                 # Bottle mesh component
│   │   ├── BottleGeometry.tsx           # Geometry generators
│   │   ├── Shelf3D.tsx                  # Shelf mesh
│   │   ├── Lighting.tsx                 # Scene lighting
│   │   ├── Camera.tsx                   # Camera controls
│   │   └── Materials.tsx                # Material definitions
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── Slider.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Tabs.tsx
│       ├── Modal.tsx
│       ├── Tooltip.tsx
│       └── Card.tsx
│
├── hooks/
│   ├── useBottle.ts                     # Bottle CRUD operations
│   ├── useLineup.ts                     # Lineup management
│   ├── useVolumeCalculation.ts          # Volume calculations
│   ├── useExport.ts                     # Export functionality
│   ├── useDragDrop.ts                   # DnD logic
│   ├── usePresets.ts                    # Preset management
│   └── usePersistence.ts                # Data persistence
│
├── services/
│   ├── volumeCalculator.ts              # Volume calculation engine
│   ├── geometryEngine.ts                # 3D geometry generation
│   ├── lineupAlgorithms.ts              # Sorting algorithms
│   ├── exportService.ts                 # PDF/Excel/Image export
│   ├── validationService.ts             # Input validation
│   └── presetService.ts                 # Preset data management
│
├── store/
│   ├── index.ts                         # Store configuration
│   ├── bottleSlice.ts                   # Bottle state
│   ├── lineupSlice.ts                   # Lineup state
│   ├── uiSlice.ts                       # UI state
│   └── settingsSlice.ts                 # App settings
│
├── types/
│   ├── bottle.ts                        # Bottle type definitions
│   ├── lineup.ts                        # Lineup type definitions
│   ├── geometry.ts                      # Geometry types
│   ├── preset.ts                        # Preset types
│   └── export.ts                        # Export types
│
├── utils/
│   ├── math.ts                          # Mathematical utilities
│   ├── formatting.ts                    # Number/string formatting
│   ├── colors.ts                        # Color utilities
│   └── constants.ts                     # App constants
│
├── data/
│   ├── presets/
│   │   ├── painRelievers.ts
│   │   ├── coughSyrups.ts
│   │   ├── vitamins.ts
│   │   └── index.ts
│   └── defaultSettings.ts
│
├── db/
│   └── database.ts                      # Dexie database setup
│
├── App.tsx
├── main.tsx
└── index.css
```

---

## 3. Data Models

### 3.1 Bottle Model

```typescript
// types/bottle.ts

export type BottleShape = 
  | 'boston-round'
  | 'cylinder'
  | 'oval'
  | 'modern-pharmaceutical'
  | 'packer'
  | 'wide-mouth';

export type CapStyle = 
  | 'screw-cap'
  | 'child-resistant'
  | 'flip-top'
  | 'dropper'
  | 'pump'
  | 'spray';

export type BaseProfile = 
  | 'flat'
  | 'concave'
  | 'convex'
  | 'petaloid';

export interface BottleDimensions {
  // Primary dimensions (mm)
  height: number;              // Total height including cap
  bodyHeight: number;          // Body height without cap
  diameter: number;            // Maximum body diameter
  
  // Neck dimensions (mm)
  neckHeight: number;
  neckDiameter: number;
  neckFinish: string;          // e.g., "28-400", "33-400"
  
  // Shoulder parameters
  shoulderCurveRadius: number;
  shoulderAngle: number;       // degrees
  
  // Base parameters
  baseProfile: BaseProfile;
  baseDiameter: number;
  baseIndentDepth: number;     // For concave bases
  
  // For oval bottles
  widthRatio?: number;         // Width to depth ratio
  
  // Wall thickness (for volume calculation)
  wallThickness: number;
}

export interface LabelZone {
  id: string;
  name: string;
  topOffset: number;           // mm from shoulder
  height: number;              // mm
  wrapAngle: number;           // degrees (360 for full wrap)
}

export interface Bottle {
  id: string;
  name: string;
  shape: BottleShape;
  dimensions: BottleDimensions;
  capStyle: CapStyle;
  capColor: string;
  bodyColor: string;
  material: 'HDPE' | 'PET' | 'glass' | 'PP';
  opacity: number;             // 0-1 for transparency
  labelZones: LabelZone[];
  
  // Calculated values
  volume: number;              // ml (calculated)
  surfaceArea: number;         // cm² (calculated)
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  isCustom: boolean;
  presetId?: string;
}
```

### 3.2 Lineup Model

```typescript
// types/lineup.ts

export type SortAlgorithm = 
  | 'linear'
  | 'golden-ratio'
  | 'logarithmic'
  | 'custom';

export type SortDirection = 'ascending' | 'descending';

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
  alignment: 'left' | 'center' | 'right';
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
```

### 3.3 Preset Model

```typescript
// types/preset.ts

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
  defaultMaterial: string;
  
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
```

---

## 4. Volume Calculation Engine

### 4.1 Mathematical Formulas

The volume calculation engine handles complex bottle shapes using numerical integration and geometric decomposition.

```typescript
// services/volumeCalculator.ts

/**
 * Volume Calculation Engine
 * 
 * Calculates internal volume of pharmaceutical bottles
 * using precise mathematical formulas for various shapes.
 */

export class VolumeCalculator {
  
  /**
   * CYLINDER VOLUME
   * V = π × r² × h
   */
  static cylinder(radius: number, height: number): number {
    return Math.PI * Math.pow(radius, 2) * height;
  }
  
  /**
   * TRUNCATED CONE (FRUSTUM)
   * V = (π × h / 3) × (r1² + r1×r2 + r2²)
   * Used for shoulder and neck transitions
   */
  static frustum(r1: number, r2: number, height: number): number {
    return (Math.PI * height / 3) * 
           (Math.pow(r1, 2) + r1 * r2 + Math.pow(r2, 2));
  }
  
  /**
   * SPHERICAL CAP
   * V = (π × h² / 3) × (3r - h)
   * Used for rounded shoulders and bases
   */
  static sphericalCap(radius: number, height: number): number {
    return (Math.PI * Math.pow(height, 2) / 3) * (3 * radius - height);
  }
  
  /**
   * ELLIPSOID SECTION
   * V = (4/3) × π × a × b × c × (fraction)
   * Used for oval bottles
   */
  static ellipsoidSection(a: number, b: number, c: number, fraction: number = 1): number {
    return (4 / 3) * Math.PI * a * b * c * fraction;
  }
  
  /**
   * BOSTON ROUND BOTTLE
   * Composed of:
   * - Cylindrical body
   * - Spherical shoulder transition
   * - Cylindrical neck
   * - Base indent (subtracted)
   */
  static bostonRound(dims: BottleDimensions): number {
    const bodyRadius = (dims.diameter / 2) - dims.wallThickness;
    const neckRadius = (dims.neckDiameter / 2) - dims.wallThickness;
    
    // Calculate shoulder curve geometry
    const shoulderHeight = dims.shoulderCurveRadius * 
                          (1 - Math.cos(dims.shoulderAngle * Math.PI / 180));
    
    // Body cylinder (main volume)
    const bodyHeight = dims.bodyHeight - shoulderHeight - dims.baseIndentDepth;
    const bodyVolume = this.cylinder(bodyRadius, bodyHeight);
    
    // Shoulder transition (frustum approximation)
    const shoulderVolume = this.frustum(bodyRadius, neckRadius, shoulderHeight);
    
    // Neck cylinder
    const neckVolume = this.cylinder(neckRadius, dims.neckHeight);
    
    // Base indent (subtract)
    const baseIndentVolume = dims.baseProfile === 'concave' 
      ? this.sphericalCap(dims.baseDiameter / 2, dims.baseIndentDepth)
      : 0;
    
    // Total internal volume in mm³, convert to ml
    const totalMm3 = bodyVolume + shoulderVolume + neckVolume - baseIndentVolume;
    return totalMm3 / 1000; // Convert mm³ to ml (cm³)
  }
  
  /**
   * OVAL BOTTLE
   * Uses elliptical cross-section
   */
  static oval(dims: BottleDimensions): number {
    const widthRatio = dims.widthRatio || 0.6;
    const a = (dims.diameter / 2) - dims.wallThickness;  // Major axis
    const b = a * widthRatio;                             // Minor axis
    
    // Elliptical cylinder for body
    const bodyHeight = dims.bodyHeight - dims.neckHeight;
    const bodyVolume = Math.PI * a * b * bodyHeight;
    
    // Neck (circular)
    const neckRadius = (dims.neckDiameter / 2) - dims.wallThickness;
    const neckVolume = this.cylinder(neckRadius, dims.neckHeight);
    
    // Transition zone (approximate)
    const transitionVolume = this.frustum(
      Math.sqrt(a * b), // Equivalent radius
      neckRadius,
      dims.shoulderCurveRadius
    );
    
    const totalMm3 = bodyVolume + neckVolume + transitionVolume;
    return totalMm3 / 1000;
  }
  
  /**
   * MODERN PHARMACEUTICAL
   * Rectangular with rounded corners
   */
  static modernPharmaceutical(dims: BottleDimensions): number {
    const cornerRadius = dims.shoulderCurveRadius;
    const width = dims.diameter - 2 * dims.wallThickness;
    const depth = width * (dims.widthRatio || 0.5);
    const height = dims.bodyHeight - dims.neckHeight;
    
    // Rectangle minus corner cylinders plus corner volume
    const rectVolume = width * depth * height;
    const cornerCorrection = (4 - Math.PI) * Math.pow(cornerRadius, 2) * height;
    
    const bodyVolume = rectVolume - cornerCorrection;
    
    // Neck
    const neckRadius = (dims.neckDiameter / 2) - dims.wallThickness;
    const neckVolume = this.cylinder(neckRadius, dims.neckHeight);
    
    const totalMm3 = bodyVolume + neckVolume;
    return totalMm3 / 1000;
  }
  
  /**
   * NUMERICAL INTEGRATION
   * For complex shapes, use Simpson's rule
   */
  static numericalIntegration(
    radiusFunction: (h: number) => number,
    height: number,
    segments: number = 100
  ): number {
    const dh = height / segments;
    let volume = 0;
    
    for (let i = 0; i < segments; i++) {
      const h1 = i * dh;
      const h2 = (i + 1) * dh;
      const hMid = (h1 + h2) / 2;
      
      const r1 = radiusFunction(h1);
      const r2 = radiusFunction(h2);
      const rMid = radiusFunction(hMid);
      
      // Simpson's rule for this segment
      volume += (dh / 6) * Math.PI * (
        Math.pow(r1, 2) + 
        4 * Math.pow(rMid, 2) + 
        Math.pow(r2, 2)
      );
    }
    
    return volume / 1000; // Convert to ml
  }
  
  /**
   * Main calculation dispatcher
   */
  static calculate(bottle: Bottle): number {
    switch (bottle.shape) {
      case 'boston-round':
        return this.bostonRound(bottle.dimensions);
      case 'cylinder':
        return this.cylinder(
          (bottle.dimensions.diameter / 2) - bottle.dimensions.wallThickness,
          bottle.dimensions.bodyHeight
        ) / 1000;
      case 'oval':
        return this.oval(bottle.dimensions);
      case 'modern-pharmaceutical':
        return this.modernPharmaceutical(bottle.dimensions);
      default:
        return this.bostonRound(bottle.dimensions);
    }
  }
}
```

### 4.2 Lineup Generation Algorithms

```typescript
// services/lineupAlgorithms.ts

export class LineupAlgorithms {
  
  /**
   * LINEAR PROGRESSION
   * Equal volume increments between bottles
   */
  static linear(
    minVolume: number,
    maxVolume: number,
    count: number
  ): number[] {
    const step = (maxVolume - minVolume) / (count - 1);
    return Array.from({ length: count }, (_, i) => 
      Math.round(minVolume + step * i)
    );
  }
  
  /**
   * GOLDEN RATIO SPACING
   * Each bottle is φ (1.618) times the previous
   */
  static goldenRatio(
    minVolume: number,
    maxVolume: number,
    count: number
  ): number[] {
    const PHI = 1.618033988749895;
    const ratio = Math.pow(maxVolume / minVolume, 1 / (count - 1));
    
    // Adjust ratio to approximate golden ratio
    const adjustedRatio = Math.min(ratio, PHI);
    
    return Array.from({ length: count }, (_, i) =>
      Math.round(minVolume * Math.pow(adjustedRatio, i))
    );
  }
  
  /**
   * LOGARITHMIC SCALING
   * Volumes increase logarithmically
   */
  static logarithmic(
    minVolume: number,
    maxVolume: number,
    count: number
  ): number[] {
    const logMin = Math.log(minVolume);
    const logMax = Math.log(maxVolume);
    const logStep = (logMax - logMin) / (count - 1);
    
    return Array.from({ length: count }, (_, i) =>
      Math.round(Math.exp(logMin + logStep * i))
    );
  }
  
  /**
   * STANDARD PHARMACEUTICAL VOLUMES
   * Snaps to common pharmaceutical sizes
   */
  static standardVolumes(
    minVolume: number,
    maxVolume: number
  ): number[] {
    const standards = [
      15, 30, 50, 60, 100, 120, 150, 180, 
      200, 240, 250, 300, 350, 400, 450, 500
    ];
    
    return standards.filter(v => v >= minVolume && v <= maxVolume);
  }
  
  /**
   * Calculate optimal spacing between bottles
   */
  static calculateSpacing(
    bottles: Bottle[],
    shelfWidth: number,
    algorithm: SortAlgorithm
  ): number {
    const totalBottleWidth = bottles.reduce(
      (sum, b) => sum + b.dimensions.diameter, 0
    );
    const availableSpace = shelfWidth - totalBottleWidth;
    const gaps = bottles.length + 1;
    
    return Math.max(10, availableSpace / gaps); // Minimum 10mm spacing
  }
  
  /**
   * Sort bottles by volume
   */
  static sortByVolume(
    bottles: Bottle[],
    direction: SortDirection
  ): Bottle[] {
    return [...bottles].sort((a, b) => 
      direction === 'ascending' 
        ? a.volume - b.volume 
        : b.volume - a.volume
    );
  }
  
  /**
   * Generate positions for lineup
   */
  static generatePositions(
    bottles: Bottle[],
    settings: LineupSettings,
    shelfWidth: number
  ): LineupPosition[] {
    const sorted = this.sortByVolume(bottles, settings.sortDirection);
    const spacing = settings.spacing;
    
    let currentX = spacing;
    
    return sorted.map(bottle => {
      const position: LineupPosition = {
        bottleId: bottle.id,
        x: currentX,
        y: 0,
        rotation: 0,
        locked: false
      };
      
      currentX += bottle.dimensions.diameter + spacing;
      return position;
    });
  }
}
```

---

## 5. 3D Geometry Engine

### 5.1 Bottle Geometry Generation

```typescript
// services/geometryEngine.ts

import * as THREE from 'three';

export class GeometryEngine {
  
  /**
   * Generate Boston Round bottle geometry
   */
  static bostonRound(dims: BottleDimensions): THREE.BufferGeometry {
    const points: THREE.Vector2[] = [];
    const segments = 64;
    
    // Base
    points.push(new THREE.Vector2(0, 0));
    points.push(new THREE.Vector2(dims.baseDiameter / 2, 0));
    
    // Body
    const bodyTop = dims.bodyHeight - dims.shoulderCurveRadius;
    points.push(new THREE.Vector2(dims.diameter / 2, dims.baseIndentDepth));
    points.push(new THREE.Vector2(dims.diameter / 2, bodyTop));
    
    // Shoulder curve (bezier approximation)
    const shoulderPoints = this.generateShoulderCurve(
      dims.diameter / 2,
      dims.neckDiameter / 2,
      dims.shoulderCurveRadius,
      bodyTop
    );
    points.push(...shoulderPoints);
    
    // Neck
    const neckBottom = bodyTop + dims.shoulderCurveRadius;
    points.push(new THREE.Vector2(dims.neckDiameter / 2, neckBottom));
    points.push(new THREE.Vector2(dims.neckDiameter / 2, dims.height));
    
    // Create lathe geometry
    return new THREE.LatheGeometry(points, segments);
  }
  
  /**
   * Generate shoulder curve points
   */
  static generateShoulderCurve(
    bodyRadius: number,
    neckRadius: number,
    curveRadius: number,
    startHeight: number
  ): THREE.Vector2[] {
    const points: THREE.Vector2[] = [];
    const steps = 16;
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = t * Math.PI / 2;
      
      const r = bodyRadius - (bodyRadius - neckRadius) * Math.sin(angle);
      const h = startHeight + curveRadius * (1 - Math.cos(angle));
      
      points.push(new THREE.Vector2(r, h));
    }
    
    return points;
  }
  
  /**
   * Generate cylinder bottle geometry
   */
  static cylinder(dims: BottleDimensions): THREE.BufferGeometry {
    const geometry = new THREE.CylinderGeometry(
      dims.diameter / 2,
      dims.diameter / 2,
      dims.bodyHeight,
      32
    );
    
    // Add neck
    const neckGeometry = new THREE.CylinderGeometry(
      dims.neckDiameter / 2,
      dims.neckDiameter / 2,
      dims.neckHeight,
      32
    );
    
    // Position neck on top
    neckGeometry.translate(0, (dims.bodyHeight + dims.neckHeight) / 2, 0);
    
    // Merge geometries
    return this.mergeGeometries([geometry, neckGeometry]);
  }
  
  /**
   * Generate oval bottle geometry
   */
  static oval(dims: BottleDimensions): THREE.BufferGeometry {
    const widthRatio = dims.widthRatio || 0.6;
    const points: THREE.Vector2[] = [];
    const segments = 64;
    
    // Create elliptical profile
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 2;
      
      const a = dims.diameter / 2;
      const b = a * widthRatio;
      
      // Ellipse equation
      const r = (a * b) / Math.sqrt(
        Math.pow(b * Math.cos(angle), 2) + 
        Math.pow(a * Math.sin(angle), 2)
      );
      
      points.push(new THREE.Vector2(r, t * dims.bodyHeight));
    }
    
    return new THREE.LatheGeometry(points, segments);
  }
  
  /**
   * Generate cap geometry
   */
  static cap(style: CapStyle, neckDiameter: number): THREE.BufferGeometry {
    const capDiameter = neckDiameter * 1.2;
    const capHeight = neckDiameter * 0.6;
    
    switch (style) {
      case 'screw-cap':
        return new THREE.CylinderGeometry(
          capDiameter / 2,
          capDiameter / 2,
          capHeight,
          32
        );
        
      case 'child-resistant':
        // Wider cap with ridges
        const crGeometry = new THREE.CylinderGeometry(
          capDiameter / 2 * 1.1,
          capDiameter / 2 * 1.1,
          capHeight * 1.2,
          32
        );
        return crGeometry;
        
      case 'flip-top':
        // Cap with hinge
        const baseGeom = new THREE.CylinderGeometry(
          capDiameter / 2,
          capDiameter / 2,
          capHeight * 0.7,
          32
        );
        return baseGeom;
        
      case 'dropper':
        // Elongated dropper cap
        return new THREE.CylinderGeometry(
          capDiameter / 2 * 0.8,
          capDiameter / 2 * 0.6,
          capHeight * 2,
          32
        );
        
      case 'pump':
        // Pump dispenser
        const pumpBase = new THREE.CylinderGeometry(
          capDiameter / 2,
          capDiameter / 2,
          capHeight,
          32
        );
        return pumpBase;
        
      case 'spray':
        // Spray nozzle
        return new THREE.CylinderGeometry(
          capDiameter / 2 * 0.9,
          capDiameter / 2 * 0.7,
          capHeight * 1.5,
          32
        );
        
      default:
        return new THREE.CylinderGeometry(
          capDiameter / 2,
          capDiameter / 2,
          capHeight,
          32
        );
    }
  }
  
  /**
   * Merge multiple geometries
   */
  static mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
    // Use BufferGeometryUtils.mergeBufferGeometries in actual implementation
    return geometries[0]; // Simplified for documentation
  }
  
  /**
   * Generate label zone geometry
   */
  static labelZone(
    bottle: Bottle,
    zone: LabelZone
  ): THREE.BufferGeometry {
    const radius = bottle.dimensions.diameter / 2 + 0.5; // Slight offset
    const height = zone.height;
    const thetaLength = (zone.wrapAngle / 360) * Math.PI * 2;
    
    return new THREE.CylinderGeometry(
      radius,
      radius,
      height,
      32,
      1,
      true,
      0,
      thetaLength
    );
  }
}
```

---

## 6. State Management

### 6.1 Zustand Store Structure

```typescript
// store/index.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface AppState {
  // Bottles
  bottles: Map<string, Bottle>;
  activeBottleId: string | null;
  
  // Lineups
  lineups: Map<string, Lineup>;
  activeLineupId: string | null;
  
  // Comparisons
  comparisons: Map<string, LineupComparison>;
  activeComparisonId: string | null;
  
  // UI State
  ui: {
    sidebarOpen: boolean;
    activeTab: 'generator' | 'lineup' | 'comparison' | 'presets';
    showGrid: boolean;
    showMeasurements: boolean;
    viewMode: '3d' | '2d';
    selectedBottleIds: string[];
  };
  
  // Settings
  settings: {
    units: 'metric' | 'imperial';
    defaultCategory: OTCCategory;
    autoSave: boolean;
    theme: 'light' | 'dark';
  };
  
  // Actions
  actions: {
    // Bottle actions
    addBottle: (bottle: Bottle) => void;
    updateBottle: (id: string, updates: Partial<Bottle>) => void;
    deleteBottle: (id: string) => void;
    duplicateBottle: (id: string) => Bottle;
    setActiveBottle: (id: string | null) => void;
    
    // Lineup actions
    createLineup: (name: string) => Lineup;
    updateLineup: (id: string, updates: Partial<Lineup>) => void;
    deleteLineup: (id: string) => void;
    addBottleToLineup: (lineupId: string, bottleId: string) => void;
    removeBottleFromLineup: (lineupId: string, bottleId: string) => void;
    reorderLineup: (lineupId: string, positions: LineupPosition[]) => void;
    setActiveLineup: (id: string | null) => void;
    
    // Comparison actions
    createComparison: (lineupIds: string[]) => LineupComparison;
    updateComparison: (id: string, updates: Partial<LineupComparison>) => void;
    deleteComparison: (id: string) => void;
    
    // UI actions
    toggleSidebar: () => void;
    setActiveTab: (tab: string) => void;
    toggleGrid: () => void;
    toggleMeasurements: () => void;
    setViewMode: (mode: '3d' | '2d') => void;
    selectBottle: (id: string, multi?: boolean) => void;
    clearSelection: () => void;
    
    // Settings actions
    updateSettings: (updates: Partial<AppState['settings']>) => void;
  };
}

export const useStore = create<AppState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      bottles: new Map(),
      activeBottleId: null,
      lineups: new Map(),
      activeLineupId: null,
      comparisons: new Map(),
      activeComparisonId: null,
      
      ui: {
        sidebarOpen: true,
        activeTab: 'generator',
        showGrid: true,
        showMeasurements: true,
        viewMode: '3d',
        selectedBottleIds: [],
      },
      
      settings: {
        units: 'metric',
        defaultCategory: 'pain-relievers',
        autoSave: true,
        theme: 'light',
      },
      
      actions: {
        // Implementation details...
      },
    })),
    {
      name: 'pack2-storage',
      partialize: (state) => ({
        bottles: state.bottles,
        lineups: state.lineups,
        comparisons: state.comparisons,
        settings: state.settings,
      }),
    }
  )
);
```

---

## 7. UI/UX Design

### 7.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER: Logo | Navigation Tabs | Settings | Export                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────────────────────────────┐   │
│  │                     │  │                                             │   │
│  │   CONTROL PANEL     │  │              3D VIEWPORT                    │   │
│  │                     │  │                                             │   │
│  │  ┌───────────────┐  │  │    ┌─────────────────────────────────┐     │   │
│  │  │ Shape Select  │  │  │    │                                 │     │   │
│  │  └───────────────┘  │  │    │                                 │     │   │
│  │                     │  │    │         BOTTLE PREVIEW          │     │   │
│  │  ┌───────────────┐  │  │    │              OR                 │     │   │
│  │  │  Dimensions   │  │  │    │         SHELF LINEUP            │     │   │
│  │  │   - Height    │  │  │    │                                 │     │   │
│  │  │   - Diameter  │  │  │    │                                 │     │   │
│  │  │   - Neck      │  │  │    └─────────────────────────────────┘     │   │
│  │  │   - Shoulder  │  │  │                                             │   │
│  │  └───────────────┘  │  │    ┌─────────────────────────────────┐     │   │
│  │                     │  │    │  MEASUREMENT OVERLAY (optional) │     │   │
│  │  ┌───────────────┐  │  │    └─────────────────────────────────┘     │   │
│  │  │  Cap Style    │  │  │                                             │   │
│  │  └───────────────┘  │  │    Camera Controls: Rotate | Pan | Zoom    │   │
│  │                     │  │                                             │   │
│  │  ┌───────────────┐  │  └─────────────────────────────────────────────┘   │
│  │  │   Volume      │  │                                                    │
│  │  │   Display     │  │  ┌─────────────────────────────────────────────┐   │
│  │  │   ████ 120ml  │  │  │  BOTTLE LIBRARY / LINEUP SLOTS              │   │
│  │  └───────────────┘  │  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐  │   │
│  │                     │  │  │ 30 │ │ 60 │ │120 │ │180 │ │240 │ │500 │  │   │
│  │  ┌───────────────┐  │  │  │ ml │ │ ml │ │ ml │ │ ml │ │ ml │ │ ml │  │   │
│  │  │  Add to       │  │  │  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘  │   │
│  │  │  Lineup       │  │  │  Drag to reorder | Click to edit            │   │
│  │  └───────────────┘  │  └─────────────────────────────────────────────┘   │
│  │                     │                                                    │
│  └─────────────────────┘                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  STATUS BAR: Bottles: 6 | Lineup: "Pain Relievers" | Auto-saved            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Interaction Patterns

1. **Bottle Creation Flow**
   - Select shape type → Adjust dimensions → Preview in 3D → Add to library

2. **Lineup Building Flow**
   - Select bottles from library → Drag to shelf → Auto-sort by algorithm → Fine-tune positions

3. **Comparison Flow**
   - Save lineup → Create comparison → Add multiple lineups → Rate and annotate

4. **Export Flow**
   - Select lineup(s) → Choose format → Preview → Download

---

## 8. Export Service

### 8.1 PDF Report Generation

```typescript
// services/exportService.ts

import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

export class ExportService {
  
  /**
   * Generate PDF report
   */
  static async generatePDF(lineup: Lineup, bottles: Bottle[]): Promise<Blob> {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Pharmaceutical Packaging Lineup Report', 20, 20);
    
    // Lineup info
    doc.setFontSize(12);
    doc.text(`Lineup: ${lineup.name}`, 20, 35);
    doc.text(`Category: ${lineup.category}`, 20, 42);
    doc.text(`Created: ${lineup.createdAt.toLocaleDateString()}`, 20, 49);
    
    // Bottle specifications table
    doc.setFontSize(14);
    doc.text('Bottle Specifications', 20, 65);
    
    const tableData = bottles.map((bottle, index) => [
      index + 1,
      bottle.name,
      bottle.shape,
      `${bottle.volume.toFixed(1)} ml`,
      `${bottle.dimensions.height} mm`,
      `${bottle.dimensions.diameter} mm`,
      bottle.capStyle
    ]);
    
    doc.autoTable({
      startY: 70,
      head: [['#', 'Name', 'Shape', 'Volume', 'Height', 'Diameter', 'Cap']],
      body: tableData,
    });
    
    // Add screenshot of lineup
    // (captured separately and added as image)
    
    return doc.output('blob');
  }
  
  /**
   * Generate Excel spreadsheet
   */
  static generateExcel(lineup: Lineup, bottles: Bottle[]): Blob {
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['Lineup Name', lineup.name],
      ['Category', lineup.category],
      ['Total Bottles', bottles.length],
      ['Created', lineup.createdAt.toISOString()],
      ['Rating', lineup.rating],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Bottles sheet
    const bottleData = bottles.map(bottle => ({
      Name: bottle.name,
      Shape: bottle.shape,
      'Volume (ml)': bottle.volume,
      'Height (mm)': bottle.dimensions.height,
      'Body Height (mm)': bottle.dimensions.bodyHeight,
      'Diameter (mm)': bottle.dimensions.diameter,
      'Neck Height (mm)': bottle.dimensions.neckHeight,
      'Neck Diameter (mm)': bottle.dimensions.neckDiameter,
      'Cap Style': bottle.capStyle,
      Material: bottle.material,
    }));
    const bottleSheet = XLSX.utils.json_to_sheet(bottleData);
    XLSX.utils.book_append_sheet(workbook, bottleSheet, 'Bottles');
    
    // Positions sheet
    const positionData = lineup.positions.map((pos, index) => ({
      Position: index + 1,
      'Bottle ID': pos.bottleId,
      'X (mm)': pos.x,
      'Y (mm)': pos.y,
      'Rotation (°)': pos.rotation,
      Locked: pos.locked,
    }));
    const positionSheet = XLSX.utils.json_to_sheet(positionData);
    XLSX.utils.book_append_sheet(workbook, positionSheet, 'Positions');
    
    const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    return new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }
  
  /**
   * Capture viewport as image
   */
  static async captureImage(
    element: HTMLElement,
    format: 'png' | 'jpeg' = 'png'
  ): Promise<Blob> {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher resolution
    });
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, `image/${format}`);
    });
  }
}
```

---

## 9. Preset Templates

### 9.1 OTC Category Presets

```typescript
// data/presets/index.ts

export const presetTemplates: PresetTemplate[] = [
  {
    id: 'pain-relievers-standard',
    name: 'Pain Relievers - Standard Line',
    category: 'pain-relievers',
    description: 'Standard OTC pain reliever bottle lineup',
    defaultShape: 'boston-round',
    defaultCapStyle: 'child-resistant',
    defaultMaterial: 'HDPE',
    volumeRange: { min: 30, max: 500, typical: [50, 100, 200, 300, 500] },
    suggestedVolumes: [50, 100, 150, 200, 300, 500],
    typicalDimensions: {
      wallThickness: 1.5,
      shoulderAngle: 45,
      baseProfile: 'flat',
    },
    defaultColors: {
      body: '#FFFFFF',
      cap: '#FF0000',
    },
    isBuiltIn: true,
    createdAt: new Date(),
  },
  {
    id: 'cough-syrups-standard',
    name: 'Cough Syrups - Standard Line',
    category: 'cough-syrups',
    description: 'Liquid medicine bottles for cough syrups',
    defaultShape: 'boston-round',
    defaultCapStyle: 'screw-cap',
    defaultMaterial: 'PET',
    volumeRange: { min: 60, max: 350, typical: [60, 120, 180, 240, 350] },
    suggestedVolumes: [60, 120, 180, 240, 350],
    typicalDimensions: {
      wallThickness: 1.2,
      shoulderAngle: 30,
      baseProfile: 'concave',
    },
    defaultColors: {
      body: '#8B4513',
      cap: '#FFFFFF',
    },
    isBuiltIn: true,
    createdAt: new Date(),
  },
  {
    id: 'vitamins-standard',
    name: 'Vitamins - Standard Line',
    category: 'vitamins',
    description: 'Wide-mouth bottles for vitamin tablets and capsules',
    defaultShape: 'packer',
    defaultCapStyle: 'child-resistant',
    defaultMaterial: 'HDPE',
    volumeRange: { min: 75, max: 500, typical: [75, 150, 250, 400, 500] },
    suggestedVolumes: [75, 150, 250, 400, 500],
    typicalDimensions: {
      wallThickness: 2.0,
      shoulderAngle: 60,
      baseProfile: 'flat',
    },
    defaultColors: {
      body: '#FFFFFF',
      cap: '#228B22',
    },
    isBuiltIn: true,
    createdAt: new Date(),
  },
];
```

---

## 10. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Project setup with Vite + React + TypeScript
- [ ] Basic component structure
- [ ] Zustand store implementation
- [ ] Basic 3D scene with react-three-fiber
- [ ] Simple bottle geometry (cylinder)

### Phase 2: Bottle Generator (Week 3-4)
- [ ] All bottle shape geometries
- [ ] Volume calculation engine
- [ ] Parameter input controls
- [ ] Real-time 3D preview
- [ ] Cap style rendering

### Phase 3: Lineup Builder (Week 5-6)
- [ ] Drag and drop functionality
- [ ] Shelf 3D visualization
- [ ] Sorting algorithms
- [ ] Grid and measurement overlays
- [ ] Auto-positioning

### Phase 4: Comparison & Export (Week 7-8)
- [ ] Comparison mode UI
- [ ] Rating system
- [ ] PDF export
- [ ] Excel export
- [ ] Image capture

### Phase 5: Polish & Presets (Week 9-10)
- [ ] Preset templates
- [ ] Custom range editor
- [ ] UI/UX refinements
- [ ] Performance optimization
- [ ] Testing and bug fixes

### Future Phase: Physics Integration
- [ ] Cannon.js integration
- [ ] Pill/capsule/gummy models
- [ ] Fill simulation
- [ ] Stability testing

---

## 11. File Structure Summary

```
PACK2/
├── public/
│   └── assets/
│       └── textures/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── bottle-generator/
│   │   ├── lineup-builder/
│   │   ├── comparison-mode/
│   │   ├── presets/
│   │   ├── export/
│   │   ├── 3d/
│   │   └── ui/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   ├── types/
│   ├── utils/
│   ├── data/
│   │   └── presets/
│   ├── db/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── plans/
│   └── architecture-plan.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 12. Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.88.0",
    "three": "^0.158.0",
    "zustand": "^4.4.0",
    "immer": "^10.0.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@radix-ui/react-slider": "^1.1.0",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "framer-motion": "^10.16.0",
    "jspdf": "^2.5.0",
    "jspdf-autotable": "^3.8.0",
    "xlsx": "^0.18.0",
    "html2canvas": "^1.4.0",
    "dexie": "^3.2.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/three": "^0.158.0",
    "@types/uuid": "^9.0.0",
    "typescript": "^5.2.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

This architecture plan provides a comprehensive foundation for building the pharmaceutical packaging design application. The modular structure allows for incremental development and future expansion, particularly for the physics-based pill/capsule simulation feature.
