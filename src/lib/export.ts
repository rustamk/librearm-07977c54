import type { BloodPressureReading } from './bluetooth';

/**
 * Export readings to CSV format and trigger download
 */
export function exportToCSV(readings: BloodPressureReading[]): void {
  if (readings.length === 0) return;

  const headers = ['Date', 'Time', 'Systolic (mmHg)', 'Diastolic (mmHg)', 'Heart Rate (bpm)', 'Status', 'Synced to Health Connect'];
  
  const rows = readings.map(reading => {
    const date = new Date(reading.timestamp);
    return [
      date.toLocaleDateString(),
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reading.systolic.toString(),
      reading.diastolic.toString(),
      reading.heartRate > 0 ? reading.heartRate.toString() : '',
      reading.status,
      reading.syncedToHealthConnect ? 'Yes' : 'No',
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadFile(csvContent, 'blood-pressure-readings.csv', 'text/csv');
}

/**
 * Export readings to PDF format and trigger download
 */
export function exportToPDF(readings: BloodPressureReading[]): void {
  if (readings.length === 0) return;

  // Create a simple HTML document for PDF
  const statusLabels: Record<string, string> = {
    normal: 'Normal',
    elevated: 'Elevated',
    high: 'High',
    hypertensive: 'Hypertensive Crisis',
  };

  const statusColors: Record<string, string> = {
    normal: '#22c55e',
    elevated: '#f59e0b',
    high: '#ef4444',
    hypertensive: '#dc2626',
  };

  const tableRows = readings.map(reading => {
    const date = new Date(reading.timestamp);
    return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e5e5;">${date.toLocaleDateString()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e5e5;">${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e5e5; font-weight: 600;">${reading.systolic}/${reading.diastolic}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e5e5;">${reading.heartRate > 0 ? reading.heartRate : '-'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e5e5;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: ${statusColors[reading.status]}20; color: ${statusColors[reading.status]}; font-size: 12px;">
            ${statusLabels[reading.status]}
          </span>
        </td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Blood Pressure Readings</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1a1a1a; }
        h1 { color: #0066cc; margin-bottom: 8px; }
        .subtitle { color: #666; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { text-align: left; padding: 12px 8px; background: #f5f5f5; border-bottom: 2px solid #ddd; font-weight: 600; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e5e5; color: #666; font-size: 12px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>Blood Pressure Report</h1>
      <p class="subtitle">Generated on ${new Date().toLocaleDateString()} • ${readings.length} reading${readings.length !== 1 ? 's' : ''}</p>
      
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>BP (mmHg)</th>
            <th>Heart Rate</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      
      <div class="footer">
        <p><strong>Blood Pressure Categories:</strong></p>
        <p>Normal: &lt;120/80 • Elevated: 120-129/&lt;80 • High: 130-139/80-89 • Hypertensive Crisis: &gt;180/&gt;120</p>
      </div>
    </body>
    </html>
  `;

  // Open print dialog for PDF generation
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    // Delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

/**
 * Helper to trigger file download
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
