import React, { useEffect, useState } from 'react';
import { Cpu, Upload, RefreshCw, Trash2, Search, FileSpreadsheet, Zap } from 'lucide-react';
import { getTasks, generateTasks, uploadTasksCsv, clearTasks } from '../api/client';

export default function TaskGenerator() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customCount, setCustomCount] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await getTasks();
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (preset, countVal) => {
    setLoading(true);
    try {
      const res = await generateTasks({ preset, count: countVal || customCount });
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to generate tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadTasksCsv(formData);
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to upload tasks CSV", err);
      alert("Failed to parse CSV file. Ensure CSV has proper headers.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (window.confirm("Clear all IoT tasks from the database?")) {
      setLoading(true);
      try {
        await clearTasks();
        setTasks([]);
      } catch (err) {
        console.error("Failed to clear tasks", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.taskId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.priority.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      
      {/* Control Panel */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-400" /> IoT Task Workload Generator
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Generate synthetic workload distributions or upload custom CSV datasets to evaluate scheduler scalability.
          </p>
        </div>

        {/* Preset Buttons & Custom Generator */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
          
          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Quick Workload Presets</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleGenerate('LOW', 50)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-cyan-500/20 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" /> Low (50 Tasks)
              </button>
              <button
                onClick={() => handleGenerate('MEDIUM', 500)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-indigo-500/20 text-indigo-300 border border-slate-700 hover:border-indigo-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" /> Medium (500 Tasks)
              </button>
              <button
                onClick={() => handleGenerate('HIGH', 5000)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-purple-500/20 text-purple-300 border border-slate-700 hover:border-purple-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" /> High (5000 Tasks)
              </button>
            </div>
          </div>

          {/* Custom Count & Clear */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Custom Task Generator</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="10000"
                value={customCount}
                onChange={(e) => setCustomCount(parseInt(e.target.value) || 50)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white w-28 text-sm focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => handleGenerate('CUSTOM', customCount)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Generate
              </button>
              <button
                onClick={handleClear}
                className="ml-auto px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            </div>
          </div>

        </div>

        {/* CSV Drag and Drop Upload Area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
          className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
            dragOver ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <FileSpreadsheet className="w-8 h-8 text-cyan-400" />
            <div className="text-sm font-semibold text-slate-200">
              Drag & Drop CSV File here or <label className="text-cyan-400 cursor-pointer underline hover:text-cyan-300"><input type="file" accept=".csv" className="hidden" onChange={(e) => handleFileUpload(e.target.files[0])} />browse computer</label>
            </div>
            <p className="text-xs text-slate-500">
              Expected CSV Headers: taskId, cpuRequirement, ramRequirement, storageRequirement, taskSize, deadline, priority, executionTime
            </p>
          </div>
        </div>

      </div>

      {/* Task List Table Header & Search */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between gap-4">
        <div className="text-sm font-semibold text-slate-300">
          Total Tasks Loaded: <span className="text-cyan-400 font-bold">{tasks.length}</span>
        </div>
        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Task ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Tasks Table */}
      <div className="glass-panel rounded-2xl overflow-hidden max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading IoT Tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No matching IoT tasks found.</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800 sticky top-0 backdrop-blur-md">
              <tr>
                <th className="px-5 py-3">Task ID</th>
                <th className="px-5 py-3">CPU (GHz)</th>
                <th className="px-5 py-3">RAM (GB)</th>
                <th className="px-5 py-3">Storage (GB)</th>
                <th className="px-5 py-3">Payload Size</th>
                <th className="px-5 py-3">Deadline</th>
                <th className="px-5 py-3">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredTasks.slice(0, 200).map((task) => (
                <tr key={task.id || task.taskId} className="hover:bg-slate-800/30 font-mono text-xs">
                  <td className="px-5 py-2.5 font-bold text-cyan-300">{task.taskId}</td>
                  <td className="px-5 py-2.5">{task.cpuRequirement}</td>
                  <td className="px-5 py-2.5">{task.ramRequirement}</td>
                  <td className="px-5 py-2.5">{task.storageRequirement}</td>
                  <td className="px-5 py-2.5">{task.taskSize} MB</td>
                  <td className="px-5 py-2.5 text-amber-300">{task.deadline} ms</td>
                  <td className="px-5 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      task.priority >= 4 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-300'
                    }`}>
                      P{task.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
