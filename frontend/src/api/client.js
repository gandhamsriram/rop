import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Edge Servers API
export const getEdgeServers = () => api.get('/servers/edge');
export const createEdgeServer = (data) => api.post('/servers/edge', data);
export const updateEdgeServer = (id, data) => api.put(`/servers/edge/${id}`, data);
export const deleteEdgeServer = (id) => api.delete(`/servers/edge/${id}`);

// Cloud Servers API
export const getCloudServers = () => api.get('/servers/cloud');
export const createCloudServer = (data) => api.post('/servers/cloud', data);
export const updateCloudServer = (id, data) => api.put(`/servers/cloud/${id}`, data);
export const deleteCloudServer = (id) => api.delete(`/servers/cloud/${id}`);

// Task API
export const getTasks = () => api.get('/tasks');
export const generateTasks = (data) => api.post('/tasks/generate', data);
export const uploadTasksCsv = (formData) => api.post('/tasks/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const clearTasks = () => api.delete('/tasks');

// Scheduler API
export const runScheduler = (requestData) => api.post('/scheduler/run', requestData);
export const getLatestResults = () => api.get('/scheduler/results');

// Evaluation & Benchmarking API
export const compareAlgorithms = (requestData) => api.post('/evaluation/compare', requestData);
export const runWorkloadBenchmark = () => api.post('/evaluation/workload');

export default api;
