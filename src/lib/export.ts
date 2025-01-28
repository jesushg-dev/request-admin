import { type Table } from '@tanstack/react-table';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable, { CellInput } from 'jspdf-autotable';

export function exportTableToCSV<TData>(
  /**
   * The table to export.
   * @type Table<TData>
   */
  table: Table<TData>,
  opts: {
    /**
     * The filename for the CSV file.
     * @default "table"
     * @example "tasks"
     */
    filename?: string;
    /**
     * The columns to exclude from the CSV file.
     * @default []
     * @example ["select", "actions"]
     */
    excludeColumns?: (keyof TData | 'select' | 'actions')[];

    /**
     * Whether to export only the selected rows.
     * @default false
     */
    onlySelected?: boolean;
  } = {}
): void {
  const { filename = 'table', excludeColumns = [], onlySelected = false } = opts;

  // Retrieve headers (column names)
  const headers = table
    .getAllLeafColumns()
    .map((column) => column.id)
    .filter((id) => !excludeColumns.includes(id as keyof TData | 'select' | 'actions'));

  // Build CSV content
  const csvContent = [
    headers.join(','),
    ...(onlySelected ? table.getFilteredSelectedRowModel().rows : table.getRowModel().rows).map((row) =>
      headers
        .map((header) => {
          const cellValue = row.getValue(header);
          // Handle values that might contain commas or newlines
          return typeof cellValue === 'string' ? `"${cellValue.replace(/"/g, '""')}"` : cellValue;
        })
        .join(',')
    ),
  ].join('\n');

  // Create a Blob with CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create a link and trigger the download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
export function exportTableToTSV<TData>(
  table: Table<TData>,
  opts: {
    filename?: string;
    excludeColumns?: (keyof TData | 'select' | 'actions')[];
    onlySelected?: boolean;
  } = {}
): void {
  const { filename = 'table', excludeColumns = [], onlySelected = false } = opts;

  const headers = table
    .getAllLeafColumns()
    .map((column) => column.id)
    .filter((id) => !excludeColumns.includes(id as keyof TData | 'select' | 'actions'));

  const tsvContent = [
    headers.join('\t'),
    ...(onlySelected
      ? table.getFilteredSelectedRowModel().rows
      : table.getRowModel().rows
    ).map((row) =>
      headers
        .map((header) => {
          const cellValue = row.getValue(header);
          return typeof cellValue === 'string' ? `"${cellValue.replace(/"/g, '""')}"` : cellValue;
        })
        .join('\t')
    ),
  ].join('\n');

  const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.tsv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportTableToExcel<TData>(
  /**
   * The table to export.
   * @type Table<TData>
   */
  table: Table<TData>,
  opts: {
    /**
     * The filename for the Excel file.
     * @default "table"
     * @example "tasks"
     */
    filename?: string;
    /**
     * The columns to exclude from the Excel file.
     * @default []
     * @example ["select", "actions"]
     */
    excludeColumns?: (keyof TData | 'select' | 'actions')[];

    /**
     * Whether to export only the selected rows.
     * @default false
     */
    onlySelected?: boolean;
  } = {}
): void {
  const { filename = 'table', excludeColumns = [], onlySelected = false } = opts;

  // Retrieve headers (column names)
  const headers = table
    .getAllLeafColumns()
    .map((column) => column.id)
    .filter((id) => !excludeColumns.includes(id as keyof TData | 'select' | 'actions'));

  // Build data for the Excel sheet
  const rows = (onlySelected
    ? table.getFilteredSelectedRowModel().rows
    : table.getRowModel().rows
  ).map((row) =>
    headers.map((header) => {
      const cellValue = row.getValue(header);
      return typeof cellValue === 'string' ? cellValue : cellValue?.toString();
    })
  );

  // Create the worksheet and add data
  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Create a new workbook and append the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Write the workbook to a Blob and trigger the download
  const excelBlob = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBlob], { type: 'application/octet-stream' });

  // Create a link and trigger the download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xlsx`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportTableToJSON<TData>(
  table: Table<TData>,
  opts: {
    filename?: string;
    excludeColumns?: (keyof TData | 'select' | 'actions')[];
    onlySelected?: boolean;
  } = {}
): void {
  const { filename = 'table', excludeColumns = [], onlySelected = false } = opts;

  const rows = (onlySelected
    ? table.getFilteredSelectedRowModel().rows
    : table.getRowModel().rows
  ).map((row) => {
    const rowData: Partial<TData> = {};
    table.getAllLeafColumns().forEach((column) => {
      if (!excludeColumns.includes(column.id as keyof TData | 'select' | 'actions')) {
        rowData[column.id as keyof TData] = row.getValue(column.id);
      }
    });
    return rowData;
  });

  const jsonContent = JSON.stringify(rows, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportTableToPDF<TData>(
  table: Table<TData>,
  opts: {
    filename?: string;
    excludeColumns?: (keyof TData | 'select' | 'actions')[];
    onlySelected?: boolean;
  } = {}
): void {
  const { filename = 'table', excludeColumns = [], onlySelected = false } = opts;

  // Get the headers
  const headers = table
    .getAllLeafColumns()
    .map((column) => column.id)
    .filter((id) => !excludeColumns.includes(id as keyof TData | 'select' | 'actions'));

  // Prepare rows for the table body
  const rows: CellInput[][] = (onlySelected
    ? table.getFilteredSelectedRowModel().rows
    : table.getRowModel().rows
  ).map((row) =>
    headers.map((header) => {
      const value = row.getValue(header);
      // Convert values to strings or other formats compatible with CellInput
      return value !== undefined && value !== null ? String(value) : ''; // Ensure a string or empty cell
    })
  );

  // Create a new PDF document
  const doc = new jsPDF();

  // Add the table to the PDF
  autoTable(doc, {
    head: [headers],
    body: rows,
  });

  // Save the PDF
  doc.save(`${filename}.pdf`);
}

export function exportTableToXML<TData>(
  table: Table<TData>,
  opts: {
    filename?: string;
    excludeColumns?: (keyof TData | 'select' | 'actions')[];
    onlySelected?: boolean;
  } = {}
): void {
  const { filename = 'table', excludeColumns = [], onlySelected = false } = opts;

  const headers = table
    .getAllLeafColumns()
    .map((column) => column.id)
    .filter((id) => !excludeColumns.includes(id as keyof TData | 'select' | 'actions'));

  const rows = (onlySelected
    ? table.getFilteredSelectedRowModel().rows
    : table.getRowModel().rows
  ).map((row) =>
    headers.reduce((acc, header) => {
      acc[header] = row.getValue(header);
      return acc;
    }, {} as Record<string, unknown>)
  );

  const xmlContent = `
    <table>
      ${rows
        .map(
          (row) => `
          <row>
            ${Object.entries(row)
              .map(([key, value]) => `<${key}>${value}</${key}>`)
              .join('')}
          </row>`
        )
        .join('')}
    </table>
  `;

  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xml`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportTableToHTML<TData>(
  table: Table<TData>,
  opts: {
    filename?: string;
    excludeColumns?: (keyof TData | 'select' | 'actions')[];
    onlySelected?: boolean;
  } = {}
): void {
  const { filename = 'table', excludeColumns = [], onlySelected = false } = opts;

  const headers = table
    .getAllLeafColumns()
    .map((column) => column.id)
    .filter((id) => !excludeColumns.includes(id as keyof TData | 'select' | 'actions'));

  const rows = (onlySelected
    ? table.getFilteredSelectedRowModel().rows
    : table.getRowModel().rows
  ).map((row) =>
    headers.map((header) => `<td>${row.getValue(header)}</td>`).join('')
  );

  const htmlContent = `
    <table border="1">
      <thead>
        <tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows.map((row) => `<tr>${row}</tr>`).join('')}
      </tbody>
    </table>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
