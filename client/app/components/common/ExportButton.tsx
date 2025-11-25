import React, { useState } from "react";
import { useDataExport, ExportColumns } from "~/lib/dataExport";

interface ExportButtonProps {
  data: any[];
  type: keyof typeof ExportColumns;
  label?: string;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  type,
  label = "Export",
  className = "",
  disabled = false,
  variant = 'outline'
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const { exportData } = useDataExport();

  const handleExport = async (format: 'csv' | 'json') => {
    if (disabled || isExporting) return;

    setIsExporting(true);
    setShowFormatMenu(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
      exportData(data, type, format);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getButtonStyles = () => {
    const baseStyles = "inline-flex items-center px-3 py-2 border text-sm leading-4 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500";
    
    if (disabled) {
      return `${baseStyles} border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 cursor-not-allowed`;
    }

    switch (variant) {
      case 'primary':
        return `${baseStyles} border-transparent text-white bg-teal-600 hover:bg-teal-700`;
      case 'secondary':
        return `${baseStyles} border-transparent text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-900 hover:bg-teal-200 dark:hover:bg-teal-800`;
      case 'outline':
      default:
        return `${baseStyles} border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700`;
    }
  };

  if (data.length === 0) {
    return (
      <button
        disabled
        className={`${getButtonStyles()} ${className}`}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        No Data to Export
      </button>
    );
  }

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setShowFormatMenu(!showFormatMenu)}
        disabled={disabled || isExporting}
        className={`${getButtonStyles()} ${className}`}
      >
        {isExporting ? (
          <>
            <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exporting...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {label} ({data.length})
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {showFormatMenu && !isExporting && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowFormatMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
            <div className="py-1">
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export as CSV
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">.csv</span>
              </button>
              
              <button
                onClick={() => handleExport('json')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Export as JSON
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">.json</span>
              </button>
            </div>
            
            {/* Info Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Exports {data.length} record{data.length !== 1 ? 's' : ''} with timestamp
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};