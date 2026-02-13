/**
 * Sidebar Component
 * Control panel for bottle parameters and lineup settings
 */

import { useState } from 'react';
import { useStore } from '@/store';
import { AnimatePresence, motion } from 'framer-motion';
import BottleGenerator from '../bottle-generator/BottleGenerator';
import SeriesGenerator from '../lineup-builder/SeriesGenerator';
import BatchEditor from '../lineup-builder/BatchEditor';
import IndividualEditor from '../lineup-builder/IndividualEditor';
import SeriesSelector from '../comparison-mode/SeriesSelector';
import PresetLibrary from '../presets/PresetLibrary';
import ExportPanel from '../export/ExportPanel';

type LineupSubTab = 'generate' | 'batch' | 'individual';

export default function Sidebar() {
  const { ui } = useStore();
  const [lineupSubTab, setLineupSubTab] = useState<LineupSubTab>('generate');
  const [editBottleIndex, setEditBottleIndex] = useState<number>(0);

  const renderContent = () => {
    switch (ui.activeTab) {
      case 'generator':
        return <BottleGenerator />;
      case 'lineup':
        return (
          <div className="space-y-4">
            {/* Sub-tab navigation */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <SubTabButton
                active={lineupSubTab === 'generate'}
                onClick={() => setLineupSubTab('generate')}
                label="Generate"
              />
              <SubTabButton
                active={lineupSubTab === 'batch'}
                onClick={() => setLineupSubTab('batch')}
                label="Batch Edit"
              />
              <SubTabButton
                active={lineupSubTab === 'individual'}
                onClick={() => setLineupSubTab('individual')}
                label="Edit Bottle"
              />
            </div>

            {/* Sub-tab content */}
            {lineupSubTab === 'generate' && <SeriesGenerator />}
            {lineupSubTab === 'batch' && <BatchEditor />}
            {lineupSubTab === 'individual' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600 font-medium">Bottle Index</label>
                  <input
                    type="number"
                    value={editBottleIndex}
                    onChange={(e) => setEditBottleIndex(Math.max(0, parseInt(e.target.value) || 0))}
                    min={0}
                    className="input text-sm"
                  />
                </div>
                <IndividualEditor bottleIndex={editBottleIndex} />
              </div>
            )}
          </div>
        );
      case 'comparison':
        return <SeriesSelector />;
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

// ─── Sub-tab Button ───────────────────────────────────────────────────

interface SubTabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

function SubTabButton({ active, onClick, label }: SubTabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors
        ${active
          ? 'bg-white shadow-sm text-gray-900'
          : 'text-gray-500 hover:text-gray-700'
        }
      `}
    >
      {label}
    </button>
  );
}
