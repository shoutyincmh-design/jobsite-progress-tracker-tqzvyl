
import { JobSite } from '@/types/jobsite';

export interface CSVParseResult {
  success: boolean;
  data?: JobSite[];
  error?: string;
  rowsProcessed?: number;
  details?: string;
}

/**
 * Parse CSV content and convert to JobSite objects
 * Expected CSV format:
 * jobName,jobType,location,coordinator,contractor,planning,foundation,construction,finishing,inspection,dueDate,notes
 * OR
 * jobName,jobType,location,coordinator,contractor,stage1,stage2,stage3,stage4,stage5,dueDate,notes
 */
export function parseCSV(csvContent: string): CSVParseResult {
  try {
    console.log('=== CSV PARSER START ===');
    console.log('CSV content length:', csvContent.length);
    console.log('First 200 chars:', csvContent.substring(0, 200));
    
    // Split into lines and remove empty lines
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
    console.log('Total lines found:', lines.length);
    
    if (lines.length < 2) {
      console.error('Not enough lines in CSV');
      return {
        success: false,
        error: 'CSV file must contain at least a header row and one data row',
        details: `Found ${lines.length} lines`,
      };
    }

    // Parse header
    const headers = parseCSVLine(lines[0]);
    console.log('CSV Headers:', headers);
    console.log('Header count:', headers.length);

    // Map stage column names (support both formats)
    const stageColumnMap: { [key: string]: keyof JobSite['stages'] } = {
      'stage1': 'stage1',
      'stage2': 'stage2',
      'stage3': 'stage3',
      'stage4': 'stage4',
      'stage5': 'stage5',
      'planning': 'stage1',
      'foundation': 'stage2',
      'construction': 'stage3',
      'finishing': 'stage4',
      'inspection': 'stage5',
    };

    // Validate required columns
    const requiredColumns = [
      'jobName',
      'jobType',
      'location',
      'coordinator',
      'contractor',
      'dueDate',
    ];

    // Check for at least one stage column
    const hasStageColumns = headers.some(h => 
      Object.keys(stageColumnMap).includes(h.toLowerCase())
    );

    const missingColumns = requiredColumns.filter(
      col => !headers.some(h => h.toLowerCase() === col.toLowerCase())
    );

    if (missingColumns.length > 0) {
      console.error('Missing columns:', missingColumns);
      return {
        success: false,
        error: `Missing required columns: ${missingColumns.join(', ')}`,
        details: `Found columns: ${headers.join(', ')}`,
      };
    }

    if (!hasStageColumns) {
      console.error('No stage columns found');
      return {
        success: false,
        error: 'CSV must contain at least one stage column (stage1-5 or planning/foundation/construction/finishing/inspection)',
        details: `Found columns: ${headers.join(', ')}`,
      };
    }

    // Create column index map (case-insensitive)
    const columnMap: { [key: string]: number } = {};
    headers.forEach((header, index) => {
      columnMap[header.toLowerCase().trim()] = index;
    });
    console.log('Column map:', columnMap);

    // Parse data rows
    const jobSites: JobSite[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        console.log(`Row ${i} values count:`, values.length);
        console.log(`Row ${i} first 3 values:`, values.slice(0, 3));
        
        if (values.length === 0 || values.every(v => !v.trim())) {
          console.log(`Skipping empty row ${i}`);
          continue; // Skip empty rows
        }

        // Get stage values
        const stages: JobSite['stages'] = {
          stage1: false,
          stage2: false,
          stage3: false,
          stage4: false,
          stage5: false,
        };

        // Map stage columns to stage values
        Object.entries(stageColumnMap).forEach(([columnName, stageKey]) => {
          const value = getColumnValue(values, columnMap, columnName);
          if (value !== '') {
            stages[stageKey] = parseBoolean(value);
          }
        });

        const jobSite: JobSite = {
          id: `imported-${Date.now()}-${i}`,
          jobName: getColumnValue(values, columnMap, 'jobname') || `Job ${i}`,
          jobType: getColumnValue(values, columnMap, 'jobtype') || 'Commercial',
          location: getColumnValue(values, columnMap, 'location') || '',
          coordinator: getColumnValue(values, columnMap, 'coordinator') || '',
          contractor: getColumnValue(values, columnMap, 'contractor') || '',
          dueDate: formatDate(getColumnValue(values, columnMap, 'duedate')),
          notes: getColumnValue(values, columnMap, 'notes') || '',
          stages,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        };

        console.log(`Created job site ${i}:`, jobSite.jobName, 'Stages:', stages);
        jobSites.push(jobSite);
      } catch (error) {
        console.error(`Error parsing row ${i + 1}:`, error);
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log(`Total job sites parsed: ${jobSites.length}`);

    if (jobSites.length === 0) {
      console.error('No valid job sites found');
      return {
        success: false,
        error: errors.length > 0 ? errors.join('\n') : 'No valid data rows found',
        details: `Processed ${lines.length - 1} data rows`,
      };
    }

    console.log('=== CSV PARSER SUCCESS ===');
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
      details: error instanceof Error ? error.stack : undefined,
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
  return index !== undefined && index < values.length ? values[index] || '' : '';
}

/**
 * Parse boolean value from string
 */
function parseBoolean(value: string): boolean {
  const normalized = value.toLowerCase().trim();
  const result = (
    normalized === 'true' ||
    normalized === 'yes' ||
    normalized === '1' ||
    normalized === 'x' ||
    normalized === 'completed' ||
    normalized === 'complete'
  );
  return result;
}

/**
 * Format date string to YYYY-MM-DD
 */
function formatDate(dateStr: string): string {
  if (!dateStr || dateStr.trim() === '') {
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
