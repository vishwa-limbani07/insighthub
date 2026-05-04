interface AggregationRequest {
  xAxis: string;
  yAxis: string;
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max';
  groupBy?: string;
  sortBy?: 'label' | 'value';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

interface ChartDataPoint {
  name: string;
  value: number;
}

interface GroupedChartDataPoint {
  name: string;
  series: { name: string; value: number }[];
}

export function aggregateData(
  data: Record<string, any>[],
  config: AggregationRequest
): ChartDataPoint[] | GroupedChartDataPoint[] {
  const { xAxis, yAxis, aggregation, groupBy, sortBy, sortOrder, limit } = config;

  // If groupBy is specified, return grouped data (for grouped bar, stacked, multi-line)
  if (groupBy && groupBy !== xAxis) {
    return aggregateGrouped(data, xAxis, yAxis, aggregation, groupBy);
  }

  // Simple aggregation: group by xAxis, aggregate yAxis
  const groups = new Map<string, number[]>();

  for (const row of data) {
    const key = String(row[xAxis] ?? 'Unknown').trim();
    const rawVal = row[yAxis];
    const val = parseNumeric(rawVal);

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    if (val !== null) {
      groups.get(key)!.push(val);
    }
  }

  let result: ChartDataPoint[] = [];

  for (const [name, values] of groups) {
    result.push({
      name,
      value: applyAggregation(values, aggregation),
    });
  }

  // Sort
  result = sortResults(result, sortBy || 'label', sortOrder || 'asc');

  // Limit
  if (limit && limit > 0) {
    result = result.slice(0, limit);
  }

  return result;
}

function aggregateGrouped(
  data: Record<string, any>[],
  xAxis: string,
  yAxis: string,
  aggregation: string,
  groupBy: string
): GroupedChartDataPoint[] {
  // Nested map: xAxis value -> groupBy value -> array of numbers
  const groups = new Map<string, Map<string, number[]>>();

  for (const row of data) {
    const xKey = String(row[xAxis] ?? 'Unknown').trim();
    const groupKey = String(row[groupBy] ?? 'Unknown').trim();
    const val = parseNumeric(row[yAxis]);

    if (!groups.has(xKey)) {
      groups.set(xKey, new Map());
    }
    const innerMap = groups.get(xKey)!;
    if (!innerMap.has(groupKey)) {
      innerMap.set(groupKey, []);
    }
    if (val !== null) {
      innerMap.get(groupKey)!.push(val);
    }
  }

  const result: GroupedChartDataPoint[] = [];

  for (const [name, seriesMap] of groups) {
    const series: { name: string; value: number }[] = [];
    for (const [seriesName, values] of seriesMap) {
      series.push({
        name: seriesName,
        value: applyAggregation(values, aggregation),
      });
    }
    result.push({ name, series });
  }

  return result;
}

function applyAggregation(values: number[], aggregation: string): number {
  if (values.length === 0) return 0;

  switch (aggregation) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0);
    case 'avg':
      return values.reduce((a, b) => a + b, 0) / values.length;
    case 'count':
      return values.length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    default:
      return values.reduce((a, b) => a + b, 0);
  }
}

function parseNumeric(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  const cleaned = String(value).replace(/[,$%\s]/g, '');
  const num = Number(cleaned);
  return isNaN(num) ? null : num;
}

function sortResults(
  data: ChartDataPoint[],
  sortBy: string,
  sortOrder: string
): ChartDataPoint[] {
  return data.sort((a, b) => {
    const compare = sortBy === 'value'
      ? a.value - b.value
      : a.name.localeCompare(b.name);
    return sortOrder === 'desc' ? -compare : compare;
  });
}