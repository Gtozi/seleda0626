/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared export & print helpers for the Front Desk Reports & Audit portal.
 * Provides real PDF (jsPDF), Excel (SheetJS / xlsx) and browser print output.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface ReportSection {
  /** Section heading rendered above the table. */
  title: string;
  /** Column headers for the table. */
  columns: string[];
  /** Row data; each row is an array of cell values. */
  rows: (string | number)[][];
}

export interface ReportDocument {
  /** Human readable report name, e.g. "Executive Summary". */
  reportName: string;
  /** Business / operating date string. */
  businessDate: string;
  /** Optional hotel or property label for the header. */
  propertyName?: string;
  /** One or more tabular sections to render. */
  sections: ReportSection[];
}

const HOTEL_LABEL = 'SELEDA Hotel ERP';

const slug = (name: string) =>
  name
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .toLowerCase();

/**
 * Generate and download a true PDF using jsPDF + autotable.
 */
export function exportReportToPDF(doc: ReportDocument) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(doc.propertyName || HOTEL_LABEL, 40, 48);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(doc.reportName, 40, 68);

  pdf.setFontSize(9);
  pdf.setTextColor(120);
  pdf.text(`Business Date: ${doc.businessDate}`, 40, 84);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 40, 84, { align: 'right' });
  pdf.setTextColor(0);

  let cursorY = 100;

  doc.sections.forEach((section) => {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(section.title, 40, cursorY);
    cursorY += 8;

    autoTable(pdf, {
      head: [section.columns],
      body: section.rows.map((r) => r.map((c) => String(c))),
      startY: cursorY,
      margin: { left: 40, right: 40 },
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      theme: 'grid',
    });

    // @ts-ignore - lastAutoTable is attached at runtime by the plugin
    cursorY = (pdf as any).lastAutoTable.finalY + 24;
  });

  pdf.save(`${slug(doc.reportName)}_${doc.businessDate}.pdf`);
}

/**
 * Generate and download a real multi-sheet Excel workbook.
 */
export function exportReportToExcel(doc: ReportDocument) {
  const wb = XLSX.utils.book_new();

  doc.sections.forEach((section, idx) => {
    const aoa = [section.columns, ...section.rows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    // Sheet names max 31 chars, must be unique & free of special chars.
    const sheetName = (section.title || `Sheet ${idx + 1}`)
      .replace(/[\\/?*[\]:]/g, '')
      .slice(0, 31) || `Sheet ${idx + 1}`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  XLSX.writeFile(wb, `${slug(doc.reportName)}_${doc.businessDate}.xlsx`);
}

/**
 * Open a clean print window and trigger the browser print dialog
 * (lets users print or Save-as-PDF) using inline print-scoped CSS.
 */
export function printReport(doc: ReportDocument) {
  if (typeof window === 'undefined') return;

  const sectionsHtml = doc.sections
    .map((section) => {
      const headCells = section.columns.map((c) => `<th>${escapeHtml(c)}</th>`).join('');
      const bodyRows = section.rows
        .map(
          (row) =>
            `<tr>${row.map((cell) => `<td>${escapeHtml(String(cell))}</td>`).join('')}</tr>`
        )
        .join('');
      return `
        <section>
          <h2>${escapeHtml(section.title)}</h2>
          <table>
            <thead><tr>${headCells}</tr></thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </section>`;
    })
    .join('');

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(doc.reportName)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 32px; }
  header { border-bottom: 2px solid #1e293b; padding-bottom: 12px; margin-bottom: 20px; }
  header .brand { font-size: 18px; font-weight: 800; }
  header .report { font-size: 14px; margin-top: 2px; }
  header .meta { font-size: 11px; color: #64748b; margin-top: 6px; display: flex; justify-content: space-between; }
  section { margin-bottom: 22px; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
  thead th { background: #1e293b; color: #fff; }
  tbody tr:nth-child(even) { background: #f1f5f9; }
  @media print {
    body { margin: 12mm; }
    section { page-break-inside: avoid; }
  }
</style>
</head>
<body>
  <header>
    <div class="brand">${escapeHtml(doc.propertyName || HOTEL_LABEL)}</div>
    <div class="report">${escapeHtml(doc.reportName)}</div>
    <div class="meta">
      <span>Business Date: ${escapeHtml(doc.businessDate)}</span>
      <span>Generated: ${escapeHtml(new Date().toLocaleString())}</span>
    </div>
  </header>
  ${sectionsHtml}
  <script>
    window.onload = function () {
      window.focus();
      window.print();
      window.onafterprint = function () { window.close(); };
    };
  </script>
</body>
</html>`;

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    console.warn('Print window blocked by browser pop-up settings.');
    return;
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Print a specific DOM element by its `id` in a clean popup window.
 * This ensures the Print button prints exactly the report content
 * it sits next to, not the whole page. Preserves all UI styling
 * by copying parent stylesheets and including Tailwind CDN.
 */
export function printElementById(elementId: string, title?: string) {
  if (typeof window === 'undefined') return;

  const el = document.getElementById(elementId);
  if (!el) {
    console.warn(`printElementById: element #${elementId} not found`);
    return;
  }

  // Clone the element and remove interactive / hidden UI
  const clone = el.cloneNode(true) as HTMLElement;

  // Strip buttons, inputs, and no-print elements from the clone
  clone.querySelectorAll('button, input, select, textarea, .no-print, [data-no-print]').forEach((n) => {
    (n as HTMLElement).remove();
  });

  // Collect all existing stylesheets and style blocks from the parent document
  let parentStyles = '';
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    parentStyles += link.outerHTML;
  });
  document.querySelectorAll('style').forEach((style) => {
    parentStyles += style.outerHTML;
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title || 'Report Print')}</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  ${parentStyles}
  <style>
    @page { margin: 1.2cm; }
    body { font-family: system-ui, -apple-system, sans-serif; color: #1e293b; background: #fff; padding: 0; margin: 0; }
    /* Ensure dark-mode overrides don't apply in print */
    [class*="dark:"] { }
    /* Inline spacer utilities that may be missing */
    .space-y-1 > * + * { margin-top: 0.25rem; }
    .space-y-2 > * + * { margin-top: 0.5rem; }
    .space-y-3 > * + * { margin-top: 0.75rem; }
    .space-y-4 > * + * { margin-top: 1rem; }
    .space-y-5 > * + * { margin-top: 1.25rem; }
    .space-y-6 > * + * { margin-top: 1.5rem; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  ${clone.outerHTML}
  <script>
    window.onload = function () {
      window.focus();
      window.print();
      window.onafterprint = function () { window.close(); };
    };
  <\/script>
</body>
</html>`;

  const printWindow = window.open('', '_blank', 'width=1000,height=800');
  if (!printWindow) {
    console.warn('Print window blocked by browser pop-up settings.');
    return;
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
