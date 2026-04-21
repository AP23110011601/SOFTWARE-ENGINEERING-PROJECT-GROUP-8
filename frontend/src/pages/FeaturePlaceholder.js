import React from 'react';
import { useLocation } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Mapping pathnames to nice titles

const getTitleInfo = (pathname) => {
  const parts = pathname.split('/').pop().replace(/-/g, ' ');
  return parts.replace(/\b\w/g, c => c.toUpperCase());
};

const generateMockData = () => {
  return Array.from({ length: 7 }, () => Math.floor(Math.random() * 100));
};

export default function FeaturePlaceholder({ role }) {
  const location = useLocation();
  const title = getTitleInfo(location.pathname) || 'Dashboard Overview';

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: title + ' Data Trend',
        data: generateMockData(),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true, grid: { display: true, color: '#f3f4f6' } },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live {role} data monitoring (Mocking duplicate database values)
          </p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors shadow-sm">
          <RefreshCcw size={16} /> Sync Latest
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Current Performance', val: '86%', diff: '+2.4%', up: true },
          { label: 'Resource Utilization', val: '43%', diff: '-1.2%', up: false },
          { label: 'System Health', val: 'Optimal', diff: 'Stable', up: true }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-md transition-shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-4">{kpi.label}</h3>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">{kpi.val}</span>
              <span className={`flex items-center text-sm font-medium ${kpi.up ? 'text-green-600' : 'text-red-500'}`}>
                {kpi.up ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {kpi.diff}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart Area */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">7-Day Trend Analysis</h3>
        <div className="h-[300px] w-full">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Database Setup Banner */}
      <div className="bg-blue-50 w-full rounded-2xl p-6 border border-blue-100 flex items-start gap-4">
        <AlertCircle className="text-blue-500 shrink-0 mt-1" size={24} />
        <div>
          <h4 className="text-blue-800 font-semibold mb-1">Connecting to Live Hardware</h4>
          <p className="text-blue-600 text-sm">
            This module currently uses duplicate values during the testing phase. 
            Once successful working is verified, real IoT sensor values will stream automatically into this dashboard pane.
          </p>
        </div>
      </div>
    </div>
  );
}
