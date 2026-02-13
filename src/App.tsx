/**
 * Main Application Component
 * PACK2 - Pharmaceutical Packaging Design Application
 */

import { useEffect } from 'react';
import { useStore } from './store';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import { Toaster } from './components/ui/Toaster';

function App() {
  const { settings } = useStore();
  
  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header />
      
      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content Area */}
        <MainContent />
      </div>
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}

export default App;
