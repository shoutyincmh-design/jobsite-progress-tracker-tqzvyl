
import { JobSite } from '@/types/jobsite';

export interface CSVParseResult {
  success: boolean;
  data?: JobSite[];
  error?: string;
  rowsProcessed?: number;
}

/**
 * Parse CSV content and convert to JobSite objects
 * Expected CSV format:
 * jobName,jobType,location,coordinator,contractor,stage1,stage2,stage3,stage4,stage5,dueDate,notes
 */
export function parseCSV(csvContent: string): CSVParseResult {
  try {
    console.log('Starting CSV parse...');
    
    // Split into lines and remove empty lines
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return {
        success: false,
        error: 'CSV file must contain at least a header row and one data row',
      };
    }

    // Parse header
    const headers = parseCSVLine(lines[0]);
    console.log('CSV Headers:', headers);

    // Validate required columns
    const requiredColumns = [
      'jobName',
      'jobType',
      'location',
      'coordinator',
      'contractor',
      'stage1',
      'stage2',
      'stage3',
      'stage4',
      'stage5',
      'dueDate',
    ];

    const missingColumns = requiredColumns.filter(
      col => !headers.some(h => h.toLowerCase() === col.toLowerCase())
    );

    if (missingColumns.length > 0) {
      return {
        success: false,
        error: `Missing required columns: ${missingColumns.join(', ')}`,
      };
    }

    // Create column index map (case-insensitive)
    const columnMap: { [key: string]: number } = {};
    headers.forEach((header, index) => {
      columnMap[header.toLowerCase()] = index;
    });

    // Parse data rows
    const jobSites: JobSite[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        
        if (values.length === 0 || values.every(v => !v.trim())) {
          continue; // Skip empty rows
        }

        const jobSite: JobSite = {
          id: `imported-${Date.now()}-${i}`,
          jobName: getColumnValue(values, columnMap, 'jobname') || `Job ${i}`,
          jobType: getColumnValue(values, columnMap, 'jobtype') || 'Commercial',
          location: getColumnValue(values, columnMap, 'location') || '',
          coordinator: getColumnValue(values, columnMap, 'coordinator') || '',
          contractor: getColumnValue(values, columnMap, 'contractor') || '',
          dueDate: formatDate(getColumnValue(values, columnMap, 'duedate')),
          notes: getColumnValue(values, columnMap, 'notes') || '',
          stages: {
            stage1: parseBoolean(getColumnValue(values, columnMap, 'stage1')),
            stage2: parseBoolean(getColumnValue(values, columnMap, 'stage2')),
            stage3: parseBoolean(getColumnValue(values, columnMap, 'stage3')),
            stage4: parseBoolean(getColumnValue(values, columnMap, 'stage4')),
            stage5: parseBoolean(getColumnValue(values, columnMap, 'stage5')),
          },
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        };

        jobSites.push(jobSite);
      } catch (error) {
        console.error(`Error parsing row ${i + 1}:`, error);
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (jobSites.length === 0) {
      return {
        success: false,
        error: errors.length > 0 ? errors.join('\n') : 'No valid data rows found',
      };
    }

    console.log(`Successfully parsed ${jobSites.length} job sites`);
    return {
      success: true,
      data: jobSites,
      rowsProcessed: jobSites.length,
    };
  } catch (error) {
    console.error('CSV parsing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error',
    };
  }
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());

  return result;
}

/**
 * Get column value by name (case-insensitive)
 */
function getColumnValue(
  values: string[],
  columnMap: { [key: string]: number },
  columnName: string
): string {
  const index = columnMap[columnName.toLowerCase()];
  return index !== undefined ? values[index] || '' : '';
}

/**
 * Parse boolean value from string
 */
function parseBoolean(value: string): boolean {
  const normalized = value.toLowerCase().trim();
  return (
    normalized === 'true' ||
    normalized === 'yes' ||
    normalized === '1' ||
    normalized === 'x' ||
    normalized === 'completed' ||
    normalized === 'complete'
  );
}

/**
 * Format date string to YYYY-MM-DD
 */
function formatDate(dateStr: string): string {
  if (!dateStr) {
    // Default to 30 days from now
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  }

  try {
    // Try parsing various date formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (error) {
    console.error('Date parsing error:', error);
  }

  // Return original if parsing fails
  return dateStr;
}

/**
 * Generate a sample CSV template
 */
export function generateCSVTemplate(): string {
  const headers = [
    'jobName',
    'jobType',
    'location',
    'coordinator',
    'contractor',
    'stage1',
    'stage2',
    'stage3',
    'stage4',
    'stage5',
    'dueDate',
    'notes',
  ];

  const sampleRow = [
    'Downtown Office Complex',
    'Commercial',
    '123 Main St, Downtown',
    'Sarah Johnson',
    'BuildRight Construction',
    'true',
    'true',
    'false',
    'false',
    'false',
    '2024-12-31',
    'Sample project notes',
  ];

  return `${headers.join(',')}\n${sampleRow.join(',')}`;
}
