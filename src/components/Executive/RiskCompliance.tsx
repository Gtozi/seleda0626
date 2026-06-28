import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, History, ShieldCheck, Zap, Activity, Filter, Search } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

const RiskCompliance = () => {
  const { riskCompliance } = useERP();

  const criticalAlerts = riskCompliance.filter(r => r.status === 'Critical' || r.status === 'Expired').length;
  const upcomingAudits = riskCompliance.filter(r => {
    const today = new Date();
    const expiry = new Date(r.expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
  }).length;
  const compliantAssets = riskCompliance.filter(r => r.status === 'Good').length;
  const overallRiskScore = criticalAlerts > 0 ? 'High' : upcomingAudits > 2 ? 'Medium' : 'Low';
  const riskScoreValue = criticalAlerts > 0 ? 75 : upcomingAudits > 2 ? 45 : 12;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Overall Risk Score', value: overallRiskScore, sub: `Score: ${riskScoreValue}/100`, icon: ShieldCheck, color: overallRiskScore === 'High' ? 'text-rose-500' : overallRiskScore === 'Medium' ? 'text-amber-500' : 'text-emerald-500' },
          { label: 'Critical Alerts', value: String(criticalAlerts).padStart(2, '0'), sub: 'Action Required', icon: AlertTriangle, color: criticalAlerts > 0 ? 'text-rose-500' : 'text-emerald-500' },
          { label: 'Upcoming Audits', value: String(upcomingAudits), sub: 'Next 30 Days', icon: Activity, color: 'text-amber-500' },
          { label: 'Compliant Assets', value: `${((compliantAssets / Math.max(riskCompliance.length, 1)) * 100).toFixed(1)}%`, sub: `${compliantAssets}/${riskCompliance.length} Verified`, icon: ShieldAlert, color: 'text-indigo-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/30 border border-slate-150 dark:border-slate-700 p-6 rounded-[32px] shadow-3xs dark:shadow-slate-900/20">
            <stat.icon className={`mb-3 ${stat.color}`} size={18} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
         <div className="lg:col-span-8 bg-white dark:bg-slate-900/30 border border-slate-150 dark:border-slate-700 rounded-[32px] overflow-hidden shadow-3xs font-sans dark:shadow-slate-900/20">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
               <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Risk Exposure Registry</h3>
               <div className="flex gap-2">
                  <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"><Filter size={18} /></button>
               </div>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Expiry Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Risk Level</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {riskCompliance.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                       <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{r.title}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{r.category}</span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono">
                       <span className="text-xs font-bold text-slate-600">{new Date(r.expiryDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex justify-center">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                             r.status === 'Critical' || r.status === 'Expired' ? 'bg-rose-500 text-white' :
                             r.status === 'Warning' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {r.status}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className="text-[10px] font-black text-slate-400 uppercase">{r.owner}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>

         <div className="lg:col-span-4 bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden group">
            <Zap className="absolute -right-4 -top-4 w-32 h-32 text-white/5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700" />
            <div className="relative z-10">
               <h3 className="text-sm font-black uppercase tracking-tight mb-8">Strategic Compliance Audit</h3>
               <div className="space-y-6">
                  {[
                    { label: 'Cyber Security Protocol', date: '3 days ago', status: 'VERIFIED' },
                    { label: 'OHS Safety Framework', date: 'Last Week', status: 'AUDITED' },
                    { label: 'Financial Compliance', date: '2 weeks ago', status: 'CERTIFIED' },
                  ].map((audit, i) => (
                    <div key={i} className="flex justify-between items-start border-b border-white/10 pb-4">
                       <div>
                          <h5 className="text-xs font-black uppercase mb-1">{audit.label}</h5>
                          <span className="text-[10px] text-slate-400 font-medium">Last Audit: {audit.date}</span>
                       </div>
                        <div className="p-1 bg-white/10 rounded-full text-emerald-500">
                           <CheckCircle2 size={14} />
                        </div>
                    </div>
                  ))}
                  <button className="w-full mt-4 py-3 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition">
                     Generate Compliance Repo
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default RiskCompliance;
