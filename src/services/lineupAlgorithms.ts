/**
 * Lineup Algorithms Service
 * Algorithms for generating and sorting bottle lineups
 */

import { Bottle, SortAlgorithm, SortDirection, LineupSettings, LineupPosition } from '@/types';

/**
 * Lineup generation and sorting algorithms
 */
export class LineupAlgorithms {
  
  // Golden ratio constant
  private static readonly PHI = 1.618033988749895;
  
  /**
   * LINEAR PROGRESSION
   * Equal volume increments between bottles
   */
  static linear(
    minVolume: number,
    maxVolume: number,
    count: number
  ): number[] {
    if (count <= 1) return [minVolume];
    
    const step = (maxVolume - minVolume) / (count - 1);
    return Array.from({ length: count }, (_, i) => 
      Math.round(minVolume + step * i)
    );
  }
  
  /**
   * GOLDEN RATIO SPACING
   * Each bottle is approximately φ (1.618) times the previous
   */
  static goldenRatio(
    minVolume: number,
    maxVolume: number,
    count: number
  ): number[] {
    if (count <= 1) return [minVolume];
    
    // Calculate the ratio needed to span from min to max
    const neededRatio = Math.pow(maxVolume / minVolume, 1 / (count - 1));
    
    // Use golden ratio if it fits, otherwise use calculated ratio
    const ratio = neededRatio <= this.PHI ? this.PHI : neededRatio;
    
    const volumes: number[] = [];
    let currentVolume = minVolume;
    
    for (let i = 0; i < count; i++) {
      volumes.push(Math.round(currentVolume));
      currentVolume *= ratio;
      
      // Cap at max volume
      if (currentVolume > maxVolume && i < count - 1) {
        currentVolume = maxVolume;
      }
    }
    
    return volumes;
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
    if (count <= 1) return [minVolume];
    
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
      15, 30, 50, 60, 75, 100, 120, 150, 180, 
      200, 240, 250, 300, 350, 400, 450, 500,
      600, 750, 1000
    ];
    
