import React, { useEffect, useState } from 'react';
import { Cloud, Plus, Trash2, Edit3, Save, X, DollarSign } from 'lucide-react';
import { getCloudServers, createCloudServer, updateCloudServer, deleteCloudServer } from '../api/client';

export default function CloudManagement() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    cpu: 3.4,
    ram: 32.0,
    storage: 1024.0,
    bandwidth: 1000.0,
    unitCost: 0.17,
    processingPower: 150.0,
    idlePower: 40.0,
  });

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    setLoading(true);
    try {
      const res = await getCloudServers();
      setServers(res.data);
    } catch (err) {
      console.error("Failed to load cloud servers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: `Cloud-Server-${servers.length + 1}`,
      cpu: 3.4,
      ram: 32.0,
      storage: 1024.0,
      bandwidth: 1000.0,
      unitCost: 0.17,
      processingPower: 150.0,
      idlePower: 40.0,
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
      unitCost: server.unitCost,
      processingPower: server.processingPower || 150.0,
      idlePower: server.idlePower || 40.0,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCloudServer(editingId, formData);
      } else {
        await createCloudServer(formData);
      }
      setShowModal(false);
      loadServers();
    } catch (err) {
      console.error("Failed to save cloud server", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Cloud Server?")) {
      try {
        await deleteCloudServer(id);
        loadServers();
      } catch (err) {
        console.error("Failed to delete cloud server", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Cloud className="w-6 h-6 text-indigo-400" /> Cloud Resource Management
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Configure high-capacity Cloud servers, pay-per-use unit pricing, WAN transfer rates, and compute specifications.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" /> Add Cloud Server
        </button>
      </div>

      {/* Data Grid */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading Cloud servers...</div>
        ) : servers.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No Cloud servers configured yet. Click "Add Cloud Server" to create one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Server Name</th>
                  <th className="px-6 py-4">CPU Speed</th>
                  <th className="px-6 py-4">RAM Capacity</th>
                  <th className="px-6 py-4">Storage</th>
                  <th className="px-6 py-4">WAN Bandwidth</th>
                  <th className="px-6 py-4">Unit Cost ($/hr)</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {servers.map((server) => (
                  <tr key={server.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      {server.name}
                    </td>
                    <td className="px-6 py-4">{server.cpu} GHz</td>
                    <td className="px-6 py-4">{server.ram} GB</td>
                    <td className="px-6 py-4">{server.storage} GB</td>
                    <td className="px-6 py-4">{server.bandwidth} Mbps</td>
                    <td className="px-6 py-4 font-mono text-emerald-400">${server.unitCost}</td>
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
                {editingId ? 'Edit Cloud Server' : 'Add Cloud Server'}
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none text-sm"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">RAM Capacity (GB)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={formData.ram}
                    onChange={(e) => setFormData({ ...formData, ram: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Storage (GB)</label>
                  <input
                    type="number"
                    step="10"
                    required
                    value={formData.storage}
                    onChange={(e) => setFormData({ ...formData, storage: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">WAN Bandwidth (Mbps)</label>
                  <input
                    type="number"
                    step="10"
                    required
                    value={formData.bandwidth}
                    onChange={(e) => setFormData({ ...formData, bandwidth: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Unit Cost ($ / compute hour)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.unitCost}
                  onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none text-sm"
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
                  className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save Cloud Server
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
