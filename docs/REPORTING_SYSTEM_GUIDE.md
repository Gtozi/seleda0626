# Standardized Reporting System

## Overview

The Standardized Reporting System provides a comprehensive set of reusable reporting components based on the Finance Portal's reporting structure. These components can be used across all portals (Finance, Executive, Front Office, Housekeeping, etc.) to ensure consistent reporting UI/UX.

## Components

All components are exported from `src/components/Shared/DashboardTemplate.tsx`

### ReportCard

Standardized card for displaying individual reports in a listing view.

**Props:**
- `report: ReportItem` - The report data to display
- `onClick: () => void` - Click handler for the card
- `onDownload?: () => void` - Optional download handler
- `className?: string` - Additional CSS classes

**ReportItem Interface:**
```typescript
interface ReportItem {
  id: string;
  title: string;
  period: string;
  status: 'Finalized' | 'Draft' | 'Live' | 'In Review' | 'Audit Pending' | 'Synced';
  format: string;
  lastRun: string;
  description?: string;
  category?: string;
}
```

**Usage:**
```typescript
import { ReportCard, ReportItem } from '@/components/Shared/DashboardTemplate';

const report: ReportItem = {
  id: 'tb-001',
  title: 'Trial Balance',
  period: 'April 2024',
  status: 'Finalized',
  format: 'PDF/XLS',
  lastRun: '2 days ago',
  description: 'Monthly trial balance report'
};

<ReportCard 
  report={report} 
  onClick={() => console.log('Clicked')}
  onDownload={() => console.log('Download')}
/>
```

### ReportGrid

Grid container for displaying multiple ReportCard components with optional category grouping.

**Props:**
- `reports: ReportItem[]` - Array of reports to display
- `onReportClick: (reportId: string) => void` - Click handler for reports
- `onReportDownload?: (reportId: string) => void` - Optional download handler
- `columns?: number` - Number of columns (1-4, default: 3)
- `showCategories?: boolean` - Group reports by category

**Usage:**
```typescript
import { ReportGrid } from '@/components/Shared/DashboardTemplate';

<ReportGrid 
  reports={reports}
  onReportClick={(id) => navigateToReport(id)}
  onReportDownload={(id) => downloadReport(id)}
  columns={3}
  showCategories={true}
/>
```

### ReportTemplate

Main wrapper component for report pages with consistent header, filters, and actions.

**Props:**
- `title: string` - Report page title
- `subtitle?: string` - Optional subtitle
- `children: React.ReactNode` - Report content
- `filters?: React.ReactNode` - Optional filter components
- `actions?: React.ReactNode` - Optional action buttons
- `showBackButton?: boolean` - Show back navigation button
- `onBack?: () => void` - Back button handler
- `className?: string` - Additional CSS classes

**Usage:**
```typescript
import { ReportTemplate } from '@/components/Shared/DashboardTemplate';

<ReportTemplate 
  title="Trial Balance"
  subtitle="As of April 30, 2024"
  showBackButton={true}
  onBack={() => navigateBack()}
  actions={<ReportExport options={exportOptions} />}
  filters={<ReportFilters />}
>
  {/* Report content */}
</ReportTemplate>
```

### ReportExport

Export component with dropdown for PDF, Excel, CSV export options plus Print and Refresh buttons.

**Props:**
- `options: ExportOption[]` - Array of export options
- `onPrint?: () => void` - Optional print handler
- `onRefresh?: () => void` - Optional refresh handler
- `className?: string` - Additional CSS classes

**ExportOption Interface:**
```typescript
interface ExportOption {
  format: 'pdf' | 'excel' | 'csv';
  label: string;
  icon: LucideIcon;
  action: () => void;
}
```

