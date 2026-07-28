# Reporting System Migration Guide

This guide provides step-by-step instructions for migrating existing portal reports to use the standardized reporting system.

## Overview

The standardized reporting system provides reusable components in `src/components/Shared/DashboardTemplate.tsx`:
- `ReportCard` - For report listings
- `ReportGrid` - For displaying multiple reports
- `ReportTemplate` - Main wrapper for report pages
- `ReportExport` - Export functionality
- `AreaChartCard`, `PieChartCard`, `BarChartCard` - Standardized chart wrappers

## Migration Strategy

### Phase 1: Simple Report Listings
Start with portals that have simple report listing pages without complex state management.

### Phase 2: Dashboard Reports
Migrate dashboard charts to use standardized chart wrappers.

### Phase 3: Complex Reports
Migrate complex report modules with custom state management last.

## Portal-Specific Migration Plans

### 1. Finance Portal

#### Files:
- `FinancialReports.tsx` (868 lines) - Complex with multiple report views
- `USALIReporting.tsx` - USALI standard reporting

#### Migration Steps:
1. **FinancialReports.tsx**
   - Replace report card rendering with `ReportGrid` component
   - Wrap individual report views with `ReportTemplate`
   - Add `ReportExport` for export functionality
   - Convert charts to `AreaChartCard`, `PieChartCard`, `BarChartCard`

2. **USALIReporting.tsx**
   - Apply `ReportTemplate` wrapper
   - Use standardized chart components for USALI metrics
   - Add `ReportExport` for USALI format exports

#### Example - Before:
```tsx
const renderReportList = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {reports.map((rpt, i) => (
      <div onClick={() => setActiveReport(rpt.id)} className="...">
        {/* Custom report card implementation */}
      </div>
    ))}
  </div>
);
```

#### Example - After:
```tsx
import { ReportGrid, ReportTemplate, ReportExport } from '../Shared/DashboardTemplate';

const reports: ReportItem[] = [
  { id: 'tb', title: 'Trial Balance', period: 'April 2024', status: 'Finalized', format: 'PDF/XLS', lastRun: '2 days ago', category: 'Financial Statements' },
  // ...
];

return (
  <ReportTemplate 
    title="Financial Reports"
    actions={<ReportExport options={exportOptions} />}
  >
    <ReportGrid 
      reports={reports}
      onReportClick={setActiveReport}
      columns={3}
      showCategories={true}
    />
  </ReportTemplate>
);
```

### 2. Executive Portal

#### Files:
- `ReportsAnalytics.tsx` - Executive-level reporting and analytics

#### Migration Steps:
1. Replace custom report cards with `ReportCard`
2. Use `ReportGrid` for report listings
3. Convert executive KPI charts to standardized chart components
4. Add `ReportExport` for executive summary exports

### 3. Housekeeping Portal

#### Files:
- `HKReportsModule.tsx` (2137 lines) - Very complex with custom state management

#### Migration Strategy:
**Do not fully refactor HKReportsModule.tsx immediately.** This file is too complex.

Instead:
1. Create a new `HKStandardReports.tsx` using the standardized system
2. Migrate simple report listings first
3. Keep complex input forms and data management in the original file
4. Gradually migrate chart sections to standardized components

#### Recommended Approach:
```tsx
// New file: HKStandardReports.tsx
import { ReportTemplate, ReportGrid, AreaChartCard, PieChartCard } from '../Shared/DashboardTemplate';

const hkReports: ReportItem[] = [
  { id: 'daily-status', title: 'Daily Room Status', period: 'Today', status: 'Live', format: 'PDF', lastRun: '5 mins ago', category: 'Daily Reports' },
  { id: 'weekly-summary', title: 'Weekly Cleaning Summary', period: 'Week 22', status: 'Finalized', format: 'Excel', lastRun: '2 days ago', category: 'Weekly Reports' },
  // ...
];

export function HKStandardReports() {
  return (
    <ReportTemplate title="Housekeeping Reports">
      <ReportGrid reports={hkReports} onReportClick={handleReportClick} showCategories={true} />
      {/* Chart sections */}
    </ReportTemplate>
  );
}
```

### 4. Front Desk Portal

#### Files:
- `ReportsAuditModule.tsx` - Audit reports
- `DailyOtherReportsRenderer.tsx` - Daily operational reports
- `GiftshopSuppliesReport.tsx` - Gift shop inventory reports

