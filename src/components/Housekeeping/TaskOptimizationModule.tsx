/**
 * Task Optimization Module
 * AI-powered room assignment optimization, route planning, and workload balancing
 */

import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Settings,
  BarChart3
} from 'lucide-react';

interface Housekeeper {
  id: string;
  name: string;
  status: 'active' | 'break' | 'off';
  currentTaskCount: number;
  avgTimePerRoom: number;
  qualityScore: number;
  assignedRooms: string[];
}

interface OptimizedTask {
  taskId: string;
  roomNumber: string;
  taskType: 'clean' | 'inspect' | 'maintenance' | 'turndown';
  priority: 'urgent' | 'normal' | 'low';
  estimatedDuration: number;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed';
  optimalOrder: number;
}

interface RouteOptimization {
  housekeeperId: string;
  route: string[];
  totalDistance: number;
  estimatedTime: number;
  efficiency: number;
}

const TaskOptimizationModule = () => {
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [optimizing, setOptimizing] = useState(false);

  // Mock data
  const housekeepers: Housekeeper[] = useMemo(() => [
    { id: 'HK-01', name: 'Sarah M.', status: 'active', currentTaskCount: 3, avgTimePerRoom: 28, qualityScore: 94, assignedRooms: ['101', '102', '103'] },
    { id: 'HK-02', name: 'John D.', status: 'active', currentTaskCount: 2, avgTimePerRoom: 32, qualityScore: 88, assignedRooms: ['201', '202'] },
    { id: 'HK-03', name: 'Maria G.', status: 'break', currentTaskCount: 1, avgTimePerRoom: 25, qualityScore: 97, assignedRooms: ['301'] },
    { id: 'HK-04', name: 'Ahmed K.', status: 'active', currentTaskCount: 4, avgTimePerRoom: 30, qualityScore: 91, assignedRooms: ['401', '402', '403', '404'] },
  ], []);

  const pendingTasks: OptimizedTask[] = useMemo(() => [
    { taskId: 'T1', roomNumber: '105', taskType: 'clean', priority: 'urgent', estimatedDuration: 30, status: 'pending', optimalOrder: 1 },
    { taskId: 'T2', roomNumber: '106', taskType: 'clean', priority: 'urgent', estimatedDuration: 30, status: 'pending', optimalOrder: 2 },
    { taskId: 'T3', roomNumber: '205', taskType: 'inspect', priority: 'normal', estimatedDuration: 15, status: 'pending', optimalOrder: 3 },
    { taskId: 'T4', roomNumber: '305', taskType: 'maintenance', priority: 'low', estimatedDuration: 45, status: 'pending', optimalOrder: 4 },
    { taskId: 'T5', roomNumber: '405', taskType: 'turndown', priority: 'normal', estimatedDuration: 20, status: 'pending', optimalOrder: 5 },
  ], []);

  const routeOptimizations: RouteOptimization[] = useMemo(() => [
    { housekeeperId: 'HK-01', route: ['101', '102', '103', '105'], totalDistance: 120, estimatedTime: 128, efficiency: 92 },
    { housekeeperId: 'HK-02', route: ['201', '202', '205'], totalDistance: 85, estimatedTime: 95, efficiency: 88 },
    { housekeeperId: 'HK-04', route: ['401', '402', '403', '404', '405'], totalDistance: 150, estimatedTime: 158, efficiency: 85 },
  ], []);

  const handleOptimize = () => {
    setOptimizing(true);
    setTimeout(() => {
      setOptimizing(false);
    }, 2000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'normal': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 dark:text-green-400';
      case 'break': return 'text-yellow-600 dark:text-yellow-400';
      case 'off': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Task Optimization</h2>
          <p className="text-slate-600 dark:text-slate-400">AI-powered task assignment and route planning</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600 dark:text-slate-400">Auto-optimize</label>
            <button
              onClick={() => setAutoOptimize(!autoOptimize)}
              className={`w-12 h-6 rounded-full transition-colors ${autoOptimize ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${autoOptimize ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <button
            onClick={handleOptimize}
            disabled={optimizing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {optimizing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4" />
                Run Optimization
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Active Staff</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{housekeepers.filter(h => h.status === 'active').length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Avg Efficiency</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">88%</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Pending Tasks</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{pendingTasks.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Time Saved</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">45 min</p>
        </div>
      </div>

      {/* Workload Balancing */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Workload Balancing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {housekeepers.map((housekeeper) => (
            <div key={housekeeper.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{housekeeper.name}</p>
                  <p className={`text-sm ${getStatusColor(housekeeper.status)}`}>{housekeeper.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{housekeeper.currentTaskCount}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">tasks</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Avg time/room</span>
                  <span className="text-slate-900 dark:text-white">{housekeeper.avgTimePerRoom} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Quality score</span>
                  <span className="text-slate-900 dark:text-white">{housekeeper.qualityScore}%</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Assigned rooms</p>
                <div className="flex flex-wrap gap-1">
                  {housekeeper.assignedRooms.map(room => (
                    <span key={room} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-xs">
                      {room}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Route Optimization */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Optimized Routes</h3>
        <div className="space-y-4">
          {routeOptimizations.map((route) => {
            const housekeeper = housekeepers.find(h => h.id === route.housekeeperId);
            return (
              <div key={route.housekeeperId} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{housekeeper?.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{route.route.length} rooms</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">Distance</p>
                      <p className="font-medium text-slate-900 dark:text-white">{route.totalDistance}m</p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">Est. time</p>
                      <p className="font-medium text-slate-900 dark:text-white">{route.estimatedTime} min</p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">Efficiency</p>
                      <p className="font-medium text-green-600 dark:text-green-400">{route.efficiency}%</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {route.route.map((room, index) => (
                    <React.Fragment key={room}>
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-sm font-medium">
                        {room}
                      </span>
                      {index < route.route.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority Task Queue */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Priority Task Queue</h3>
        <div className="space-y-3">
          {pendingTasks.map((task) => (
            <div key={task.taskId} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${task.priority === 'urgent' ? 'bg-red-500' : task.priority === 'normal' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Room {task.roomNumber}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">{task.taskType}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <div className="text-right">
                  <p className="text-sm text-slate-600 dark:text-slate-400">{task.estimatedDuration} min</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">Order: {task.optimalOrder}</p>
                </div>
                <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                  <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskOptimizationModule;
