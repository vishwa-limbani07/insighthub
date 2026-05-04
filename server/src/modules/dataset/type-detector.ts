interface DetectionResult {
  type: 'number' | 'date' | 'string' | 'category' | 'boolean';
  uniqueCount: number;
  nullCount: number;
  sampleValues: any[];
}

const DATE_PATTERNS = [
  /^\d{4}-\d{2}-\d{2}$/,                          // 2024-01-15
  /^\d{2}\/\d{2}\/\d{4}$/,                        // 01/15/2024
  /^\d{2}-\d{2}-\d{4}$/,                          // 15-01-2024
  /^\d{4}\/\d{2}\/\d{2}$/,                        // 2024/01/15
  /^\w{3}\s\d{1,2},?\s\d{4}$/,                    // Jan 15, 2024
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,        // ISO 8601
];

const BOOLEAN_VALUES = new Set([
  'true', 'false', 'yes', 'no', '1', '0',
  'y', 'n', 't', 'f',
]);

function isNumeric(value: string): boolean {
  if (value.trim() === '') return false;
  const cleaned = value.replace(/[,$%\s]/g, '');
  return !isNaN(Number(cleaned)) && cleaned !== '';
}

function isDate(value: string): boolean {
  if (value.trim() === '') return false;
  // Check against known patterns first (faster than parsing)
  if (DATE_PATTERNS.some((pattern) => pattern.test(value.trim()))) {
    return true;
  }
  // Fallback: try to parse, but only if it looks date-like
  const parsed = Date.parse(value);
  return !isNaN(parsed) && value.length > 5;
}

function isBoolean(value: string): boolean {
  return BOOLEAN_VALUES.has(value.trim().toLowerCase());
}

function isNull(value: any): boolean {
  if (value === null || value === undefined) return true;
  const str = String(value).trim().toLowerCase();
  return str === '' || str === 'null' || str === 'n/a' || str === 'na'
    || str === 'undefined' || str === '-';
}

export function detectColumnType(values: any[]): DetectionResult {
  const nonNullValues = values.filter((v) => !isNull(v));
  const nullCount = values.length - nonNullValues.length;
  const stringValues = nonNullValues.map((v) => String(v).trim());

  // Need at least some values to detect
  if (stringValues.length === 0) {
    return {
      type: 'string',
      uniqueCount: 0,
      nullCount,
      sampleValues: [],
    };
  }

  const uniqueValues = new Set(stringValues);
  const uniqueCount = uniqueValues.size;
  const sampleValues = stringValues.slice(0, 5);

  // Sample up to 100 values for type checking
  const sample = stringValues.slice(0, 100);
  const threshold = 0.85; // 85% of values must match a type

  // Check boolean first (most restrictive)
  const booleanRatio = sample.filter(isBoolean).length / sample.length;
  if (booleanRatio >= threshold) {
    return { type: 'boolean', uniqueCount, nullCount, sampleValues };
  }

  // Check numeric
  const numericRatio = sample.filter(isNumeric).length / sample.length;
  if (numericRatio >= threshold) {
    return { type: 'number', uniqueCount, nullCount, sampleValues };
  }

  // Check date
  const dateRatio = sample.filter(isDate).length / sample.length;
  if (dateRatio >= threshold) {
    return { type: 'date', uniqueCount, nullCount, sampleValues };
  }

  // Check if it's a category (low cardinality string)
  // If unique values are less than 30% of total values and under 50 unique values
  if (uniqueCount < stringValues.length * 0.3 && uniqueCount <= 50) {
    return { type: 'category', uniqueCount, nullCount, sampleValues };
  }

  // Default: string
  return { type: 'string', uniqueCount, nullCount, sampleValues };
}

export function detectAllColumns(
  data: Record<string, any>[]
): { name: string; detection: DetectionResult }[] {
  if (data.length === 0) return [];

  const columnNames = Object.keys(data[0]);

  return columnNames.map((name) => {
    const values = data.map((row) => row[name]);
    return { name, detection: detectColumnType(values) };
  });
}