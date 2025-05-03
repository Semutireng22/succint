export interface SimulationResult {
  transactions: number;
  costWithoutSuccinct: number;
  costWithSuccinct: number;
  timeWithoutSuccinct: number; // in seconds
  timeWithSuccinct: number; // in seconds
  costSavings: number;
  timeSavings: number; // in seconds
  costSavingsPercentage: number;
  timeSavingsPercentage: number;
}

// Type for use case parameters
export type UseCaseParams = {
    costPerTxWithout: number;
    costPerTxWith: number;
    baseCostWith: number;
    timePerTxWithout: number; // Time per tx without Succinct (in seconds)
    timePerBatchWith: number; // Time per batch with Succinct (in seconds)
    name: string;
};

// Calculate savings based on transaction count and use case parameters
export function calculateSavings(transactions: number, params: UseCaseParams): SimulationResult {
  if (transactions <= 0) {
    return {
      transactions: 0,
      costWithoutSuccinct: 0,
      costWithSuccinct: 0,
      timeWithoutSuccinct: 0,
      timeWithSuccinct: 0,
      costSavings: 0,
      timeSavings: 0,
      costSavingsPercentage: 0,
      timeSavingsPercentage: 0,
    };
  }

  const costWithoutSuccinct = transactions * params.costPerTxWithout;
  // Simplified cost model: base cost + per-tx cost
  const costWithSuccinct = params.baseCostWith + transactions * params.costPerTxWith;

  const timeWithoutSuccinct = transactions * params.timePerTxWithout;
  // Simplified time model: assumes one batch proof covers all transactions
  const timeWithSuccinct = params.timePerBatchWith;

  const costSavings = costWithoutSuccinct - costWithSuccinct;
  const timeSavings = timeWithoutSuccinct - timeWithSuccinct;

  const costSavingsPercentage = costWithoutSuccinct > 0 ? (costSavings / costWithoutSuccinct) * 100 : 0;
  const timeSavingsPercentage = timeWithoutSuccinct > 0 ? (timeSavings / timeWithoutSuccinct) * 100 : 0;

  return {
    transactions,
    costWithoutSuccinct: parseFloat(costWithoutSuccinct.toFixed(2)), // Use 2 decimal places for currency
    costWithSuccinct: parseFloat(costWithSuccinct.toFixed(2)),
    timeWithoutSuccinct: parseFloat(timeWithoutSuccinct.toFixed(1)), // Use 1 decimal place for seconds
    timeWithSuccinct: parseFloat(timeWithSuccinct.toFixed(1)),
    costSavings: parseFloat(Math.max(0, costSavings).toFixed(2)), // Ensure non-negative
    timeSavings: parseFloat(Math.max(0, timeSavings).toFixed(1)), // Ensure non-negative
    costSavingsPercentage: parseFloat(Math.max(0, costSavingsPercentage).toFixed(1)), // Use 1 decimal place for percentage
    timeSavingsPercentage: parseFloat(Math.max(0, timeSavingsPercentage).toFixed(1)),
  };
}

// Helper function to format time (seconds to readable format: s, min, h:m)
export function formatTime(seconds: number): string {
    if (seconds < 0) seconds = 0;
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = seconds / 60;
    if (minutes < 60) return `${minutes.toFixed(1)}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = (minutes % 60).toFixed(0);
    return `${hours}h ${remainingMinutes}m`;
}

// Helper function to format currency
export function formatCurrency(amount: number): string {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
