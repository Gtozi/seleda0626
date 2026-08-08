import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Search, 
  Filter, 
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

const ApplicantTracking = () => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'candidates' | 'interviews' | 'offers'>('pipeline');

  const hiringPipeline = [
    { 
      stage: 'Application Received',
      count: 142,
      color: 'bg-slate-400'
    },
    { 
      stage: 'Screening',
      count: 68,
      color: 'bg-blue-400'
    },
    { 
      stage: 'Interview',
      count: 24,
      color: 'bg-indigo-400'
    },
    { 
      stage: 'Assessment',
      count: 12,
      color: 'bg-purple-400'
    },
    { 
      stage: 'Background Check',
      count: 8,
      color: 'bg-amber-400'
    },
    { 
      stage: 'Offer',
      count: 5,
      color: 'bg-emerald-400'
    },
    { 
      stage: 'Hired',
      count: 3,
      color: 'bg-emerald-600'
    },
  ];

  const candidates = [
    { 
      id: 'CAND-001', 
      name: 'John Smith',
      position: 'Receptionist',
      department: 'Front Office',
      stage: 'Interview',
      appliedDate: '2024-06-15',
      rating: 4.5,
      status: 'Active',
      email: 'john.smith@email.com',
      phone: '+1 234 567 8900',
      location: 'New York, USA'
    },
    { 
      id: 'CAND-002', 
      name: 'Maria Garcia',
      position: 'Room Attendant',
      department: 'Housekeeping',
      stage: 'Screening',
      appliedDate: '2024-06-18',
      rating: 3.8,
      status: 'Active',
      email: 'maria.garcia@email.com',
      phone: '+1 234 567 8901',
      location: 'New York, USA'
    },
    { 
      id: 'CAND-003', 
      name: 'Carlos Ray',
      position: 'Line Cook',
      department: 'F&B',
      stage: 'Offer',
      appliedDate: '2024-06-10',
      rating: 4.8,
      status: 'Active',
      email: 'carlos.ray@email.com',
      phone: '+1 234 567 8902',
      location: 'New York, USA'
    },
    { 
      id: 'CAND-004', 
      name: 'Elena Martinez',
      position: 'Housekeeping Supervisor',
      department: 'Housekeeping',
      stage: 'Hired',
      appliedDate: '2024-06-05',
      rating: 5.0,
      status: 'Hired',
      email: 'elena.martinez@email.com',
      phone: '+1 234 567 8903',
      location: 'New York, USA'
    },
  ];

  const interviews = [
    { 
      id: 'INT-001', 
      candidate: 'John Smith',
      position: 'Receptionist',
      type: 'Technical Interview',
      date: '2024-06-28',
      time: '10:00 - 11:00',
      interviewer: 'Sarah Johnson',
      location: 'Conference Room A',
      status: 'Scheduled'
    },
    { 
      id: 'INT-002', 
      candidate: 'Carlos Ray',
      position: 'Line Cook',
      type: 'Practical Assessment',
      date: '2024-06-27',
      time: '14:00 - 16:00',
      interviewer: 'Executive Chef',
      location: 'Kitchen',
      status: 'Completed'
    },
    { 
      id: 'INT-003', 
      candidate: 'Maria Garcia',
      position: 'Room Attendant',
      type: 'HR Interview',
      date: '2024-06-29',
      time: '09:00 - 10:00',
      interviewer: 'HR Manager',
      location: 'HR Office',
      status: 'Scheduled'
    },
  ];

  const offers = [
    { 
      id: 'OFF-001', 
      candidate: 'Carlos Ray',
      position: 'Line Cook',
      department: 'F&B',
      salary: '$38,000',
      startDate: '2024-07-15',
      status: 'Accepted',
      sentDate: '2024-06-25',
      responseDate: '2024-06-26'
    },
    { 
      id: 'OFF-002', 
      candidate: 'John Smith',
      position: 'Receptionist',
      department: 'Front Office',
      salary: '$42,000',
      startDate: '2024-07-20',
      status: 'Pending',
      sentDate: '2024-06-27',
      responseDate: null
    },
    { 
      id: 'OFF-003', 
      candidate: 'Anna Kim',
      position: 'Bartender',
      department: 'F&B',
      salary: '$40,000',
      startDate: '2024-07-10',
      status: 'Declined',
      sentDate: '2024-06-20',
      responseDate: '2024-06-22'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Applicant Tracking (ATS)</h2>
          <p className="text-sm text-slate-500 mt-1">Manage candidates, interviews, and hiring workflow</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center gap-2 text-sm transition shadow-sm">
            <Plus size={16} />
            Add Candidate
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Candidates', value: '142', icon: Users, color: 'text-indigo-500' },
          { label: 'Active Interviews', value: '8', icon: Calendar, color: 'text-amber-500' },
          { label: 'Offers Sent', value: '5', icon: FileText, color: 'text-emerald-500' },
          { label: 'Hired This Month', value: '3', icon: CheckCircle2, color: 'text-blue-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm">
            <stat.icon className={`mb-3 ${stat.color}`} size={20} />
            <p className="text-xs font-medium text-slate-500 leading-none mb-1">{stat.label}</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg overflow-x-auto">
        {[
          { id: 'pipeline', label: 'Pipeline', icon: ChevronRight },
          { id: 'candidates', label: 'Candidates', icon: Users },
          { id: 'interviews', label: 'Interviews', icon: Calendar },
          { id: 'offers', label: 'Offers', icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pipeline Tab */}
      {activeTab === 'pipeline' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Hiring Pipeline</h3>
          </div>
          
          <div className="p-6">
            <div className="flex items-center gap-4 overflow-x-auto pb-4">
              {hiringPipeline.map((stage, index) => (
                <div key={index} className="flex-shrink-0 w-48">
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-400 uppercase">{stage.stage}</span>
                      <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-white">{stage.count}</p>
                    <p className="text-xs font-medium text-slate-400">candidates</p>
                  </div>
                  {index < hiringPipeline.length - 1 && (
                    <ChevronRight className="mx-2 text-slate-300" size={20} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Candidates Tab */}
      {activeTab === 'candidates' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Candidates</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search candidates..." 
                  className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                <Filter size={16} className="text-slate-400" />
              </button>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Candidate</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Position</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Stage</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Applied</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Rating</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {candidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white block">{candidate.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail size={10} className="text-slate-400" />
                        <span className="text-xs font-medium text-slate-400">{candidate.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">{candidate.position}</span>
                      <span className="text-xs font-medium text-slate-400">{candidate.department}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-medium">
                      {candidate.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{candidate.appliedDate}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="text-amber-400" size={12} fill="currentColor" />
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{candidate.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      candidate.status === 'Hired' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {candidate.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                        <FileText size={14} className="text-slate-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Interviews Tab */}
      {activeTab === 'interviews' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Interview Schedule</h3>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
              <Plus size={14} />
              Schedule Interview
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            {interviews.map((interview) => (
              <div key={interview.id} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
                      <Calendar className="text-indigo-600 dark:text-indigo-400" size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{interview.candidate}</h4>
                      <p className="text-xs font-medium text-slate-400">{interview.position} • {interview.type}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                    interview.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {interview.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-400">Date</span>
                    <p className="font-semibold text-slate-900 dark:text-white">{interview.date}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400">Time</span>
                    <p className="font-semibold text-slate-900 dark:text-white">{interview.time}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400">Location</span>
                    <p className="font-semibold text-slate-900 dark:text-white">{interview.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <Users size={12} className="text-slate-400" />
                  <span className="text-xs font-medium text-slate-400">Interviewer: {interview.interviewer}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offers Tab */}
      {activeTab === 'offers' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Job Offers</h3>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
              <Plus size={14} />
              Send Offer
            </button>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Candidate</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Position</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Salary</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Start Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Sent Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {offers.map((offer) => (
                <tr key={offer.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{offer.candidate}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">{offer.position}</span>
                      <span className="text-xs font-medium text-slate-400">{offer.department}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-white">{offer.salary}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{offer.startDate}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{offer.sentDate}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      offer.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600' : 
                      offer.status === 'Declined' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {offer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                        <FileText size={14} className="text-slate-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApplicantTracking;
