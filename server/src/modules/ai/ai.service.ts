import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../../config/env';

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);

interface ColumnSchema {
  name: string;
  type: string;
  sampleValues: any[];
  uniqueCount: number;
}

interface AIChartConfig {
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'grouped-bar' | 'table';
  xAxis: string;
  yAxis: string;
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max';
  groupBy?: string;
  title: string;
  explanation: string;
}

export async function generateChartConfig(
  question: string,
  columns: ColumnSchema[],
  datasetName: string
): Promise<AIChartConfig> {
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const columnDescriptions = columns
    .map(
      (col) =>
        `- "${col.name}" (type: ${col.type}, ${col.uniqueCount} unique values, samples: ${col.sampleValues.slice(0, 3).join(', ')})`
    )
    .join('\n');

  const prompt = `You are a data visualization assistant. Given a user's natural language question about their dataset, determine the best chart configuration.

DATASET: "${datasetName}"
COLUMNS:
${columnDescriptions}

USER QUESTION: "${question}"

RULES:
1. chartType must be one of: "bar", "line", "pie", "area", "grouped-bar", "table"
2. xAxis must be an EXACT column name from the list above (typically a category, string, or date column)
3. yAxis must be an EXACT column name from the list above (must be a "number" type column)
4. aggregation must be one of: "sum", "avg", "count", "min", "max"
5. groupBy is optional — use it only when the question implies comparison across a second category. Must be an EXACT column name.
6. title should be a concise, human-readable chart title
7. explanation should briefly explain why you chose this configuration (1-2 sentences)

CHOOSING THE RIGHT CHART TYPE:
- "bar": Best for comparing values across categories (e.g., "revenue by region")
- "line": Best for trends over time (e.g., "revenue over months")
- "pie": Best for showing proportions/shares (e.g., "distribution of sales by category")
- "area": Best for cumulative trends over time
- "grouped-bar": Best when comparing across TWO categories (e.g., "revenue by region for each product")
- "table": Best when the user asks for exact numbers or a detailed breakdown

Respond with ONLY a valid JSON object, no markdown, no backticks, no explanation outside the JSON:

{
  "chartType": "...",
  "xAxis": "...",
  "yAxis": "...",
  "aggregation": "...",
  "groupBy": "...",
  "title": "...",
  "explanation": "..."
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();

    // Clean potential markdown fencing
    const cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    const parsed: AIChartConfig = JSON.parse(cleaned);

    // Validate that column names actually exist
    const columnNames = columns.map((c) => c.name);

    if (!columnNames.includes(parsed.xAxis)) {
      throw new Error(`AI suggested invalid xAxis column: "${parsed.xAxis}"`);
    }
    if (!columnNames.includes(parsed.yAxis)) {
      throw new Error(`AI suggested invalid yAxis column: "${parsed.yAxis}"`);
    }
    if (parsed.groupBy && !columnNames.includes(parsed.groupBy)) {
      parsed.groupBy = undefined; // Silently remove invalid groupBy
    }

    return parsed;
  } catch (error: any) {
    // If JSON parsing fails, try to extract JSON from the response
    if (error instanceof SyntaxError) {
      throw new Error(
        'AI returned an invalid response. Please try rephrasing your question.'
      );
    }
    throw error;
  }
}