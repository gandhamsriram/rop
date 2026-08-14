import React, { useEffect, useState } from 'react';
import { Server, Plus, Trash2, Edit3, Save, X, HardDrive, Cpu, Wifi, Zap } from 'lucide-react';
import { getEdgeServers, createEdgeServer, updateEdgeServer, deleteEdgeServer } from '../api/client';

export default function EdgeManagement() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    cpu: 2.4,
    ram: 8.0,
    storage: 128.0,
    bandwidth: 100.0,
    processingPower: 20.0,
    idlePower: 4.0,
  });

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    setLoading(true);
    try {
      const res = await getEdgeServers();
      setServers(res.data);
    } catch (err) {
      console.error("Failed to load edge servers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: `Edge-Node-${servers.length + 1}`,
      cpu: 2.4,
      ram: 8.0,
      storage: 128.0,
      bandwidth: 100.0,
      processingPower: 20.0,
      idlePower: 4.0,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (server) => {
    setEditingId(server.id);
    setFormData({
      name: server.name,
      cpu: server.cpu,
      ram: server.ram,
      storage: server.storage,
      bandwidth: server.bandwidth,
      processingPower: server.processingPower || 20.0,
      idlePower: server.idlePower || 4.0,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateEdgeServer(editingId, formData);
      } else {
        await createEdgeServer(formData);
      }
      setShowModal(false);
      loadServers();
    } catch (err) {
      console.error("Failed to save edge server", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Edge Server?")) {
      try {
        await deleteEdgeServer(id);
        loadServers();
      } catch (err) {
        console.error("Failed to delete edge server", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Server className="w-6 h-6 text-emerald-400" /> Edge Resource Management
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Configure local low-latency Edge server nodes, CPU compute capacity, RAM, Storage, and Bandwidth.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" /> Add Edge Server
        </button>
      </div>

      {/* Edge Servers Data Grid */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading Edge servers...</div>
        ) : servers.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No Edge servers configured yet. Click "Add Edge Server" to create one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Node Name</th>
                  <th className="px-6 py-4">CPU Speed</th>
                  <th className="px-6 py-4">RAM Capacity</th>
                  <th className="px-6 py-4">Storage</th>
                  <th className="px-6 py-4">Bandwidth</th>
                  <th className="px-6 py-4">Power Rate</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {servers.map((server) => (
                  <tr key={server.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      {server.name}
                    </td>
                    <td className="px-6 py-4">{server.cpu} GHz</td>
                    <td className="px-6 py-4">{server.ram} GB</td>
                    <td className="px-6 py-4">{server.storage} GB</td>
                    <td className="px-6 py-4">{server.bandwidth} Mbps</td>
                    <td className="px-6 py-4">{server.processingPower || 20} W</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(server)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                        title="Edit Server"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(server.id)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition-colors"
                        title="Delete Server"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingId ? 'Edit Edge Server' : 'Add Edge Server'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Server Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">CPU Speed (GHz)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.cpu}
                    onChange={(e) => setFormData({ ...formData, cpu: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">RAM Capacity (GB)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.ram}
                    onChange={(e) => setFormData({ ...formData, ram: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Storage (GB)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={formData.storage}
                    onChange={(e) => setFormData({ ...formData, storage: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bandwidth (Mbps)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={formData.bandwidth}
                    onChange={(e) => setFormData({ ...formData, bandwidth: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Processing Power Rate (Watts)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={formData.processingPower}
                  onChange={(e) => setFormData({ ...formData, processingPower: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
