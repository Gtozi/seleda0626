/**
 * Cross-Department Task Center
 * Coordinate activities involving multiple departments
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowRightLeft,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  MoreVertical,
  ChevronRight,
  Edit,
  Trash2,
  Link,
  Star,
  MapPin,
  Briefcase,
  Target,
  Flame,
  Heart,
  Wrench,
  X
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'vip-arrival' | 'wedding' | 'conference' | 'emergency' | 'maintenance' | 'renovation' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  departments: string[];
  assignedDepartments: Array<{ department: string; status: string; lead: string }>;
  startDate: string;
  endDate: string;
  progress: number;
  dependencies?: string[];
  createdBy: string;
  createdAt: string;
}

const CrossDepartmentTaskCenter: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'planning' | 'in-progress' | 'completed' | 'on-hold'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'vip-arrival' | 'wedding' | 'conference' | 'emergency' | 'maintenance' | 'renovation' | 'other'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const taskTypes = [
    { id: 'vip-arrival', name: 'VIP Arrival', icon: Star },
    { id: 'wedding', name: 'Wedding', icon: Heart },
    { id: 'conference', name: 'Conference', icon: Users },
    { id: 'emergency', name: 'Emergency', icon: Flame },
    { id: 'maintenance', name: 'Maintenance', icon: Wrench },
    { id: 'renovation', name: 'Renovation', icon: Briefcase },
    { id: 'other', name: 'Other', icon: Target }
  ];

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'VVIP Guest Arrival - Mr. John Smith',
      description: 'Complete preparation for VVIP guest including suite readiness, amenities, security, and transportation',
      type: 'vip-arrival',
      priority: 'critical',
      status: 'in-progress',
      departments: ['Front Office', 'Housekeeping', 'Engineering', 'Security', 'F&B', 'Transportation'],
      assignedDepartments: [
        { department: 'Front Office', status: 'completed', lead: 'Sarah Johnson' },
        { department: 'Housekeeping', status: 'in-progress', lead: 'Emily Brown' },
        { department: 'Engineering', status: 'completed', lead: 'Mike Wilson' },
        { department: 'Security', status: 'in-progress', lead: 'Robert Taylor' },
        { department: 'F&B', status: 'pending', lead: 'David Lee' },
        { department: 'Transportation', status: 'pending', lead: 'Chris Anderson' }
      ],
      startDate: '2026-07-31 10:00',
      endDate: '2026-07-31 14:00',
      progress: 65,
      createdBy: 'General Manager',
      createdAt: '1 day ago'
    },
    {
      id: '2',
      title: 'Johnson Wedding Reception Setup',
      description: 'Coordinate wedding reception setup including banquet preparation, decoration, audio-visual, and service staffing',
      type: 'wedding',
      priority: 'high',
      status: 'in-progress',
      departments: ['F&B', 'Events', 'Engineering', 'Housekeeping'],
      assignedDepartments: [
        { department: 'F&B', status: 'in-progress', lead: 'David Lee' },
        { department: 'Events', status: 'in-progress', lead: 'Jessica Martinez' },
        { department: 'Engineering', status: 'completed', lead: 'Mike Wilson' },
        { department: 'Housekeeping', status: 'pending', lead: 'Emily Brown' }
      ],
      startDate: '2026-07-31 08:00',
      endDate: '2026-07-31 19:00',
      progress: 45,
      createdBy: 'Events Manager',
      createdAt: '2 days ago'
    },
    {
      id: '3',
      title: 'TechCorp Annual Conference',
      description: 'Large-scale conference requiring coordination across all departments for 200 attendees',
      type: 'conference',
      priority: 'high',
      status: 'planning',
      departments: ['Front Office', 'F&B', 'Events', 'Engineering', 'IT', 'Security', 'Housekeeping'],
      assignedDepartments: [
        { department: 'Front Office', status: 'pending', lead: 'Sarah Johnson' },
        { department: 'F&B', status: 'pending', lead: 'David Lee' },
        { department: 'Events', status: 'pending', lead: 'Jessica Martinez' },
        { department: 'Engineering', status: 'pending', lead: 'Mike Wilson' },
        { department: 'IT', status: 'pending', lead: 'Kevin Chen' },
        { department: 'Security', status: 'pending', lead: 'Robert Taylor' },
        { department: 'Housekeeping', status: 'pending', lead: 'Emily Brown' }
      ],
      startDate: '2026-08-15 09:00',
      endDate: '2026-08-15 18:00',
      progress: 10,
      createdBy: 'Sales Director',
      createdAt: '1 week ago'
    },
    {
      id: '4',
      title: 'HVAC Emergency Repair - Floor 3',
      description: 'Emergency repair coordination for HVAC system failure affecting 12 rooms',
      type: 'emergency',
      priority: 'critical',
      status: 'in-progress',
      departments: ['Engineering', 'Front Office', 'Housekeeping'],
      assignedDepartments: [
        { department: 'Engineering', status: 'in-progress', lead: 'Mike Wilson' },
        { department: 'Front Office', status: 'completed', lead: 'Sarah Johnson' },
        { department: 'Housekeeping', status: 'completed', lead: 'Emily Brown' }
      ],
      startDate: '2026-07-31 06:00',
      endDate: '2026-07-31 18:00',
      progress: 75,
      createdBy: 'Duty Manager',
      createdAt: '6 hours ago'
    },
    {
      id: '5',
      title: 'Pool Area Renovation',
      description: 'Coordinate pool area renovation including construction, guest communication, and alternative arrangements',
      type: 'renovation',
      priority: 'medium',
      status: 'on-hold',
      departments: ['Engineering', 'Front Office', 'Housekeeping', 'Security'],
      assignedDepartments: [
        { department: 'Engineering', status: 'on-hold', lead: 'Mike Wilson' },
        { department: 'Front Office', status: 'on-hold', lead: 'Sarah Johnson' },
        { department: 'Housekeeping', status: 'on-hold', lead: 'Emily Brown' },
        { department: 'Security', status: 'on-hold', lead: 'Robert Taylor' }
      ],
      startDate: '2026-08-01 08:00',
      endDate: '2026-08-15 18:00',
      progress: 5,
      createdBy: 'General Manager',
      createdAt: '2 weeks ago'
    }
  ];

  useEffect(() => {
    setTasks(mockTasks);
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = selectedFilter === 'all' || task.status === selectedFilter;
    const matchesType = selectedType === 'all' || task.type === selectedType;
    const matchesSearch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesType && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'in-progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'planning':
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800';
      case 'on-hold':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-rose-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-amber-500 text-white';
      case 'low':
        return 'bg-slate-500 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    const typeObj = taskTypes.find(t => t.id === type);
    return typeObj ? typeObj.icon : Target;
  };

  const getDepartmentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-slate-400';
      case 'on-hold':
        return 'bg-amber-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <ArrowRightLeft size={28} />
            Cross-Department Task Center
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Coordinate activities involving multiple departments
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>
        
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value as any)}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
        >
          <option value="all">All Status</option>
          <option value="planning">Planning</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
        </select>
        
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as any)}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
        >
          <option value="all">All Types</option>
          {taskTypes.map(type => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <Target size={48} className="text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No tasks match your filters</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const TypeIcon = getTypeIcon(task.type);
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedTask?.id === task.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getPriorityColor(task.priority)}`}>
                      <TypeIcon size={18} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            {task.title}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                          <Users size={12} />
                          <span>{task.departments.length} departments</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                          <Calendar size={12} />
                          <span>{new Date(task.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                          <Clock size={12} />
                          <span>{task.progress}% complete</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Task Details */}
        <div className="lg:col-span-1">
          {selectedTask ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 sticky top-6">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white">Task Details</h3>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    {selectedTask.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {selectedTask.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-500">Status</p>
                    <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(selectedTask.status)}`}>
                      {selectedTask.status}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-500">Priority</p>
                    <span className={`text-xs px-2 py-0.5 rounded text-white ${getPriorityColor(selectedTask.priority)}`}>
                      {selectedTask.priority}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Start Date</span>
                    <span className="text-slate-900 dark:text-white">
                      {new Date(selectedTask.startDate).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">End Date</span>
                    <span className="text-slate-900 dark:text-white">
                      {new Date(selectedTask.endDate).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Created by</span>
                    <span className="text-slate-900 dark:text-white">
                      {selectedTask.createdBy}
                    </span>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                    Department Progress
                  </h5>
                  <div className="space-y-2">
                    {selectedTask.assignedDepartments.map((dept, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getDepartmentStatusColor(dept.status)}`} />
                        <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                          {dept.department}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-500">
                          {dept.lead}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                    Overall Progress
                  </h5>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                    <div
                      className="bg-indigo-600 h-3 rounded-full transition-all"
                      style={{ width: `${selectedTask.progress}%` }}
                    />
                  </div>
                  <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {selectedTask.progress}% complete
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center sticky top-6">
              <Target size={48} className="text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                Select a task to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrossDepartmentTaskCenter;