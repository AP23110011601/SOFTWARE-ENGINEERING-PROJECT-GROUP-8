import React, { useState } from 'react';
import { Download, FileText, Database, Calendar, Filter } from 'lucide-react';

const DataExport = ({ data, title = "Export Data" }) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [selectedFields, setSelectedFields] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  // Available export formats
  const formats = [
    { value: 'csv', label: 'CSV', icon: Database },
    { value: 'json', label: 'JSON', icon: FileText },
    { value: 'excel', label: 'Excel', icon: FileText },
    { value: 'pdf', label: 'PDF', icon: FileText }
  ];

  // Common data fields for export
  const commonFields = [
    { value: 'timestamp', label: 'Timestamp', checked: true },
    { value: 'temperature', label: 'Temperature', checked: true },
    { value: 'humidity', label: 'Humidity', checked: true },
    { value: 'soilMoisture', label: 'Soil Moisture', checked: true },
    { value: 'ph', label: 'pH Level', checked: false },
    { value: 'rainfall', label: 'Rainfall', checked: false },
    { value: 'zone', label: 'Zone', checked: true },
    { value: 'alerts', label: 'Alerts', checked: false }
  ];

  const handleFieldToggle = (fieldValue) => {
    setSelectedFields(prev => 
      prev.includes(fieldValue) 
        ? prev.filter(f => f !== fieldValue)
        : [...prev, fieldValue]
    );
  };

  const generateCSV = (data, fields) => {
    if (!data || data.length === 0) return '';

    const headers = fields.join(',');
    const rows = data.map(item => 
      fields.map(field => {
        const value = item[field] || '';
        // Escape commas and quotes in CSV
        const escapedValue = String(value).replace(/"/g, '""');
        return `"${escapedValue}"`;
      }).join(',')
    ).join('\n');

    return `${headers}\n${rows}`;
  };

  const generateJSON = (data, fields) => {
    if (!data || data.length === 0) return '[]';

    const filteredData = data.map(item => {
      const filtered = {};
      fields.forEach(field => {
        if (item[field] !== undefined) {
          filtered[field] = item[field];
        }
      });
      return filtered;
    });

    return JSON.stringify(filteredData, null, 2);
  };

  const generateExcel = (data, fields) => {
    // For demo, we'll generate CSV that can be opened in Excel
    return generateCSV(data, fields);
  };

  const generatePDF = (data, fields) => {
    // For demo, we'll return a simple text format
    if (!data || data.length === 0) return 'No data available';

    let content = `${title}\n${'='.repeat(title.length)}\n\n`;
    content += `Generated: ${new Date().toLocaleString()}\n`;
    content += `Total Records: ${data.length}\n\n`;
    
    if (dateRange.start || dateRange.end) {
      content += `Date Range: ${dateRange.start || 'Start'} - ${dateRange.end || 'End'}\n\n`;
    }

    content += `Fields: ${fields.join(', ')}\n\n`;
    content += `${fields.join('\t')}\n`;
    
    data.forEach(item => {
      const row = fields.map(field => item[field] || '').join('\t');
      content += `${row}\n`;
    });

    return content;
  };

  const handleExport = async () => {
    if (!data || data.length === 0) {
      alert('No data available for export');
      return;
    }

    setIsExporting(true);

    try {
      const fieldsToExport = selectedFields.length > 0 
        ? selectedFields 
        : commonFields.filter(f => f.checked).map(f => f.value);

      let content = '';
      let filename = '';
      let mimeType = '';

      switch (exportFormat) {
        case 'csv':
          content = generateCSV(data, fieldsToExport);
          filename = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;
        case 'json':
          content = generateJSON(data, fieldsToExport);
          filename = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;
        case 'excel':
          content = generateExcel(data, fieldsToExport);
          filename = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;
        case 'pdf':
          content = generatePDF(data, fieldsToExport);
          filename = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
          mimeType = 'text/plain';
          break;
        default:
          content = generateCSV(data, fieldsToExport);
          filename = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log(` Exported ${data.length} records to ${exportFormat.toUpperCase()}`);
    } catch (error) {
      console.error(' Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
          <Download className="mr-2" size={20} />
          {title}
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {data?.length || 0} records
        </span>
      </div>

      {/* Export Format Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Export Format
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {formats.map(format => {
            const Icon = format.icon;
            return (
              <button
                key={format.value}
                onClick={() => setExportFormat(format.value)}
                className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all ${
                  exportFormat === format.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <Icon size={16} className="mr-2" />
                <span className="text-sm font-medium">{format.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          <Calendar className="inline mr-2" size={16} />
          Date Range (Optional)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200"
              placeholder="Start date"
            />
          </div>
          <div>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200"
              placeholder="End date"
            />
          </div>
        </div>
      </div>

      {/* Field Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          <Filter className="inline mr-2" size={16} />
          Select Fields to Export
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {commonFields.map(field => (
            <label key={field.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedFields.includes(field.value) || field.checked}
                onChange={() => handleFieldToggle(field.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{field.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting || !data || data.length === 0}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Exporting...
          </>
        ) : (
          <>
            <Download size={20} className="mr-2" />
            Export {exportFormat.toUpperCase()}
          </>
        )}
      </button>

      {/* Export Summary */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <div className="flex justify-between mb-1">
            <span>Total Records:</span>
            <span className="font-medium">{data?.length || 0}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Selected Fields:</span>
            <span className="font-medium">
              {selectedFields.length > 0 ? selectedFields.length : commonFields.filter(f => f.checked).length}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Format:</span>
            <span className="font-medium">{exportFormat.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExport;