**Usage:**
```typescript
import { ReportExport } from '@/components/Shared/DashboardTemplate';
import { FileDown, FileSpreadsheet } from 'lucide-react';

const exportOptions: ExportOption[] = [
  {
    format: 'pdf',
    label: 'Export as PDF',
    icon: FileDown,
    action: () => exportToPDF()
  },
  {
    format: 'excel',
    label: 'Export as Excel',
    icon: FileSpreadsheet,
    action: () => exportToExcel()
  }
];

<ReportExport 
  options={exportOptions}
  onPrint={() => window.print()}
  onRefresh={() => refreshData()}
/>
```

### AreaChartCard

Standardized area chart wrapper for trend analysis.

**Props:**
- `title: string` - Chart title
- `subtitle?: string` - Optional subtitle
- `data: any[]` - Chart data
- `dataKey: string` - Key for the data values
- `xAxisKey: string` - Key for x-axis labels
- `color?: string` - Chart color (default: '#6366f1')
- `strokeWidth?: number` - Line stroke width (default: 3)
- `height?: number` - Chart height in pixels (default: 288)
- `className?: string` - Additional CSS classes
- `actions?: React.ReactNode` - Optional action buttons

**Usage:**
```typescript
import { AreaChartCard } from '@/components/Shared/DashboardTemplate';

const revenueData = [
  { month: 'Jan', revenue: 420000 },
  { month: 'Feb', revenue: 380000 },
  { month: 'Mar', revenue: 450000 }
];

<AreaChartCard 
  title="Revenue Trend"
  subtitle="First Quarter Analysis"
  data={revenueData}
  dataKey="revenue"
  xAxisKey="month"
  color="#6366f1"
/>
```

### PieChartCard

Standardized pie chart wrapper for distribution analysis.

**Props:**
- `title: string` - Chart title
- `data: Array<{ name: string; value: number; color?: string }>` - Chart data
- `height?: number` - Chart height in pixels (default: 256)
- `className?: string` - Additional CSS classes
- `showLegend?: boolean` - Show legend (default: true)
- `innerRadius?: number` - Inner radius for donut chart (default: 60)
- `outerRadius?: number` - Outer radius (default: 80)

**Usage:**
```typescript
import { PieChartCard } from '@/components/Shared/DashboardTemplate';

const deptRevenue = [
  { name: 'Rooms', value: 245000, color: '#6366f1' },
  { name: 'F&B', value: 142000, color: '#10b981' },
  { name: 'Events', value: 85000, color: '#f59e0b' }
];

<PieChartCard 
  title="Revenue by Department"
  data={deptRevenue}
  showLegend={true}
/>
```

### BarChartCard

Standardized bar chart wrapper for comparison analysis.

**Props:**
- `title: string` - Chart title
- `subtitle?: string` - Optional subtitle
- `data: any[]` - Chart data
- `dataKey: string` - Key for the data values
- `xAxisKey: string` - Key for x-axis labels
- `color?: string` - Bar color (default: '#6366f1')
- `height?: number` - Chart height in pixels (default: 288)
- `className?: string` - Additional CSS classes
- `actions?: React.ReactNode` - Optional action buttons
- `horizontal?: boolean` - Horizontal bar chart (default: false)

**Usage:**
```typescript
import { BarChartCard } from '@/components/Shared/DashboardTemplate';

const monthlyData = [
  { month: 'Jan', bookings: 120 },
  { month: 'Feb', bookings: 145 },
  { month: 'Mar', bookings: 130 }
];

<BarChartCard 
  title="Monthly Bookings"
  data={monthlyData}
  dataKey="bookings"
  xAxisKey="month"
  color="#10b981"
/>
```

## Complete Example: Finance Reports

Here's a complete example showing how to use the reporting system for a Finance Reports page:

