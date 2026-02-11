/**
 * Header Component
 * Main navigation and app controls
 */

import React from 'react';
import { useStore } from '@/store';
import { 
  Menu, 
  Settings, 
  Download, 
  Sun, 
  Moon,
  Beaker,
  LayoutGrid,
  GitCompare,
  Library,
  FileDown
} from 'lucide-react';
import { AppTab } from '@/types';

const tabs: { id: AppTab; label: string; icon: React.ReactNode }[] = [
  { id: 'generator', label: 'Bottle Generator', icon: <Beaker className="w-4 h-4" /> },
  { id: 'lineup', label: 'Lineup Builder', icon: <LayoutGrid className="w-4 h-4" /> },
  { id: 'comparison', label: 'Compare', icon: <GitCompare className="w-4 h-4" /> },
  { id: 'presets', label: 'Presets', icon: <Library className="w-4 h-4" /> },
  { id: 'export', label: 'Export', icon: <FileDown className="w-4 h-4" /> },
];

export default function Header() {
  const { ui, settings, toggleSidebar, setActiveTab, updateSettings } = useStore();
  
  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' });
  };
  
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <Beaker className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">PACK2</span>
        </div>
      </div>
      
      {/* Center - Tabs */}
      <nav className="flex items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              transition-colors duration-200
              ${ui.activeTab === tab.id 
                ? 'bg-primary-50 text-primary-700' 
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            {tab.icon}
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </nav>
      
      {/* Right section */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle theme"
        >
          {settings.theme === 'light' ? (
            <Moon className="w-5 h-5 text-gray-600" />
          ) : (
            <Sun className="w-5 h-5 text-gray-600" />
          )}
        </button>
        
        <button
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </header>
  );
}
