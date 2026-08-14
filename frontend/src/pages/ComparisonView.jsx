import React, { useState } from 'react';
import { GitCompare, Play, Award, Clock, Activity, Zap } from 'lucide-react';
import { compareAlgorithms, runWorkloadBenchmark } from '../api/client';

export default function ComparisonView() {
  const [loadingComp, setLoadingComp] = useState(false);
  const [loadingWorkload, setLoadingWorkload] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [workloadData, setWorkloadData] = useState(null);

  const handleRunComparison = async () => {
    setLoadingComp(true);
    try {
      const payload = {
        popSize: 100,
        generations: 150,
        crossoverRate: 0.85,
        mutationRate: 0.05,
        weightLatency: 0.4,
        weightEnergy: 0.3,
        weightCost: 0.3,
        seed: 42,
      };
      const res = await compareAlgorithms(payload);
      setComparisonData(res.data);
    } catch (err) {
      console.error("Comparison error:", err);
    } finally {
      setLoadingComp(false);
    }
  };

  const handleRunWorkloadBench = async () => {
    setLoadingWorkload(true);
    try {
      const res = await runWorkloadBenchmark();
      setWorkloadData(res.data);
    } catch (err) {
      console.error("Workload benchmark error:", err);
    } finally {
      setLoadingWorkload(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Launch Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <GitCompare className="w-6 h-6 text-purple-400" /> Multi-Algorithm Evaluation & Benchmarking
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Compare NSGA-II against Random, Round Robin, and Weighted Sum baselines using Hypervolume (HV) and Spacing (SP) metrics.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleRunComparison}
            disabled={loadingComp}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm transition-all shadow-lg shadow-purple-500/20"
          >
            {loadingComp ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            {loadingComp ? 'Evaluating...' : 'Run Side-by-Side Comparison'}
          </button>
          <button
            onClick={handleRunWorkloadBench}
            disabled={loadingWorkload}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-sm font-bold transition-all"
          >
            {loadingWorkload ? <Activity className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {loadingWorkload ? 'Benchmarking Workloads...' : 'Run Low/Med/High Workload Scaling'}
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      {comparisonData && (
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" /> Current Workload Metrics Comparison
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Total Benchmark Runtime: {comparisonData.totalBenchmarkTimeMs} ms
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/90 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Algorithm</th>
                  <th className="px-6 py-4">Hypervolume (HV) ↑</th>
                  <th className="px-6 py-4">Spacing (SP) ↓</th>
                  <th className="px-6 py-4">Avg Latency (ms) ↓</th>
                  <th className="px-6 py-4">Avg Energy (J) ↓</th>
                  <th className="px-6 py-4">Avg Cost ($) ↓</th>
                  <th className="px-6 py-4">Runtime (ms)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {comparisonData.metrics.map((m) => {
                  const isNsga = m.algorithmKey === 'NSGA_II';
                  return (
                    <tr key={m.algorithmKey} className={`hover:bg-slate-800/40 transition-colors ${
                      isNsga ? 'bg-cyan-500/10 font-semibold text-white' : ''
                    }`}>
                      <td className="px-6 py-4 flex items-center gap-2">
                        {isNsga && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
                        {m.algorithmName}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-cyan-300">
                        {m.hypervolume ? m.hypervolume.toFixed(2) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-mono text-purple-300">
                        {m.spacing ? m.spacing.toFixed(4) : '0.0000'}
                      </td>
                      <td className="px-6 py-4 font-mono">{m.avgLatency ? m.avgLatency.toFixed(2) : '0.00'}</td>
                      <td className="px-6 py-4 font-mono">{m.avgEnergy ? m.avgEnergy.toFixed(2) : '0.00'}</td>
                      <td className="px-6 py-4 font-mono">${m.avgCost ? m.avgCost.toFixed(4) : '0.0000'}</td>
                      <td className="px-6 py-4 font-mono text-slate-400">{m.executionTimeMs} ms</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dynamic Workload Scaling Grid */}
      {workloadData && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Zap className="w-5 h-5 text-cyan-400" /> Dynamic Workload Scaling Experiments
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {workloadData.workloads.map((wl, idx) => (
              <div key={idx} className="glass-card p-5 rounded-xl space-y-3">
                <div className="text-sm font-bold text-cyan-300 border-b border-slate-700/60 pb-2">
                  Workload: {wl.workloadName}
                </div>
                <div className="space-y-2 text-xs">
                  {wl.algorithmMetrics.map((m) => (
                    <div key={m.algorithmKey} className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg">
                      <span className="text-slate-300 font-medium">{m.algorithmName.split(' ')[0]}</span>
                      <span className="font-mono text-slate-400">{m.executionTimeMs} ms | HV: {m.hypervolume.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