```typescript
import React from 'react';
import { 
  ReportTemplate, 
  ReportGrid, 
  ReportCard,
  ReportExport,
  AreaChartCard,
  PieChartCard,
  type ReportItem,
  type ExportOption
} from '@/components/Shared/DashboardTemplate';
import { FileDown, FileSpreadsheet, FileText } from 'lucide-react';

const FinancialReports = () => {
  const [activeReport, setActiveReport] = React.useState<string | null>(null);

  const reports: ReportItem[] = [
    { 
      id: 'tb', 
      title: 'Trial Balance', 
      period: 'April 2024', 
      status: 'Finalized', 
      format: 'PDF/XLS', 
      lastRun: '2 days ago',
      category: 'Financial Statements'
    },
    { 
      id: 'bs', 
      title: 'Balance Sheet', 
      period: 'April 2024', 
      status: 'Finalized', 
      format: 'PDF/XLS', 
      lastRun: '2 days ago',
      category: 'Financial Statements'
    },
    { 
      id: 'pl', 
      title: 'Profit & Loss', 
      period: 'Q1 2024', 
      status: 'Audit Pending', 
      format: 'PDF', 
      lastRun: 'Last Week',
      category: 'Financial Statements'
    }
  ];

  const exportOptions: ExportOption[] = [
    {
      format: 'pdf',
      label: 'Export as PDF',
      icon: FileDown,
      action: () => console.log('Export PDF')
    },
    {
      format: 'excel',
      label: 'Export as Excel',
      icon: FileSpreadsheet,
      action: () => console.log('Export Excel')
    },
    {
      format: 'csv',
      label: 'Export as CSV',
      icon: FileText,
      action: () => console.log('Export CSV')
    }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 420000 },
    { month: 'Feb', revenue: 380000 },
    { month: 'Mar', revenue: 450000 },
    { month: 'Apr', revenue: 480000 }
  ];

  const deptData = [
    { name: 'Rooms', value: 245000, color: '#6366f1' },
    { name: 'F&B', value: 142000, color: '#10b981' },
    { name: 'Events', value: 85000, color: '#f59e0b' }
  ];

  if (activeReport) {
    return (
      <ReportTemplate 
        title="Trial Balance"
        subtitle="As of April 30, 2024"
        showBackButton={true}
        onBack={() => setActiveReport(null)}
        actions={<ReportExport options={exportOptions} onPrint={() => window.print()} />}
      >
        {/* Individual report view */}
      </ReportTemplate>
    );
  }

  return (
    <ReportTemplate 
      title="Financial Reports"
      actions={<ReportExport options={exportOptions} />}
    >
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <AreaChartCard 
            title="Revenue Trend"
            subtitle="Q1 2024 Analysis"
            data={revenueData}
            dataKey="revenue"
            xAxisKey="month"
          />
        </div>
        <div className="lg:col-span-4">
          <PieChartCard 
            title="Revenue by Department"
            data={deptData}
          />
        </div>
      </div>
      
      <div className="mt-8">
        <ReportGrid 
          reports={reports}
          onReportClick={setActiveReport}
          columns={3}
          showCategories={true}
        />
      </div>
    </ReportTemplate>
  );
};

export default FinancialReports;
```

## Design Principles

The reporting system follows these design principles based on the Finance Portal benchmark:

1. **Consistent Visual Language**: All components use the same rounded corners, shadows, and color schemes
2. **Status Indicators**: Standardized status colors (Finalized=green, Draft=indigo, Live=blue, etc.)
3. **Responsive Layout**: Grid systems adapt to different screen sizes
4. **Interactive Elements**: Hover states, transitions, and animations for better UX
5. **Accessibility**: Proper contrast ratios and semantic HTML
6. **Dark Mode Support**: All components support dark mode via Tailwind classes

## Portals That Can Use This System

- **Finance Portal**: Financial statements, trial balance, AR aging
- **Executive Portal**: KPI dashboards, consolidated reports
- **Front Office**: Occupancy reports, guest analytics
- **Housekeeping**: Room status reports, cleaning metrics
- **Food & Beverage**: Sales reports, inventory analysis
- **Engineering**: Maintenance reports, equipment status
- **Sales**: Booking reports, conversion analytics

## Future Enhancements

Potential additions to the reporting system:

- ReportFilters component for date range and department filtering
- ReportScheduler component for automated report generation
- ReportComparison component for comparing multiple periods
- ReportDrillDown component for hierarchical data exploration
- ReportAnnotations component for adding notes to reports