    return standards.filter(v => v >= minVolume && v <= maxVolume);
  }
  
  /**
   * Generate volumes based on algorithm
   */
  static generateVolumes(
    algorithm: SortAlgorithm,
    minVolume: number,
    maxVolume: number,
    count: number
  ): number[] {
    switch (algorithm) {
      case 'linear':
        return this.linear(minVolume, maxVolume, count);
      case 'golden-ratio':
        return this.goldenRatio(minVolume, maxVolume, count);
      case 'logarithmic':
        return this.logarithmic(minVolume, maxVolume, count);
      case 'custom':
        // For custom, return linear as default
        return this.linear(minVolume, maxVolume, count);
      default:
        return this.linear(minVolume, maxVolume, count);
    }
  }
  
  /**
   * Calculate optimal spacing between bottles
   */
  static calculateSpacing(
    bottles: Bottle[],
    shelfWidth: number,
    minSpacing: number = 10
  ): number {
    if (bottles.length === 0) return minSpacing;
    
    const totalBottleWidth = bottles.reduce(
      (sum, b) => sum + b.dimensions.diameter, 0
    );
    const availableSpace = shelfWidth - totalBottleWidth;
    const gaps = bottles.length + 1;
    
    return Math.max(minSpacing, availableSpace / gaps);
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
   * Sort bottles by height
   */
  static sortByHeight(
    bottles: Bottle[],
    direction: SortDirection
  ): Bottle[] {
    return [...bottles].sort((a, b) => 
      direction === 'ascending' 
        ? a.dimensions.height - b.dimensions.height 
        : b.dimensions.height - a.dimensions.height
    );
  }
  
  /**
   * Sort bottles by diameter
   */
  static sortByDiameter(
    bottles: Bottle[],
    direction: SortDirection
  ): Bottle[] {
    return [...bottles].sort((a, b) => 
      direction === 'ascending' 
        ? a.dimensions.diameter - b.dimensions.diameter 
        : b.dimensions.diameter - a.dimensions.diameter
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
    if (bottles.length === 0) return [];
    
    // Sort bottles unless custom order
    const sorted = settings.sortAlgorithm === 'custom' 
      ? bottles 
      : this.sortByVolume(bottles, settings.sortDirection);
    
    const spacing = settings.spacing;
    
    // Calculate total width needed
    const totalBottleWidth = sorted.reduce(
      (sum, b) => sum + b.dimensions.diameter, 0
    );
    const totalWidth = totalBottleWidth + spacing * (sorted.length + 1);
    
    // Calculate starting position based on alignment
    let startX: number;
    switch (settings.alignment) {
      case 'left':
        startX = spacing;
        break;
      case 'right':
        startX = shelfWidth - totalWidth + spacing;
        break;
      case 'center':
      default:
        startX = (shelfWidth - totalWidth) / 2 + spacing;
        break;
    }
    
    let currentX = startX;
    
    return sorted.map(bottle => {
      const position: LineupPosition = {
        bottleId: bottle.id,
        x: currentX + bottle.dimensions.diameter / 2, // Center of bottle
        y: 0,
        rotation: 0,
        locked: false
      };
      
      currentX += bottle.dimensions.diameter + spacing;
      return position;
    });
  }
  
  /**
   * Snap position to grid
   */
  static snapToGrid(position: number, gridSize: number): number {
    return Math.round(position / gridSize) * gridSize;
  }
  
  /**
   * Check if bottles overlap
   */
  static checkOverlap(
    bottles: Bottle[],
    positions: LineupPosition[]
  ): { hasOverlap: boolean; overlappingPairs: [string, string][] } {
    const overlappingPairs: [string, string][] = [];
    
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const bottle1 = bottles.find(b => b.id === positions[i].bottleId);
        const bottle2 = bottles.find(b => b.id === positions[j].bottleId);
        
        if (!bottle1 || !bottle2) continue;
        
        const distance = Math.abs(positions[i].x - positions[j].x);
        const minDistance = (bottle1.dimensions.diameter + bottle2.dimensions.diameter) / 2;
        
        if (distance < minDistance) {
          overlappingPairs.push([positions[i].bottleId, positions[j].bottleId]);
        }
      }
    }
    
    return {
      hasOverlap: overlappingPairs.length > 0,
      overlappingPairs
    };
  }
  
  /**
   * Calculate visual harmony score (1-10)
   * Based on proportions and spacing consistency
   */
  static calculateHarmonyScore(
    bottles: Bottle[],
    positions: LineupPosition[]
  ): number {
    if (bottles.length < 2) return 10;
    
    let score = 10;
    
    // Check volume progression smoothness
    const volumes = bottles.map(b => b.volume).sort((a, b) => a - b);
    const volumeRatios: number[] = [];
    for (let i = 1; i < volumes.length; i++) {
      volumeRatios.push(volumes[i] / volumes[i - 1]);
    }
    
    // Penalize inconsistent ratios
    if (volumeRatios.length > 1) {
      const avgRatio = volumeRatios.reduce((a, b) => a + b, 0) / volumeRatios.length;
      const ratioVariance = volumeRatios.reduce(
        (sum, r) => sum + Math.pow(r - avgRatio, 2), 0
      ) / volumeRatios.length;
      
      score -= Math.min(3, ratioVariance);
    }
    
    // Check spacing consistency
    const spacings: number[] = [];
    for (let i = 1; i < positions.length; i++) {
      const bottle1 = bottles.find(b => b.id === positions[i - 1].bottleId);
      const bottle2 = bottles.find(b => b.id === positions[i].bottleId);
      if (bottle1 && bottle2) {
        const gap = Math.abs(positions[i].x - positions[i - 1].x) - 
                   (bottle1.dimensions.diameter + bottle2.dimensions.diameter) / 2;
        spacings.push(gap);
      }
    }
    
    if (spacings.length > 1) {
      const avgSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length;
      const spacingVariance = spacings.reduce(
        (sum, s) => sum + Math.pow(s - avgSpacing, 2), 0
      ) / spacings.length;
      
      score -= Math.min(2, spacingVariance / 100);
    }
    
    // Check height progression
    const heights = bottles.map(b => b.dimensions.height);
    const heightVariance = heights.reduce(
      (sum, h, _, arr) => sum + Math.pow(h - arr.reduce((a, b) => a + b, 0) / arr.length, 2), 0
    ) / heights.length;
    
    // Some height variance is good for visual interest
    if (heightVariance < 50) {
      score -= 1; // Too uniform
    } else if (heightVariance > 500) {
      score -= 2; // Too varied
    }
    
    return Math.max(1, Math.min(10, Math.round(score)));
  }
  
  /**
   * Calculate shelf presence score (1-10)
   * Based on how well the lineup fills the shelf
   */
  static calculateShelfPresenceScore(
    bottles: Bottle[],
    positions: LineupPosition[],
    shelfWidth: number
  ): number {
    if (bottles.length === 0) return 1;
    
    // Calculate coverage
    const totalBottleWidth = bottles.reduce(
      (sum, b) => sum + b.dimensions.diameter, 0
    );
    const coverage = totalBottleWidth / shelfWidth;
    
    // Optimal coverage is around 60-80%
    let score = 10;
    
    if (coverage < 0.3) {
      score -= 4; // Too sparse
    } else if (coverage < 0.5) {
      score -= 2;
    } else if (coverage > 0.9) {
      score -= 2; // Too crowded
    } else if (coverage > 0.95) {
      score -= 4;
    }
    
    // Check if lineup is centered
    if (positions.length > 0) {
      const leftmost = Math.min(...positions.map(p => p.x));
      const rightmost = Math.max(...positions.map(p => p.x));
      const center = (leftmost + rightmost) / 2;
      const shelfCenter = shelfWidth / 2;
      const centerOffset = Math.abs(center - shelfCenter) / shelfWidth;
      
      if (centerOffset > 0.2) {
        score -= 2;
      } else if (centerOffset > 0.1) {
        score -= 1;
      }
    }
    
    return Math.max(1, Math.min(10, Math.round(score)));
  }
}

export default LineupAlgorithms;
