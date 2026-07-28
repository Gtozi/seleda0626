import { useState, useEffect, useCallback } from 'react';
import type { DateRangeType } from '../components/Shared/DashboardTemplate';

export interface StandardReportItem {
  id: string;
  title: string;
  period: string;
  status: 'Finalized' | 'Draft' | 'Live' | 'In Review' | 'Audit Pending' | 'Synced';
  format: string;
  lastRun: string;
  category?: string;
  description?: string;
}

export interface ReportData {
  summary: Record<string, any>;
  data: any[];
  error?: string;
}

export interface UseStandardReportsResult {
  reports: StandardReportItem[];
  reportData: Record<string, ReportData>;
  loading: boolean;
  error: string | null;
  dateRange: DateRangeType;
  customStartDate: string;
  customEndDate: string;
  handleDateRangeChange: (range: DateRangeType) => void;
  handleCustomDateChange: (start: string, end: string) => void;
  generateReport: (reportId: string) => Promise<void>;
  generatingId: string | null;
}

export function useStandardReports(department: string): UseStandardReportsResult {
  const [reports, setReports] = useState<StandardReportItem[]>([]);
  const [reportData, setReportData] = useState<Record<string, ReportData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeType>('monthly');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const fetchMetadata = useCallback(async () => {
    try {
      const res = await fetch(`/api/standard-reports/${department}/metadata?rangeType=${dateRange}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Failed to fetch report metadata: ${res.statusText}`);
      const json = await res.json();
      setReports(json.reports || []);
    } catch (err: any) {
      setError(err.message);
    }
  }, [department, dateRange]);

  const fetchReportData = useCallback(async () => {
    try {
      const params = new URLSearchParams({ rangeType: dateRange });
      if (dateRange === 'custom' && customStartDate) params.set('customStart', customStartDate);
      if (dateRange === 'custom' && customEndDate) params.set('customEnd', customEndDate);

      const res = await fetch(`/api/standard-reports/${department}/data?${params}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Failed to fetch report data: ${res.statusText}`);
      const json = await res.json();
      setReportData(json.reports || {});
    } catch (err: any) {
      setError(err.message);
    }
  }, [department, dateRange, customStartDate, customEndDate]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchMetadata(), fetchReportData()]);
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [fetchMetadata, fetchReportData]);

  const handleDateRangeChange = useCallback((range: DateRangeType) => {
    setDateRange(range);
  }, []);

  const handleCustomDateChange = useCallback((start: string, end: string) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
  }, []);

  const generateReport = useCallback(async (reportId: string) => {
    setGeneratingId(reportId);
    try {
      const res = await fetch(`/api/standard-reports/${department}/${reportId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rangeType: dateRange, customStartDate, customEndDate }),
      });
      if (!res.ok) throw new Error(`Failed to generate report: ${res.statusText}`);
      const json = await res.json();
      setReportData(prev => ({ ...prev, [reportId]: json.data }));
      // Refresh metadata to update lastRun
      await fetchMetadata();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGeneratingId(null);
    }
  }, [department, dateRange, customStartDate, customEndDate, fetchMetadata]);

  return {
    reports,
    reportData,
    loading,
    error,
    dateRange,
    customStartDate,
    customEndDate,
    handleDateRangeChange,
    handleCustomDateChange,
    generateReport,
    generatingId,
  };
}
