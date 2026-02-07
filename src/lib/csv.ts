/**
 * Convert an array of objects to a CSV string and trigger a download.
 */

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv<T>(
  data: T[],
  columns: { key: keyof T; header: string }[]
): string {
  const header = columns.map(c => escapeCsvValue(c.header)).join(',');
  const rows = data.map(row =>
    columns.map(c => escapeCsvValue(row[c.key])).join(',')
  );
  return [header, ...rows].join('\n');
}

export function downloadCsv(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
