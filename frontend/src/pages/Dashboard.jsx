import React, { useEffect, useState } from 'react';
import { 
  Server, 
  Cloud, 
  Cpu, 
  Clock, 
  Zap, 
  DollarSign, 
  PieChart, 
  Play, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { getEdgeServers, getCloudServers, getTasks, getLatestResults } from '../api/client';

export default function Dashboard({ setActiveTab }) {
  const [stats, setStats] = useState({
    edgeCount: 0,
    cloudCount: 0,
    taskCount: 0,
    allocations: [],
    avgLatency: 0,
    avgEnergy: 0,
    avgCost: 0,
    execTime: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [edgeRes, cloudRes, taskRes, resultRes] = await Promise.allSettled([
        getEdgeServers(),
        getCloudServers(),
        getTasks(),
        getLatestResults()
      ]);

      const edgeList = edgeRes.status === 'fulfilled' ? edgeRes.value.data : [];
      const cloudList = cloudRes.status === 'fulfilled' ? cloudRes.value.data : [];
      const taskList = taskRes.status === 'fulfilled' ? taskRes.value.data : [];
      const results = resultRes.status === 'fulfilled' ? resultRes.value.data : [];

      let avgLat = 0, avgEng = 0, avgCost = 0, execMs = 0;
      if (results.length > 0) {
        const totalLat = results.reduce((acc, r) => acc + (r.latency || 0), 0);
        const totalEng = results.reduce((acc, r) => acc + (r.energy || 0), 0);
        const totalCst = results.reduce((acc, r) => acc + (r.cost || 0), 0);
        avgLat = (totalLat / results.length).toFixed(2);
        avgEng = (totalEng / results.length).toFixed(2);
        avgCost = (totalCst / results.length).toFixed(4);
        execMs = results[0]?.executionTime || 0;
      }

      setStats({
        edgeCount: edgeList.length,
        cloudCount: cloudList.length,
        taskCount: taskList.length,
        allocations: results,
        avgLatency: avgLat,
        avgEnergy: avgEng,
        avgCost: avgCost,
        execTime: execMs,
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const edgeAssigned = stats.allocations.filter(r => r.serverType === 'EDGE').length;
  const cloudAssigned = stats.allocations.filter(r => r.serverType === 'CLOUD').length;

  return (
    <div className="space-y-6">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Research Multi-Objective Scheduler Platform
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            NSGA-II Edge–Cloud Resource Allocation
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Pareto-optimal scheduling platform optimizing Latency, Energy Consumption, Execution Cost, and Resource Utilization simultaneously.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('scheduler')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/20"
            >
              <Play className="w-4 h-4 fill-current" /> Execute Scheduler
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              View Benchmark Metrics <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">IoT Tasks</span>
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">{stats.taskCount}</div>
          <div className="text-xs text-slate-400 mt-1">Generated / Uploaded</div>
        </div>

        <div className="glass-card p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Edge Servers</span>
            <Server className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">{stats.edgeCount}</div>
          <div className="text-xs text-slate-400 mt-1">Low-latency Nodes</div>
        </div>

        <div className="glass-card p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cloud Servers</span>
            <Cloud className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">{stats.cloudCount}</div>
          <div className="text-xs text-slate-400 mt-1">High-capacity Compute</div>
        </div>

        <div className="glass-card p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Scheduler Runtime</span>
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">{stats.execTime} ms</div>
          <div className="text-xs text-slate-400 mt-1">Wall-clock execution</div>
        </div>

      </div>

      {/* Secondary Optimization Objectives Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="glass-card p-5 rounded-xl border-l-4 border-cyan-500">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase">Avg Task Latency</div>
              <div className="text-xl font-bold text-white">{stats.avgLatency} ms</div>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border-l-4 border-amber-500">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase">Avg Energy Consumed</div>
              <div className="text-xl font-bold text-white">{stats.avgEnergy} Joules</div>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border-l-4 border-emerald-500">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase">Avg Execution Cost</div>
              <div className="text-xl font-bold text-white">${stats.avgCost}</div>
            </div>
          </div>
        </div>

      </div>

      {/* Allocation Distribution Overview */}
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-cyan-400" /> Current Workload Task Distribution
        </h3>
        
        {stats.allocations.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No scheduling results recorded yet. Click <span className="text-cyan-400 font-semibold cursor-pointer" onClick={() => setActiveTab('scheduler')}>Execute Scheduler</span> to generate allocations.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="glass-card p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-sm font-medium text-slate-200">Allocated to Edge Nodes</span>
              </div>
              <div className="text-lg font-bold text-emerald-400">
                {edgeAssigned} tasks ({((edgeAssigned / stats.allocations.length) * 100).toFixed(1)}%)
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-indigo-400" />
                <span className="text-sm font-medium text-slate-200">Allocated to Cloud Nodes</span>
              </div>
              <div className="text-lg font-bold text-indigo-400">
                {cloudAssigned} tasks ({((cloudAssigned / stats.allocations.length) * 100).toFixed(1)}%)
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
