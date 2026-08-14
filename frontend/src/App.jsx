import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import EdgeManagement from './pages/EdgeManagement';
import CloudManagement from './pages/CloudManagement';
import TaskGenerator from './pages/TaskGenerator';
import SchedulerView from './pages/SchedulerView';
import ComparisonView from './pages/ComparisonView';
import AnalyticsView from './pages/AnalyticsView';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActivePage = () => {
    switch (activeTab) {
      case 'edge':
        return <EdgeManagement />;
      case 'cloud':
        return <CloudManagement />;
      case 'tasks':
        return <TaskGenerator />;
      case 'scheduler':
        return <SchedulerView setActiveTab={setActiveTab} />;
      case 'comparison':
        return <ComparisonView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'dashboard':
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActivePage()}
      </main>

      <footer className="glass-panel border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        EdgeCloud-NSGA2 Platform &copy; 2026 — Pure-Java Multi-Objective Optimization Research Application
      </footer>
    </div>
  );
}
