import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

const BusinessAdminAudit = () => {
  const { structuredAuditLogs } = useERP();

  const currentConfigLogs = structuredAuditLogs.filter(
    log => log.action?.includes('HOTEL') || log.action?.includes('BILLING') || log.action?.includes('CHANGE_CONTROL')
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in" id="config-logs-tab">
      <div className="bg-white rounded-3xl border border-slate-205 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-sm font-sans font-black uppercase tracking-wider text-slate-800">Business Admin Audit Logs</h3>
          <p className="text-xs text-slate-400">Verifiably track every alteration, configuration override, or parameter decision deployed on the system.</p>
        </div>

        <div className="divide-y divide-slate-100">
          {currentConfigLogs.map((log) => (
            <div key={log.id} className="p-5 hover:bg-slate-50/50 transition flex justify-between items-start gap-4">
              <div className="space-y-1.5">
                <div className="flex gap-2 items-center">
                  <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[8px] font-mono uppercase tracking-wider font-extrabold">{log.action}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{log.timestamp} &bull; User: {log.user}</span>
                </div>
                <p className="text-xs font-sans font-medium text-slate-800 leading-normal">{typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}</p>
                <p className="text-[10px] text-slate-400 font-mono">Terminal Target: {log.ipAddress || '127.0.0.1'}</p>
              </div>

              <div className="shrink-0 flex flex-col items-end">
                <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-mono uppercase font-black ${
                  log.severity === 'High' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                  log.severity === 'Medium' ? 'bg-amber-55 text-amber-600 border border-amber-100' : 'bg-slate-100 text-slate-500'
                }`}>
                  {log.severity} Priority
                </span>
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 mt-2 font-mono">
                  <CheckCircle2 size={12} /> SECURE
                </span>
              </div>
            </div>
          ))}
          {currentConfigLogs.length === 0 && (
            <div className="p-8 text-center text-xs font-sans text-slate-400">
              No corporate governance change logs have been recorded in this session. All systems operating with nominal base presets.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessAdminAudit;
