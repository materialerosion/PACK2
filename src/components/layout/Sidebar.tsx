/**
 * Sidebar Component
 * Control panel for bottle parameters and lineup settings
 */

import React from 'react';
import { useStore } from '@/store';
import { AnimatePresence, motion } from 'framer-motion';
import BottleGenerator from '../bottle-generator/BottleGenerator';
import LineupControls from '../lineup-builder/LineupControls';
import ComparisonPanel from '../comparison-mode/ComparisonPanel';
import PresetLibrary from '../presets/PresetLibrary';
import ExportPanel from '../export/ExportPanel';

export default function Sidebar() {
  const { ui } = useStore();
  
  const renderContent = () => {
    switch (ui.activeTab) {
      case 'generator':
        return <BottleGenerator />;
      case 'lineup':
        return <LineupControls />;
      case 'comparison':
        return <ComparisonPanel />;
      case 'presets':
        return <PresetLibrary />;
      case 'export':
        return <ExportPanel />;
      default:
        return <BottleGenerator />;
    }
  };
  
  return (
    <AnimatePresence>
      {ui.sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 360, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white border-r border-gray-200 overflow-hidden shrink-0"
        >
          <div className="w-[360px] h-full overflow-y-auto p-4">
            {renderContent()}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
