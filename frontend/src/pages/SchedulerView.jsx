import React, { useState } from 'react';
import { Play, Sliders, CheckCircle2, Clock, Zap, DollarSign, Cpu, Activity } from 'lucide-react';
import { runScheduler } from '../api/client';

export default function SchedulerView({ setActiveTab }) {
  const [algorithm, setAlgorithm] = useState('NSGA_II');
  const [popSize, setPopSize] = useState(100);
  const [generations, setGenerations] = useState(150);
  const [crossoverRate, setCrossoverRate] = useState(0.85);
  const [mutationRate, setMutationRate] = useState(0.05);

  const [weightLatency, setWeightLatency] = useState(0.4);
  const [weightEnergy, setWeightEnergy] = useState(0.3);
  const [weightCost, setWeightCost] = useState(0.3);

  const [loading, setLoading] = useState(false);
  const [scheduleResponse, setScheduleResponse] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleRun = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const payload = {
        algorithm,
        popSize,
        generations,
        crossoverRate,
        mutationRate,
        weightLatency,
        weightEnergy,
        weightCost,
        seed: 42,
      };

      const res = await runScheduler(payload);
      setScheduleResponse(res.data);
    } catch (err) {
      console.error("Scheduler run error:", err);
      setErrorMsg(err.response?.data?.message || err.message || "Scheduler execution failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Control Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Algorithm Selection & Controls */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" /> Algorithm & Parameters
            </h3>

            {/* Algorithm Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Scheduler Algorithm
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'NSGA_II', name: 'NSGA-II (Multi-Objective)', desc: 'True Pareto-Optimal Genetic Sorter' },
                  { id: 'RANDOM', name: 'Random Allocation', desc: 'Uniform Random Server Selection' },
                  { id: 'ROUND_ROBIN', name: 'Round Robin', desc: 'Sequential Cyclical Assignment' },
                  { id: 'WEIGHTED_SUM', name: 'Weighted Sum (Single Obj)', desc: 'Classic Weighted Scalar Critique' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setAlgorithm(item.id)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      algorithm === item.id
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-sm font-bold">{item.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* NSGA-II Genetic Hyperparameters */}
            {algorithm === 'NSGA_II' && (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">NSGA-II Tuning</div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400">Pop Size</label>
                    <input
                      type="number"
                      value={popSize}
                      onChange={(e) => setPopSize(parseInt(e.target.value) || 100)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400">Generations</label>
                    <input
                      type="number"
                      value={generations}
                      onChange={(e) => setGenerations(parseInt(e.target.value) || 150)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400">Crossover Rate</label>
                    <input
                      type="number"
                      step="0.05"
                      value={crossoverRate}
                      onChange={(e) => setCrossoverRate(parseFloat(e.target.value) || 0.85)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400">Mutation Rate</label>
                    <input
                      type="number"
                      step="0.01"
                      value={mutationRate}
                      onChange={(e) => setMutationRate(parseFloat(e.target.value) || 0.05)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Weighted Sum Sliders */}
            {algorithm === 'WEIGHTED_SUM' && (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">Scalar Weights</div>
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Latency Weight (W_L)</span> <span>{weightLatency}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={weightLatency}
                    onChange={(e) => setWeightLatency(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Energy Weight (W_E)</span> <span>{weightEnergy}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={weightEnergy}
                    onChange={(e) => setWeightEnergy(parseFloat(e.target.value))}
                    className="w-full accent-amber-400"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Cost Weight (W_C)</span> <span>{weightCost}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={weightCost}
                    onChange={(e) => setWeightCost(parseFloat(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                </div>
              </div>
            )}

            {/* Run Button */}
            <button
              onClick={handleRun}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                loading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
              }`}
            >
              {loading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-cyan-400" /> Optimization Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Execute {algorithm} Scheduler
                </>
              )}
            </button>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {errorMsg}
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Execution Output & Allocations Grid */}
        <div className="lg:col-span-2 space-y-6">
          
          {!scheduleResponse ? (
            <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
              <Cpu className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
              <h4 className="text-lg font-bold text-slate-300">Ready to Execute Scheduler</h4>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Select your desired optimization algorithm on the left panel and click "Execute Scheduler" to run resource allocation.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Summary Performance Cards */}
              <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" /> Optimization Completed Successfully
                  </div>
                  <div className="text-xs font-mono bg-cyan-500/10 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/30 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Wall-clock: {scheduleResponse.executionTimeMs} ms
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="glass-card p-3 rounded-xl text-center">
                    <div className="text-xs text-slate-400">Total Latency</div>
                    <div className="text-lg font-bold text-cyan-300">{scheduleResponse.totalLatency.toFixed(2)} ms</div>
                  </div>
                  <div className="glass-card p-3 rounded-xl text-center">
                    <div className="text-xs text-slate-400">Total Energy</div>
                    <div className="text-lg font-bold text-amber-300">{scheduleResponse.totalEnergy.toFixed(2)} J</div>
                  </div>
                  <div className="glass-card p-3 rounded-xl text-center">
                    <div className="text-xs text-slate-400">Total Cost</div>
                    <div className="text-lg font-bold text-emerald-300">${scheduleResponse.totalCost.toFixed(4)}</div>
                  </div>
                  <div className="glass-card p-3 rounded-xl text-center">
                    <div className="text-xs text-slate-400">Avg Utilization</div>
                    <div className="text-lg font-bold text-purple-300">{scheduleResponse.averageUtilization.toFixed(1)}%</div>
                  </div>
                </div>
              </div>

              {/* Allocations Results Table */}
              <div className="glass-panel rounded-2xl overflow-hidden max-h-[420px] overflow-y-auto">
                <div className="p-4 bg-slate-900/80 font-bold text-sm text-white border-b border-slate-800 flex justify-between items-center">
                  <span>Task-to-Server Recommended Allocations ({scheduleResponse.results.length} Tasks)</span>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="text-xs text-cyan-400 hover:underline font-semibold"
                  >
                    View Pareto Front Scatter & Analytics →
                  </button>
                </div>

                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5">Task ID</th>
                      <th className="px-4 py-2.5">Allocated Server</th>
                      <th className="px-4 py-2.5">Server Type</th>
                      <th className="px-4 py-2.5">Latency</th>
                      <th className="px-4 py-2.5">Energy</th>
                      <th className="px-4 py-2.5">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {scheduleResponse.results.slice(0, 100).map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 font-mono">
                        <td className="px-4 py-2 font-bold text-cyan-300">{r.taskId}</td>
                        <td className="px-4 py-2 text-white">{r.allocatedServerName}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.serverType === 'EDGE'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}>
                            {r.serverType}
                          </span>
                        </td>
                        <td className="px-4 py-2">{r.latency?.toFixed(2)} ms</td>
                        <td className="px-4 py-2">{r.energy?.toFixed(2)} J</td>
                        <td className="px-4 py-2">${r.cost?.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
