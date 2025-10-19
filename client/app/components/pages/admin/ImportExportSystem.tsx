import React, { useState, useRef } from "react";
import { useToast } from "~/components/common/ToastProvider";

interface ImportResult {
  success: number;
  errors: string[];
  warnings: string[];
  summary: {
    musicals: number;
    actors: number;
    performances: number;
    theaters: number;
    roles: number;
    castings: number;
  };
}

interface ExportConfig {
  format: 'csv' | 'json' | 'xml';
  entities: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  includeRelations: boolean;
}

interface DataMapping {
  sourceField: string;
  targetField: string;
  transform?: string;
  required: boolean;
}

const ImportExportSystem: React.FC = () => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'mapping'>('import');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'csv',
    entities: ['musicals'],
    includeRelations: false
  });
  
  const [mappings, setMappings] = useState<DataMapping[]>([
    { sourceField: 'title', targetField: 'title', required: true },
    { sourceField: 'description', targetField: 'description', required: false },
    { sourceField: 'genre', targetField: 'genre', required: false },
    { sourceField: 'duration_minutes', targetField: 'duration_minutes', transform: 'parseInt', required: false }
  ]);

  const entityOptions = [
    { value: 'musicals', label: 'Musicals' },
    { value: 'actors', label: 'Actors' },
    { value: 'theaters', label: 'Theaters' },
    { value: 'performances', label: 'Performances' },
    { value: 'roles', label: 'Roles' },
    { value: 'castings', label: 'Castings' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      previewFile(file);
    }
  };

  const previewFile = async (file: File) => {
    try {
      const text = await file.text();
      let data: any[] = [];
      
      if (file.name.endsWith('.json')) {
        const jsonData = JSON.parse(text);
        data = Array.isArray(jsonData) ? jsonData.slice(0, 5) : [jsonData];
      } else if (file.name.endsWith('.csv')) {
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        data = lines.slice(1, 6).map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          return obj;
        });
      } else if (file.name.endsWith('.xml')) {
        // Simple XML parsing - in real implementation, use a proper XML parser
        data = [{ note: 'XML parsing requires specialized handling' }];
      }
      
      setPreviewData(data);
      setShowPreview(true);
    } catch (error) {
      toast.addToast({ 
        type: 'error', 
        title: 'Failed to preview file',
        message: 'Unable to parse the selected file'
      });
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.addToast({ type: 'error', title: 'No file selected' });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult: ImportResult = {
        success: Math.floor(Math.random() * 50) + 10,
        errors: [
          'Row 5: Missing required field "title"',
          'Row 12: Invalid date format in "premiere_date"'
        ],
        warnings: [
          'Row 8: Genre "Drama-Comedy" not in standard list',
          'Row 15: Duration exceeds typical range'
        ],
        summary: {
          musicals: 15,
          actors: 0,
          performances: 0,
          theaters: 0,
          roles: 0,
          castings: 0
        }
      };
      
      setImportResult(mockResult);
      
      if (mockResult.errors.length === 0) {
        toast.addToast({ 
          type: 'success', 
          title: 'Import completed successfully',
          message: `Imported ${mockResult.success} records`
        });
      } else {
        toast.addToast({ 
          type: 'warning', 
          title: 'Import completed with warnings',
          message: `Imported ${mockResult.success} records with ${mockResult.errors.length} errors`
        });
      }
    } catch (error) {
      toast.addToast({ type: 'error', title: 'Import failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    if (exportConfig.entities.length === 0) {
      toast.addToast({ type: 'error', title: 'Please select at least one entity to export' });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate export process
      toast.addToast({ type: 'info', title: 'Preparing export...' });
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create mock export file
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const filename = `musical-tracker-export-${timestamp}.${exportConfig.format}`;
      
      let content = '';
      if (exportConfig.format === 'csv') {
        content = 'id,title,genre,duration_minutes\n1,"Hamilton","Hip-Hop Musical",160\n2,"The Lion King","Family Musical",150';
      } else if (exportConfig.format === 'json') {
        content = JSON.stringify([
          { id: 1, title: "Hamilton", genre: "Hip-Hop Musical", duration_minutes: 160 },
          { id: 2, title: "The Lion King", genre: "Family Musical", duration_minutes: 150 }
        ], null, 2);
      } else if (exportConfig.format === 'xml') {
        content = `<?xml version="1.0" encoding="UTF-8"?>
<musicals>
  <musical>
    <id>1</id>
    <title>Hamilton</title>
    <genre>Hip-Hop Musical</genre>
    <duration_minutes>160</duration_minutes>
  </musical>
  <musical>
    <id>2</id>
    <title>The Lion King</title>
    <genre>Family Musical</genre>
    <duration_minutes>150</duration_minutes>
  </musical>
</musicals>`;
      }
      
      // Download file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.addToast({ 
        type: 'success', 
        title: 'Export completed',
        message: `Downloaded ${filename}`
      });
    } catch (error) {
      toast.addToast({ type: 'error', title: 'Export failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  const addMapping = () => {
    setMappings([...mappings, { 
      sourceField: '', 
      targetField: '', 
      required: false 
    }]);
  };

  const updateMapping = (index: number, field: keyof DataMapping, value: any) => {
    const newMappings = [...mappings];
    newMappings[index] = { ...newMappings[index], [field]: value };
    setMappings(newMappings);
  };

  const removeMapping = (index: number) => {
    setMappings(mappings.filter((_, i) => i !== index));
  };

  const resetImport = () => {
    setImportFile(null);
    setImportResult(null);
    setPreviewData([]);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Import/Export System
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Import data from external systems or export your data in various formats
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'import', label: 'Import Data' },
            { key: 'export', label: 'Export Data' },
            { key: 'mapping', label: 'Field Mapping' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="max-w-4xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Import Data
            </h2>
            
            {!importResult ? (
              <div className="space-y-6">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="mt-4">
                        <label className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                            Drop files here or click to select
                          </span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="sr-only"
                            accept=".csv,.json,.xml"
                            onChange={handleFileSelect}
                          />
                        </label>
                        <p className="mt-1 text-xs text-gray-500">
                          Supported formats: CSV, JSON, XML (up to 10MB)
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {importFile && (
                    <div className="mt-3 flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {importFile.name} ({Math.round(importFile.size / 1024)} KB)
                        </span>
                      </div>
                      <button
                        onClick={resetImport}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Data Preview */}
                {showPreview && previewData.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Data Preview (first 5 rows)
                    </h3>
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                          <tr>
                            {Object.keys(previewData[0] || {}).map(key => (
                              <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {previewData.map((row, index) => (
                            <tr key={index}>
                              {Object.values(row).map((value: any, cellIndex) => (
                                <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                  {String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Import Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Skip duplicate records</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Validate data before import</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={resetImport}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={!importFile || isProcessing}
                    className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : 'Start Import'}
                  </button>
                </div>
              </div>
            ) : (
              /* Import Results */
              <div className="space-y-6">
                <div className="bg-teal-50 dark:bg-teal-900 border border-teal-200 dark:border-teal-700 rounded-md p-4">
                  <h3 className="text-lg font-medium text-teal-800 dark:text-teal-200 mb-2">
                    Import Complete
                  </h3>
                  <p className="text-teal-700 dark:text-teal-300">
                    Successfully processed {importResult.success} records
                  </p>
                </div>

                {/* Summary */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Object.entries(importResult.summary).map(([entity, count]) => (
                      <div key={entity} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-teal-600">{count}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                          {entity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Errors and Warnings */}
                {(importResult.errors.length > 0 || importResult.warnings.length > 0) && (
                  <div className="space-y-4">
                    {importResult.errors.length > 0 && (
                      <div>
                        <h4 className="text-md font-medium text-red-600 mb-2">Errors ({importResult.errors.length})</h4>
                        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4">
                          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                            {importResult.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {importResult.warnings.length > 0 && (
                      <div>
                        <h4 className="text-md font-medium text-yellow-600 mb-2">Warnings ({importResult.warnings.length})</h4>
                        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-md p-4">
                          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                            {importResult.warnings.map((warning, index) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={resetImport}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                  >
                    Import Another File
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="max-w-4xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Export Data
            </h2>
            
            <div className="space-y-6">
              {/* Export Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Export Format
                </label>
                <div className="flex space-x-4">
                  {['csv', 'json', 'xml'].map(format => (
                    <label key={format} className="flex items-center">
                      <input
                        type="radio"
                        value={format}
                        checked={exportConfig.format === format}
                        onChange={(e) => setExportConfig(prev => ({ ...prev, format: e.target.value as any }))}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 uppercase">
                        {format}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Entities to Export */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data to Export
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {entityOptions.map(entity => (
                    <label key={entity.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportConfig.entities.includes(entity.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setExportConfig(prev => ({
                              ...prev,
                              entities: [...prev.entities, entity.value]
                            }));
                          } else {
                            setExportConfig(prev => ({
                              ...prev,
                              entities: prev.entities.filter(e => e !== entity.value)
                            }));
                          }
                        }}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {entity.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setExportConfig(prev => ({
                          ...prev,
                          dateRange: { start: '', end: '' }
                        }));
                      } else {
                        setExportConfig(prev => ({
                          ...prev,
                          dateRange: undefined
                        }));
                      }
                    }}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Filter by Date Range
                  </span>
                </label>
                
                {exportConfig.dateRange && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={exportConfig.dateRange.start}
                        onChange={(e) => setExportConfig(prev => ({
                          ...prev,
                          dateRange: prev.dateRange ? { ...prev.dateRange, start: e.target.value } : undefined
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">End Date</label>
                      <input
                        type="date"
                        value={exportConfig.dateRange.end}
                        onChange={(e) => setExportConfig(prev => ({
                          ...prev,
                          dateRange: prev.dateRange ? { ...prev.dateRange, end: e.target.value } : undefined
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Options */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportConfig.includeRelations}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, includeRelations: e.target.checked }))}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Include related data (performances with actors, etc.)
                  </span>
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleExport}
                  disabled={exportConfig.entities.length === 0 || isProcessing}
                  className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Exporting...
                    </>
                  ) : 'Export Data'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Field Mapping Tab */}
      {activeTab === 'mapping' && (
        <div className="max-w-6xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Field Mapping Configuration
              </h2>
              <button
                onClick={addMapping}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm"
              >
                Add Mapping
              </button>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Configure how fields from imported files map to your database fields
            </p>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Source Field
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Target Field
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Transform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Required
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {mappings.map((mapping, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={mapping.sourceField}
                          onChange={(e) => updateMapping(index, 'sourceField', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white text-sm"
                          placeholder="source_field_name"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={mapping.targetField}
                          onChange={(e) => updateMapping(index, 'targetField', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white text-sm"
                        >
                          <option value="">Select target field</option>
                          <option value="title">Title</option>
                          <option value="description">Description</option>
                          <option value="genre">Genre</option>
                          <option value="duration_minutes">Duration (minutes)</option>
                          <option value="premiere_date">Premiere Date</option>
                          <option value="composer">Composer</option>
                          <option value="lyricist">Lyricist</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={mapping.transform || ''}
                          onChange={(e) => updateMapping(index, 'transform', e.target.value || undefined)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white text-sm"
                        >
                          <option value="">None</option>
                          <option value="parseInt">Parse Integer</option>
                          <option value="parseFloat">Parse Float</option>
                          <option value="toLowerCase">To Lowercase</option>
                          <option value="toUpperCase">To Uppercase</option>
                          <option value="trim">Trim Whitespace</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={mapping.required}
                          onChange={(e) => updateMapping(index, 'required', e.target.checked)}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => removeMapping(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                Save Mapping Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportExportSystem;