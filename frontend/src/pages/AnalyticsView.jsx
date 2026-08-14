import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Download, 
  ScatterChart as ScatterIcon, 
  PieChart as PieIcon, 
  Cpu, 
  RefreshCw 
} from 'lucide-react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { getLatestResults, getEdgeServers, getCloudServers } from '../api/client';

export default function AnalyticsView() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const res = await getLatestResults();
      setAllocations(res.data);
    } catch (err) {
      console.error("Failed to load analytics data", err);
    } finally {
      setLoading(false);
    }
  };

  const exportAsCsv = () => {
    if (allocations.length === 0) return;
    const headers = "taskId,allocatedServerId,allocatedServerName,serverType,latency,energy,cost,executionTime\n";
    const rows = allocations.map(r => 
      `"${r.taskId}","${r.allocatedServerId}","${r.allocatedServerName}","${r.serverType}",${r.latency},${r.energy},${r.cost},${r.executionTime}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nsga2_allocations_export.csv';
    a.click();
  };

  const exportAsJson = () => {
    if (allocations.length === 0) return;
    const blob = new Blob([JSON.stringify(allocations, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nsga2_allocations_export.json';
    a.click();
  };

  // Prepare Pareto scatter data points
  const scatterData = allocations.map(a => ({
    taskId: a.taskId,
    latency: parseFloat((a.latency || 0).toFixed(2)),
    energy: parseFloat((a.energy || 0).toFixed(2)),
    cost: parseFloat((a.cost || 0).toFixed(4)),
    server: a.allocatedServerName,
    type: a.serverType,
  }));

  // Server distribution pie data
  const edgeCount = allocations.filter(a => a.serverType === 'EDGE').length;
  const cloudCount = allocations.filter(a => a.serverType === 'CLOUD').length;
  const pieData = [
    { name: 'Edge Nodes', value: edgeCount, color: '#10b981' },
    { name: 'Cloud Nodes', value: cloudCount, color: '#6366f1' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" /> Pareto Analytics & Visualizations
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            2D Pareto Front projections, resource distribution metrics, and data export.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportAsCsv}
            disabled={allocations.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={exportAsJson}
            disabled={allocations.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export JSON
          </button>
        </div>
      </div>

      {/* 2D Pareto Front Projections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Latency vs Energy Scatter */}
        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <ScatterIcon className="w-4 h-4 text-cyan-400" /> Pareto Trade-off: Latency vs Energy
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" dataKey="latency" name="Latency" unit="ms" stroke="#94a3b8" />
                <YAxis type="number" dataKey="energy" name="Energy" unit="J" stroke="#94a3b8" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Scatter name="Tasks" data={scatterData} fill="#38bdf8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latency vs Cost Scatter */}
        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <ScatterIcon className="w-4 h-4 text-emerald-400" /> Pareto Trade-off: Latency vs Execution Cost
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" dataKey="latency" name="Latency" unit="ms" stroke="#94a3b8" />
                <YAxis type="number" dataKey="cost" name="Cost" unit="$" stroke="#94a3b8" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Scatter name="Tasks" data={scatterData} fill="#34d399" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Task Distribution & Allocation Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pie Chart */}
        <div className="glass-panel p-5 rounded-2xl lg:col-span-1 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-indigo-400" /> Edge vs Cloud Task Allocation
          </h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Energy vs Cost Scatter */}
        <div className="glass-panel p-5 rounded-2xl lg:col-span-2 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <ScatterIcon className="w-4 h-4 text-purple-400" /> Trade-off: Energy Consumption vs Execution Cost
          </h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" dataKey="energy" name="Energy" unit="J" stroke="#94a3b8" />
                <YAxis type="number" dataKey="cost" name="Cost" unit="$" stroke="#94a3b8" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Scatter name="Tasks" data={scatterData} fill="#c084fc" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