#### Migration Steps:
1. **ReportsAuditModule.tsx** - Apply `ReportTemplate` and `ReportGrid`
2. **DailyOtherReportsRenderer.tsx** - Use standardized components for daily reports
3. **GiftshopSuppliesReport.tsx** - Apply chart wrappers for inventory trends

### 5. Inventory Portal

#### Files:
- `ReportsModule.tsx` - Inventory reports

#### Migration Steps:
1. Replace custom report cards with `ReportCard`
2. Use `ReportGrid` for report listings
3. Convert inventory charts to `AreaChartCard` and `BarChartCard`
4. Add inventory-specific export options

### 6. Shared Components

#### Files:
- `DepartmentReportsModule.tsx` - Cross-department reporting
- `OutletPerformanceReport.tsx` - POS outlet performance

#### Migration Steps:
1. These are already somewhat standardized
2. Enhance with new `ReportTemplate` wrapper
3. Add standardized chart components

## Common Migration Patterns

### Pattern 1: Report Card Replacement

**Before:**
```tsx
<div className="bg-white border p-6 rounded-3xl shadow-sm">
  <h4>{report.title}</h4>
  <p>{report.period}</p>
  <span className={getStatusClass(report.status)}>{report.status}</span>
</div>
```

**After:**
```tsx
<ReportCard report={reportItem} onClick={handleClick} onDownload={handleDownload} />
```

### Pattern 2: Chart Standardization

**Before:**
```tsx
<div className="bg-white border p-6 rounded-3xl">
  <h3>Revenue Trend</h3>
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data}>
      {/* Custom chart configuration */}
    </AreaChart>
  </ResponsiveContainer>
</div>
```

**After:**
```tsx
<AreaChartCard 
  title="Revenue Trend"
  data={data}
  dataKey="revenue"
  xAxisKey="month"
  color="#6366f1"
/>
```

### Pattern 3: Export Functionality

**Before:**
```tsx
<div className="flex gap-2">
  <button onClick={exportPDF}>PDF</button>
  <button onClick={exportExcel}>Excel</button>
</div>
```

**After:**
```tsx
<ReportExport 
  options={[
    { format: 'pdf', label: 'Export as PDF', icon: FileText, action: exportPDF },
    { format: 'excel', label: 'Export as Excel', icon: FileSpreadsheet, action: exportExcel }
  ]}
  onPrint={() => window.print()}
  onRefresh={refreshData}
/>
```

## Data Structure Conversion

### Convert to ReportItem Interface

**Before:**
```tsx
const reports = [
  { id: 'tb', title: 'Trial Balance', period: 'April 2024', status: 'Finalized' }
];
```

**After:**
```tsx
const reports: ReportItem[] = [
  { 
    id: 'tb', 
    title: 'Trial Balance', 
    period: 'April 2024', 
    status: 'Finalized',
    format: 'PDF/XLS',
    lastRun: '2 days ago',
    category: 'Financial Statements',
    description: 'Monthly trial balance report'
  }
];
```

## Testing Checklist

After migrating each portal:
- [ ] Report listings display correctly with `ReportGrid`
- [ ] Report cards show correct status colors
- [ ] Click handlers work for navigating to reports
- [ ] Export buttons trigger correct actions
- [ ] Charts render correctly with standardized components
- [ ] Responsive layout works on different screen sizes
- [ ] Dark mode support works
- [ ] No TypeScript errors
- [ ] No console errors in browser

## Rollback Plan

If issues arise:
1. Keep original files as backups during migration
2. Use git to revert changes if needed
3. Migrate incrementally (one component at a time)
4. Test thoroughly before moving to next component

## Priority Order

1. **High Priority** (Quick wins):
   - Front Desk: GiftshopSuppliesReport.tsx
   - Inventory: ReportsModule.tsx
   - Shared: OutletPerformanceReport.tsx

2. **Medium Priority** (Moderate effort):
   - Executive: ReportsAnalytics.tsx
   - Finance: USALIReporting.tsx

3. **Low Priority** (Complex):
   - Finance: FinancialReports.tsx
   - Housekeeping: HKReportsModule.tsx (consider partial migration)
   - Front Desk: ReportsAuditModule.tsx

## Notes

- Some complex files may need partial migration rather than full refactoring
- Custom state management and data inputs can remain in original files
- Focus on UI/UX consistency using the standardized components
- Preserve existing business logic and data handling
