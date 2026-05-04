const PRODUCTS = ['Widget A', 'Widget B', 'Widget C', 'Widget D'];
const REGIONS = ['North', 'South', 'East', 'West'];
const CATEGORIES = ['Electronics', 'Clothing', 'Furniture', 'Sports'];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export interface MockOrder {
  timestamp: string;
  product: string;
  region: string;
  category: string;
  revenue: number;
  units_sold: number;
  order_id: string;
}

let orderCounter = 1000;

export function generateMockOrder(): MockOrder {
  orderCounter++;
  const units = randomBetween(1, 50);
  const pricePerUnit = randomBetween(50, 500);

  return {
    timestamp: new Date().toISOString(),
    product: randomFrom(PRODUCTS),
    region: randomFrom(REGIONS),
    category: randomFrom(CATEGORIES),
    revenue: units * pricePerUnit,
    units_sold: units,
    order_id: `ORD-${orderCounter}`,
  };
}

export function generateInitialBatch(count: number = 20): MockOrder[] {
  const orders: MockOrder[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    orderCounter++;
    const units = randomBetween(1, 50);
    const pricePerUnit = randomBetween(50, 500);

    orders.push({
      timestamp: new Date(now - (count - i) * 5000).toISOString(),
      product: randomFrom(PRODUCTS),
      region: randomFrom(REGIONS),
      category: randomFrom(CATEGORIES),
      revenue: units * pricePerUnit,
      units_sold: units,
      order_id: `ORD-${orderCounter}`,
    });
  }

  return orders;
}