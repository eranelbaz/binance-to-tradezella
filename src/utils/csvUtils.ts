// Define the CSV record type based on the transformed data
type TradeCSVRecord = Record<string, string | number | undefined>;

/**
 * Converts an array of trade records to CSV format
 * @param records Array of trade records (already in CSV format)
 * @returns CSV string
 */
function recordsToCsv(records: TradeCSVRecord[]): string {
  if (records.length === 0) return '';
  
  // Get headers from the first record
  const headers = Object.keys(records[0]);
  
  // Create CSV header
  let csv = headers.join(',') + '\n';
  
  // Add rows
  records.forEach(record => {
    const row = headers.map(header => {
      const value = record[header];
      if (value === null || value === undefined) return '';
      // Escape quotes and wrap in quotes if contains comma or newline
      const str = String(value).replace(/"/g, '""');
      return str.includes(',') || str.includes('\n') ? `"${str}"` : str;
    });
    csv += row.join(',') + '\n';
  });
  
  return csv;
}

/**
 * Sends a CSV response with the provided data
 * @param res Express Response object
 * @param data Array of trade records (already in CSV format)
 * @param filename Name of the file to download
 */
export function sendCsvResponse(
  res: any,
  data: any[],
  filename: string = 'trades.csv'
): void {
  const csv = recordsToCsv(data);
  
  // Set headers for file download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf8'));
  
  // Send the CSV content
  res.send(csv);
}
