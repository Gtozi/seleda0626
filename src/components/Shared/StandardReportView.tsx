import { useState } from 'react';
import { FileText, FileSpreadsheet, ArrowLeft, Table2, BarChart3 } from 'lucide-react';
import {
  ReportTemplate,
  ReportGrid,
  ReportExport,
  type ExportOption,
} from './DashboardTemplate';
import { useStandardReports } from '../../hooks/useStandardReports';

const exportOptions: ExportOption[] = [
  { format: 'pdf', label: 'Export as PDF', icon: FileText, action: () => window.print() },
  { format: 'excel', label: 'Export as Excel', icon: FileSpreadsheet, action: () => console.log('Export Excel') },
];

interface StandardReportViewProps {
  department: string;
  title: string;
  subtitle: string;
}

function formatCellValue(val: any): string {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'number') return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (typeof val === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(val)) return new Date(val).toLocaleDateString();
    return val;
  }
  return JSON.stringify(val);
}

function ReportDetail({ reportId, reportTitle, data, onBack }: {
  reportId: string;
  reportTitle: string;
  data: any;
  onBack: () => void;
}) {
  const [view, setView] = useState<'summary' | 'table'>('summary');
  const summary = data?.summary || {};
  const rows = data?.data || [];
  const hasSummary = Object.keys(summary).length > 0;
  const hasRows = rows.length > 0;

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Reports
      </button>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm print-area">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{reportTitle}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Report ID: {reportId}</p>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setView('summary')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                view === 'summary' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <BarChart3 size={12} className="inline mr-1" />
              Summary
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                view === 'table' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Table2 size={12} className="inline mr-1" />
              Data Table
            </button>
          </div>
        </div>

        {data?.error && (
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400 text-xs font-bold mb-4">
            {data.error}
          </div>
        )}

        {view === 'summary' && (
          <>
            {hasSummary ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(summary).map(([key, val]: [string, any]) => (
                  <div key={key} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">{key.replace(/_/g, ' ')}</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">
                      {typeof val === 'number' ? val.toLocaleString(undefined, { maximumFractionDigits: 2 }) : String(val)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs font-bold">No summary data available for this report.</div>
            )}
          </>
        )}

        {view === 'table' && (
          <>
            {hasRows ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      {Object.keys(rows[0]).slice(0, 8).map((col) => (
                        <th key={col} className="text-left py-2 px-3 font-black text-slate-500 uppercase text-[9px] tracking-wider whitespace-nowrap">
                          {col.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 50).map((row: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        {Object.keys(rows[0]).slice(0, 8).map((col) => (
                          <td key={col} className="py-2 px-3 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                            {formatCellValue(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 50 && (
                  <p className="text-[10px] text-slate-400 font-bold mt-2 text-center">
                    Showing 50 of {rows.length} records
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs font-bold">No data records available for this report.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function StandardReportView({ department, title, subtitle }: StandardReportViewProps) {
  const {
    reports, reportData, loading, error, dateRange, customStartDate, customEndDate,
    handleDateRangeChange, handleCustomDateChange, generateReport, generatingId,
  } = useStandardReports(department);

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const handleReportClick = (reportId: string) => {
    setSelectedReportId(reportId);
    if (!reportData[reportId]) {
      generateReport(reportId);
    }
  };

  const handleBack = () => {
    setSelectedReportId(null);
  };

  const selectedReport = reports.find(r => r.id === selectedReportId);
  const selectedData = selectedReportId ? reportData[selectedReportId] : null;

  if (selectedReportId && selectedReport) {
    return (
      <ReportTemplate
        title={selectedReport.title}
        subtitle={`${title} › ${selectedReport.category || ''}`}
        showBackButton={true}
        onBack={handleBack}
        showDateRange={true}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onCustomDateChange={handleCustomDateChange}
        actions={<ReportExport options={exportOptions} onRefresh={() => generateReport(selectedReportId)} />}
      >
        {generatingId === selectedReportId && (
          <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400 text-xs font-bold animate-pulse">
            Generating report from database...
          </div>
        )}
        <ReportDetail
          reportId={selectedReportId}
          reportTitle={selectedReport.title}
          data={selectedData}
          onBack={handleBack}
        />
      </ReportTemplate>
    );
  }

  return (
    <ReportTemplate
      title={title}
      subtitle={subtitle}
      showDateRange={true}
      dateRange={dateRange}
      onDateRangeChange={handleDateRangeChange}
      customStartDate={customStartDate}
      customEndDate={customEndDate}
      onCustomDateChange={handleCustomDateChange}
      actions={<ReportExport options={exportOptions} onRefresh={() => window.location.reload()} />}
    >
      {loading && <div className="text-center py-12 text-slate-500 font-bold text-sm">Loading reports from database...</div>}
      {error && <div className="text-center py-12 text-red-500 font-bold text-sm">Error: {error}</div>}
      {!loading && !error && (
        <ReportGrid
          reports={reports}
          onReportClick={handleReportClick}
          columns={3}
          showCategories={true}
        />
      )}
    </ReportTemplate>
  );
}
