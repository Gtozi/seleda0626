
import React, { useState } from 'react';
import {
  MapPin,
  User,
  AlertTriangle,
  Plus,
  Wrench,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { WorkOrder, WorkOrderPriority, WorkOrderStatus } from '../../types/engineering';

const WorkOrderManagement: React.FC = () => {
  // Mock Data - Updated with new lifecycle and details per specification
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
    {
      id: 'WO-1024',
      number: 'WO-2026-001',
      requestDate: '2026-07-29 08:30',
      requestingDept: 'Housekeeping',
      location: 'Room 101',
      roomNumber: '101',
      priority: 'High',
      type: 'Plumbing',
      description: 'Water leak detected under bathroom sink. Guest reported dripping sounds.',
      status: 'In Progress',
      assignedTechnicianId: 'T-01',
      sla: '4 hours',
      asset: 'Bathroom Sink Fixtures',
      laborHours: 2.5,
      spareParts: ['P-Trap Assembly', 'Washers'],
      cost: 150,
      attachments: 2,
      photos: 3,
    },
    {
      id: 'WO-1025',
      number: 'WO-2026-002',
      requestDate: '2026-07-29 09:15',
      requestingDept: 'Front Office',
      location: 'Lobby',
      priority: 'Emergency',
      type: 'Electrical',
      description: 'Power outage in lobby reception area. All front desk terminals offline.',
      status: 'Assigned',
      assignedTechnicianId: 'T-03',
      sla: '30 minutes',
      asset: 'Main Distribution Panel',
      laborHours: 4,
      spareParts: ['Circuit Breaker 20A'],
      cost: 450,
      attachments: 1,
      photos: 2,
    },
    {
      id: 'WO-1026',
      number: 'WO-2026-003',
      requestDate: '2026-07-28 16:45',
      requestingDept: 'F&B',
      location: 'Main Kitchen',
      priority: 'Normal',
      type: 'Kitchen Equipment',
      description: 'Cold room door seal damaged. Losing temperature efficiency.',
      status: 'Waiting for Parts',
      assignedTechnicianId: 'T-02',
      sla: '24 hours',
      asset: 'Walk-in Cold Room',
      laborHours: 3,
      spareParts: ['Door Seal Gasket', 'Screws'],
      cost: 280,
      attachments: 3,
      photos: 4,
    },
    {
      id: 'WO-1027',
      number: 'WO-2026-004',
      requestDate: '2026-07-28 14:00',
      requestingDept: 'Management',
      location: 'Pool Area',
      priority: 'Low',
      type: 'Plumbing',
      description: 'Filter backwash required as per weekly schedule.',
      status: 'Completed',
      assignedTechnicianId: 'T-04',
      sla: '48 hours',
      asset: 'Pool Filtration System',
      laborHours: 1.5,
      spareParts: [],
      cost: 75,
      attachments: 0,
      photos: 1,
      completionNotes: 'Backwash completed successfully. Filter pressure normalized.',
    },
    {
      id: 'WO-1028',
      number: 'WO-2026-005',
      requestDate: '2026-07-28 10:30',
      requestingDept: 'Housekeeping',
      location: 'Room 205',
      roomNumber: '205',
      priority: 'High',
      type: 'HVAC',
      description: 'AC unit not cooling properly. Guest complaining about room temperature.',
      status: 'Waiting for Vendor',
      assignedTechnicianId: 'T-01',
      sla: '4 hours',
      asset: 'Split AC Unit',
      laborHours: 2,
      spareParts: ['Refrigerant R410A'],
      cost: 320,
      attachments: 2,
      photos: 2,
    },
    {
      id: 'WO-1029',
      number: 'WO-2026-006',
      requestDate: '2026-07-27 16:20',
      requestingDept: 'Security',
      location: 'Parking Lot',
      priority: 'Normal',
      type: 'Electrical',
      description: 'Parking lot light pole #3 not functioning. Safety concern.',
      status: 'Verified',
      assignedTechnicianId: 'T-03',
      sla: '24 hours',
      asset: 'Light Pole #3',
      laborHours: 1,
      spareParts: ['LED Bulb 100W'],
      cost: 85,
      attachments: 1,
      photos: 2,
      completionNotes: 'Replaced LED bulb. Light functioning. Verified by security team.',
    },
  ]);

  const [activeStatus, setActiveStatus] = useState<WorkOrderStatus | 'All'>('All');

  const getPriorityColor = (priority: WorkOrderPriority) => {
    switch (priority) {
      case 'Emergency': return 'bg-rose-500 text-white';
      case 'Critical': return 'bg-orange-500 text-white';
      case 'High': return 'bg-amber-500 text-white font-black';
      case 'Normal': return 'bg-blue-500 text-white';
      case 'Low': return 'bg-slate-500 text-white';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const getStatusBadge = (status: WorkOrderStatus) => {
    switch (status) {
      case 'Draft': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Submitted': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Approved': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Assigned': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'In Progress': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Waiting for Parts': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Waiting for Vendor': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Verified': return 'bg-teal-50 text-teal-700 border-teal-100';
      case 'Closed': return 'bg-slate-100 text-slate-400 border-slate-100';
      case 'Cancelled': return 'bg-rose-100 text-rose-600 border-rose-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const statuses: (WorkOrderStatus | 'All')[] = ['All', 'Draft', 'Submitted', 'Approved', 'Assigned', 'In Progress', 'Waiting for Parts', 'Waiting for Vendor', 'Completed', 'Verified', 'Closed', 'Cancelled'];

  return (
    <div className="space-y-6 text-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Work Order Management Console</h2>
           <p className="text-xs text-slate-400 font-medium tracking-tight">Enterprise Asset Management & Maintenance Flow</p>
        </div>
        <div className="flex items-center gap-2">
           <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
              <ClipboardList size={16} />
              PM Schedule
           </button>
           <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200 dark:shadow-none">
              <Plus size={16} />
              New Work Order
           </button>
        </div>
      </div>

      <div className="flex bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto no-scrollbar gap-1.5">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap uppercase tracking-tighter ${
              activeStatus === status 
                ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* List Section */}
         <div className="lg:col-span-8 space-y-4">
            {workOrders.map((wo) => (
              <div 
                key={wo.id} 
                className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-3xs group hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden"
              >
                {/* Priority Indicator Line */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${getPriorityColor(wo.priority).split(' ')[0]}`} />
                
                <div className="flex flex-col md:flex-row justify-between gap-4 ml-2">
                   <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                         <span className="text-[10px] font-mono font-black text-slate-400 group-hover:text-indigo-500 transition-colors uppercase tracking-widest">{wo.number}</span>
                         <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-tight ${getStatusBadge(wo.status)}`}>
                            {wo.status}
                         </span>
                         <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight ${getPriorityColor(wo.priority)}`}>
                            {wo.priority}
                         </span>
                      </div>

                      <div>
                         <h4 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white leading-tight">{wo.description}</h4>
                         <div className="flex items-center gap-3 mt-1.5">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                               <MapPin size={10} className="text-indigo-500" />
                               {wo.location}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                               <Wrench size={10} className="text-amber-500" />
                               {wo.type}
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="flex flex-row md:flex-col justify-between items-end md:items-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-6 pt-3 md:pt-0">
                      <div className="flex items-center gap-3">
                         <div className="text-right">
                            <span className="text-[9px] font-black text-slate-400 uppercase block tracking-tighter leading-none">Requested</span>
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block font-mono">{wo.requestDate.split(' ')[1]}</span>
                         </div>
                         <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <User size={14} />
                         </div>
                      </div>
                      
                      <button className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 transition">
                         <ChevronRight size={16} />
                      </button>
                   </div>
                </div>
              </div>
            ))}
         </div>

         {/* Sidebar Stats & Forms */}
         <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-6">
               <div>
                  <h3 className="text-sm font-sans font-extrabold leading-tight">Maintenance Workflow</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Operational Efficiency Track</p>
               </div>
               
               <div className="space-y-4">
                  {[
                    { label: 'Avg. Response Time', value: '18m', trend: '-2m' },
                    { label: 'Avg. Resolution Time', value: '1.2h', trend: '+5m' },
                    { label: 'Customer Satisfaction', value: '4.8/5', trend: '+0.2' },
                  ].map((s, i) => (
                    <div key={i} className="flex justify-between items-end border-b border-white/5 pb-2">
                       <div>
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{s.label}</span>
                          <span className="block text-xl font-black">{s.value}</span>
                       </div>
                       <span className="text-[10px] font-bold text-emerald-400">{s.trend}</span>
                    </div>
                  ))}
               </div>

               <div className="p-4 bg-white/5 rounded-2xl space-y-3">
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                     <AlertTriangle size={10} /> Emergency Response Alert
                  </span>
                  <p className="text-[10px] text-white/70 font-medium leading-relaxed italic">
                    "2 Critical electrical work orders active in Sector A. Supervisory presence required for load balancing verification."
                  </p>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4">
               <div>
                  <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Quick Ticket Dispatch</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Shift handovers & Guest reports</p>
               </div>
               
               <form className="space-y-4">
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Location</label>
                     <input type="text" placeholder="e.g. Room 104, Lobby Bar" className="w-full bg-slate-50 dark:bg-slate-850 border-none rounded-xl p-3 text-xs outline-none" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Priority Level</label>
                     <select className="w-full bg-slate-50 dark:bg-slate-850 border-none rounded-xl p-3 text-xs outline-none font-bold">
                        <option>Normal</option>
                        <option>High</option>
                        <option>Emergency</option>
                        <option>Low</option>
                     </select>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Issue Description</label>
                     <textarea placeholder="Describe the fault..." className="w-full bg-slate-50 dark:bg-slate-850 border-none rounded-xl p-3 text-xs outline-none min-h-[80px]" />
                  </div>
                  <button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition">
                     Dispatch Work Order
                  </button>
               </form>
            </div>
         </div>
      </div>
    </div>
  );
};

export default WorkOrderManagement;
