/**
 * Simulation Controller
 * Manages the drop timing, settling, redrop, and counting phases.
 * Runs inside the R3F render loop via useFrame.
 */

import { useRef, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useRapier } from '@react-three/rapier';
import { useStore, useFillSimulation, ProductBodyState } from '@/store';
import {
  getSpawnPosition,
  getRandomRotation,
  generateBodyId,
  isInsideBottle,
  calculateResults,
} from '@/services/fillSimulationService';

interface SpawnedBody {
  id: string;
  spawnTime: number;
}

const DROP_INTERVAL = 0.25; // seconds between drops
const SETTLE_DURATION = 2.0; // seconds to settle
const MAX_SIM_TIME = 60; // max total simulation time
const MAX_REDROP_PASSES = 2;

export default function SimulationController() {
  const { updateFillSimProgress, setFillSimResults } = useStore();
  const fillSim = useFillSimulation();
  const { world } = useRapier();
  
  const startTimeRef = useRef<number>(0);
  const lastDropTimeRef = useRef<number>(0);
  const droppedCountRef = useRef<number>(0);
  const spawnedBodiesRef = useRef<SpawnedBody[]>([]);
  const phaseRef = useRef<'dropping' | 'settling' | 'redropping' | 'counting' | 'idle'>('idle');
  const settleStartRef = useRef<number>(0);
  const redropPassRef = useRef<number>(0);
  const productBodiesRef = useRef<ProductBodyState[]>([]);
  
  const statusRef = useRef(fillSim.status);
  statusRef.current = fillSim.status;
  
  // Reset refs when simulation starts
  useEffect(() => {
    if (fillSim.status === 'running') {
      startTimeRef.current = performance.now() / 1000;
      lastDropTimeRef.current = 0;
      droppedCountRef.current = 0;
      spawnedBodiesRef.current = [];
      phaseRef.current = 'dropping';
      settleStartRef.current = 0;
      redropPassRef.current = 0;
      productBodiesRef.current = [];
    } else if (fillSim.status === 'configuring' || fillSim.status === 'idle') {
      phaseRef.current = 'idle';
      droppedCountRef.current = 0;
      spawnedBodiesRef.current = [];
      productBodiesRef.current = [];
    }
  }, [fillSim.status]);
  
  // Spawn a new product body
  const spawnProduct = useCallback(() => {
    if (!fillSim.fillBottle || !fillSim.fillProduct) return null;
    
    const position = getSpawnPosition(fillSim.fillBottle.dimensions);
    const rotation = getRandomRotation();
    const id = generateBodyId();
    
    const bodyState: ProductBodyState = {
      id,
      position,
      rotation,
      isInside: true, // assume inside until checked
    };
    
    productBodiesRef.current = [...productBodiesRef.current, bodyState];
    spawnedBodiesRef.current.push({ id, spawnTime: performance.now() / 1000 });
    droppedCountRef.current += 1;
    
    return bodyState;
  }, [fillSim.fillBottle, fillSim.fillProduct]);
  
  // Count products inside the bottle
  const countInside = useCallback(() => {
    if (!fillSim.fillBottle) return { inside: 0, outside: 0 };
    
    const dims = fillSim.fillBottle.dimensions;
    let inside = 0;
    let outside = 0;
    
    // Read positions from the Rapier world
    const updatedBodies: ProductBodyState[] = [];
    
    world.bodies.forEach((body) => {
      if (body.isDynamic()) {
        const translation = body.translation();
        const rotation = body.rotation();
        const pos: [number, number, number] = [translation.x, translation.y, translation.z];
        const rot: [number, number, number, number] = [rotation.x, rotation.y, rotation.z, rotation.w];
        const isIn = isInsideBottle(pos, dims);
        
        if (isIn) inside++;
        else outside++;
        
        updatedBodies.push({
          id: String(body.handle),
          position: pos,
          rotation: rot,
          isInside: isIn,
        });
      }
    });
    
    productBodiesRef.current = updatedBodies;
    return { inside, outside };
  }, [fillSim.fillBottle, world]);
  
  // Main simulation loop
  useFrame(() => {
    if (statusRef.current !== 'running' && statusRef.current !== 'settling' && statusRef.current !== 'redropping') {
      return;
    }
    
    const now = performance.now() / 1000;
    const elapsed = now - startTimeRef.current;
    
    // Safety timeout
    if (elapsed > MAX_SIM_TIME) {
      finishSimulation(elapsed);
      return;
    }
    
    switch (phaseRef.current) {
      case 'dropping': {
        // Drop products one at a time
        const timeSinceLastDrop = now - lastDropTimeRef.current;
        
        if (timeSinceLastDrop >= DROP_INTERVAL && droppedCountRef.current < fillSim.targetQuantity) {
          const body = spawnProduct();
          if (body) {
            lastDropTimeRef.current = now;
            
            // Update store periodically (every 5 drops to avoid too many updates)
            if (droppedCountRef.current % 5 === 0 || droppedCountRef.current === fillSim.targetQuantity) {
              updateFillSimProgress({
                droppedCount: droppedCountRef.current,
                elapsedTime: elapsed,
                productBodies: [...productBodiesRef.current],
              });
            }
          }
        }
        
        // All products dropped, move to settling
        if (droppedCountRef.current >= fillSim.targetQuantity) {
          phaseRef.current = 'settling';
          settleStartRef.current = now;
          updateFillSimProgress({
            status: 'settling',
            droppedCount: droppedCountRef.current,
            elapsedTime: elapsed,
          });
        }
        break;
      }
      
      case 'settling': {
        const settleElapsed = now - settleStartRef.current;
        
        // Update positions periodically
        if (Math.floor(settleElapsed * 4) !== Math.floor((settleElapsed - 0.016) * 4)) {
          const { inside } = countInside();
          updateFillSimProgress({
            insideCount: inside,
            elapsedTime: elapsed,
            productBodies: [...productBodiesRef.current],
          });
        }
        
        if (settleElapsed >= SETTLE_DURATION) {
          // Check for escaped products
          const { inside, outside } = countInside();
          
          if (outside > 0 && redropPassRef.current < MAX_REDROP_PASSES) {
            // Start redrop phase
            phaseRef.current = 'redropping';
            redropPassRef.current += 1;
            updateFillSimProgress({
              status: 'redropping',
              currentPass: redropPassRef.current,
              insideCount: inside,
              elapsedTime: elapsed,
            });
            
            // Reset escaped products to spawn position
            resetEscapedProducts();
            settleStartRef.current = now;
          } else {
            // Done - count and finish
            finishSimulation(elapsed);
          }
        }
        break;
      }
      
      case 'redropping': {
        const settleElapsed = now - settleStartRef.current;
        
        if (settleElapsed >= SETTLE_DURATION) {
          const { inside, outside } = countInside();
          
          if (outside > 0 && redropPassRef.current < MAX_REDROP_PASSES) {
            redropPassRef.current += 1;
            resetEscapedProducts();
            settleStartRef.current = now;
            updateFillSimProgress({
              currentPass: redropPassRef.current,
              insideCount: inside,
              elapsedTime: elapsed,
            });
          } else {
            finishSimulation(elapsed);
          }
        }
        break;
      }
    }
  });
  
  const resetEscapedProducts = useCallback(() => {
    if (!fillSim.fillBottle) return;
    
    const dims = fillSim.fillBottle.dimensions;
    
    world.bodies.forEach((body) => {
      if (body.isDynamic()) {
        const translation = body.translation();
        const pos: [number, number, number] = [translation.x, translation.y, translation.z];
        
        if (!isInsideBottle(pos, dims)) {
          // Reset to spawn position
          const newPos = getSpawnPosition(dims);
          body.setTranslation({ x: newPos[0], y: newPos[1], z: newPos[2] }, true);
          body.setLinvel({ x: 0, y: 0, z: 0 }, true);
          body.setAngvel({ x: 0, y: 0, z: 0 }, true);
        }
      }
    });
  }, [fillSim.fillBottle, world]);
  
  const finishSimulation = useCallback((elapsed: number) => {
    phaseRef.current = 'idle';
    
    const { inside } = countInside();
    
    if (fillSim.fillProduct && fillSim.fillBottle) {
      const results = calculateResults(
        fillSim.targetQuantity,
        productBodiesRef.current,
        fillSim.fillProduct,
        fillSim.fillBottle.volume,
        elapsed
      );
      results.productPositions = [...productBodiesRef.current];
      
      setFillSimResults(results);
    }
    
    updateFillSimProgress({
      insideCount: inside,
      elapsedTime: elapsed,
      productBodies: [...productBodiesRef.current],
    });
  }, [fillSim.fillProduct, fillSim.fillBottle, fillSim.targetQuantity, countInside, setFillSimResults, updateFillSimProgress]);
  
  // This component doesn't render anything visible
  return null;
}
