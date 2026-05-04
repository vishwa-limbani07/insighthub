import Papa from 'papaparse';

export function parseCSV(buffer: Buffer): Record<string, any>[] {
  const csvString = buffer.toString('utf-8');

  // Remove BOM (Byte Order Mark) if present — common with Excel-exported CSVs
  const cleanedCSV = csvString.replace(/^\uFEFF/, '').trim();

  if (!cleanedCSV) {
    throw new Error('CSV file is empty');
  }

  const result = Papa.parse(cleanedCSV, {
    header: true,
    skipEmptyLines: 'greedy',   // Changed: more aggressive empty line removal
    dynamicTyping: false,
    transformHeader: (header: string) => header.trim(),
    delimiter: '',              // Added: empty string lets Papa auto-detect, but we add a fallback
  });

  // If auto-detect failed, retry with comma explicitly
  if (
    result.errors.some(
      (e) => e.message?.includes('auto-detect') || e.type === 'Delimiter'
    )
  ) {
    const retryResult = Papa.parse(cleanedCSV, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      transformHeader: (header: string) => header.trim(),
      delimiter: ',',
    });

    if (retryResult.data.length > 0 && Object.keys(retryResult.data[0] as object).length > 1) {
      return retryResult.data as Record<string, any>[];
    }
  }

  // Filter out critical errors only
  const criticalErrors = result.errors.filter(
    (e) => e.type === 'FieldMismatch' && result.data.length === 0
  );

  if (criticalErrors.length > 0 && result.data.length === 0) {
    throw new Error(`CSV parsing failed: ${criticalErrors[0].message}`);
  }

  if (result.data.length === 0) {
    throw new Error('CSV file contains no valid data rows');
  }

  return result.data as Record<string, any>[];
}

export function parseJSON(buffer: Buffer): Record<string, any>[] {
  const jsonString = buffer.toString('utf-8').replace(/^\uFEFF/, '').trim();

  if (!jsonString) {
    throw new Error('JSON file is empty');
  }

  const parsed = JSON.parse(jsonString);

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) throw new Error('JSON file is empty');
    if (typeof parsed[0] !== 'object' || parsed[0] === null) {
      throw new Error('JSON must be an array of objects');
    }
    return parsed;
  }

  if (typeof parsed === 'object' && parsed !== null) {
    return [parsed];
  }

  throw new Error('JSON must be an array of objects or an object');
}