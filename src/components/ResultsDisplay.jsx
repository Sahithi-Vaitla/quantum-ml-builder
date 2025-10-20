import React from 'react';
import { Download, Activity, Zap, TrendingUp, Database } from 'lucide-react';

const ResultsDisplay = ({ results }) => {
  if (!results || !results.formattedResults) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No results to display. Run your workflow to see results here.</p>
      </div>
    );
  }

  const { formattedResults, isHybrid, summary } = results;

  const handleExport = (format) => {
    // Export functionality will be added
    console.log(`Exporting results as ${format}`);
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {formattedResults.title}
              </h2>
              {isHybrid && (
                <div className="flex items-center gap-1 mt-1">
                  <Zap className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    Hybrid Quantum-ML Workflow
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('json')}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {Object.entries(summary).map(([key, value]) => (
              <div
                key={key}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
              >
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {key}
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results Sections */}
      <div className="p-4 space-y-4">
        {formattedResults.sections.map((section, index) => (
          <Section key={index} section={section} />
        ))}
      </div>
    </div>
  );
};

// Section Component
const Section = ({ section }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5" />
          {section.name}
        </h3>
      </div>

      {/* Section Content */}
      <div className="p-4">
        {/* Key-Value Data */}
        {section.data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(section.data).map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {key}
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Chart */}
        {section.chart && <ChartDisplay chart={section.chart} />}

        {/* Table */}
        {section.table && <TableDisplay table={section.table} />}
      </div>
    </div>
  );
};

// Chart Display Component
const ChartDisplay = ({ chart }) => {
  if (chart.type === 'line') {
    return (
      <div className="mt-4">
        <div className="space-y-2">
          {chart.data.datasets.map((dataset, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {dataset.label}
                </span>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (dataset.data[dataset.data.length - 1] || 0) * 100)}%`,
                    backgroundColor: dataset.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (chart.type === 'bar') {
    return (
      <div className="mt-4">
        <div className="space-y-2">
          {chart.data.labels.map((label, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-20 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                {label}
              </div>
              <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-end px-2 transition-all"
                  style={{
                    width: `${chart.data.datasets[0].data[index] * 100}%`
                  }}
                >
                  <span className="text-xs font-bold text-white">
                    {(chart.data.datasets[0].data[index] * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

// Table Display Component
const TableDisplay = ({ table }) => {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            {table.headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-4 py-2 text-gray-900 dark:text-gray-100"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsDisplay;