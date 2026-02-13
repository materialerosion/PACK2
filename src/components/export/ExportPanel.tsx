/**
 * Export Panel Component
 * Export lineup specifications as PDF, Excel, or images
 */

import { useState } from 'react';
import { useStore } from '@/store';
import { ExportFormat } from '@/types';
import { FileText, Table, Image, Download, Loader2 } from 'lucide-react';
import { exportService } from '@/services/exportService';

export default function ExportPanel() {
  const { lineups, activeLineupId, getBottlesForLineup } = useStore();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [includeSpecs, setIncludeSpecs] = useState(true);
  const [includeVisual, setIncludeVisual] = useState(true);
  
  const activeLineup = activeLineupId ? lineups[activeLineupId] : null;
  const lineupBottles = activeLineupId ? getBottlesForLineup(activeLineupId) : [];
  
  const formats: { id: ExportFormat; label: string; icon: React.ReactNode; description: string }[] = [
    { 
      id: 'pdf', 
      label: 'PDF Report', 
      icon: <FileText className="w-5 h-5" />,
      description: 'Detailed report with specifications and visuals'
    },
    { 
      id: 'excel', 
      label: 'Excel Spreadsheet', 
      icon: <Table className="w-5 h-5" />,
      description: 'Tabular data for analysis and editing'
    },
    { 
      id: 'image', 
      label: 'Image Screenshot', 
      icon: <Image className="w-5 h-5" />,
      description: 'PNG image of the lineup visualization'
    },
  ];
  
  const handleExport = async () => {
    if (!activeLineup || lineupBottles.length === 0) return;
    
    setIsExporting(true);
    
    try {
      let blob: Blob;
      let filename: string;
      
      switch (selectedFormat) {
        case 'pdf':
          blob = await exportService.generatePDF(activeLineup, lineupBottles, {
            includeSpecifications: includeSpecs,
            includeVisual: includeVisual,
          });
          filename = `${activeLineup.name.replace(/\s+/g, '_')}_report.pdf`;
          break;
          
        case 'excel':
          blob = exportService.generateExcel(activeLineup, lineupBottles);
          filename = `${activeLineup.name.replace(/\s+/g, '_')}_data.xlsx`;
          break;
          
        case 'image':
          const canvas = document.querySelector('.three-canvas canvas') as HTMLCanvasElement;
          if (canvas) {
            blob = await new Promise<Blob>((resolve) => {
              canvas.toBlob((b) => resolve(b!), 'image/png');
            });
          } else {
            throw new Error('Canvas not found');
          }
          filename = `${activeLineup.name.replace(/\s+/g, '_')}_lineup.png`;
          break;
          
        default:
          throw new Error('Unknown format');
      }
      
      // Download the file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Export Lineup</h2>
      
      {!activeLineup ? (
        <div className="text-center py-8 text-gray-500">
          <p>Select a lineup to export</p>
          <p className="text-sm mt-2">Go to Lineup Builder to create or select a lineup</p>
        </div>
      ) : (
        <>
          {/* Current lineup info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="font-medium text-gray-900">{activeLineup.name}</div>
            <div className="text-sm text-gray-500 mt-1">
              {lineupBottles.length} bottles • {activeLineup.settings.sortAlgorithm} sorting
            </div>
          </div>
          
          {/* Format selection */}
          <div>
            <label className="label">Export Format</label>
            <div className="space-y-2">
              {formats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left
                    ${selectedFormat === format.id 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className={`
                    p-2 rounded-lg
                    ${selectedFormat === format.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}
                  `}>
                    {format.icon}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{format.label}</div>
                    <div className="text-xs text-gray-500">{format.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Options */}
          {selectedFormat === 'pdf' && (
            <div className="space-y-3">
              <label className="label">Include in Report</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSpecs}
                  onChange={(e) => setIncludeSpecs(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Bottle specifications table</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeVisual}
                  onChange={(e) => setIncludeVisual(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Lineup visualization image</span>
              </label>
            </div>
          )}
          
          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={isExporting || lineupBottles.length === 0}
            className="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export {formats.find(f => f.id === selectedFormat)?.label}
              </>
            )}
          </button>
          
          {lineupBottles.length === 0 && (
            <p className="text-xs text-amber-600 text-center">
              Add bottles to the lineup before exporting
            </p>
          )}
          
          {/* Preview info */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>Export will include:</p>
            <ul className="list-disc list-inside ml-2">
              <li>Lineup name and settings</li>
              <li>All bottle dimensions and volumes</li>
              <li>Position data for each bottle</li>
              {selectedFormat === 'pdf' && includeVisual && <li>Visual representation</li>}
              {selectedFormat === 'excel' && <li>Multiple worksheets for easy analysis</li>}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
