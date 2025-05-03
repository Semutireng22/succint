export interface SimulationResult {
  transactions: number;
  costWithoutSuccinct: number;
  costWithSuccinct: number;
  timeWithoutSuccinct: number; // in hours
  timeWithSuccinct: number; // in hours
  costSavings: number;
  timeSavings: number;
  costSavingsPercentage: number;
  timeSavingsPercentage: number;
}

// New: Define type for parameters
export type UseCaseParams = {
    costPerTxWithout: number;
    costPerTxWith: number;
    baseCostWith: number;
    timePerTxWithout: number;
    timePerBatchWith: number;
    name: string;
};

// Replace with actual benchmark data or more complex models.
// const COST_PER_TX_WITHOUT = 0.005; // Example cost in USD per tx without Succinct
// const COST_PER_TX_WITH = 0.0001; // Example cost in USD per tx with Succinct (batching effect)
// const BASE_COST_WITH = 1; // Example base cost in USD for a single ZK proof batch with Succinct
// const TIME_PER_TX_WITHOUT = 0.5; // Example verification time in minutes per tx without Succinct
// const TIME_PER_BATCH_WITH = 10 / 60; // Example verification time in minutes for a ZK proof batch with Succinct

// Modified: accept a UseCaseParams argument
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
  // Simplified cost model for Succinct: base cost + small per-tx cost (or just base cost if batching handles many)
  const costWithSuccinct = params.baseCostWith + transactions * params.costPerTxWith;

  const timeWithoutSuccinct = transactions * params.timePerTxWithout;
  // Simplified time model for Succinct: assumes one batch proof covers all transactions
  const timeWithSuccinct = params.timePerBatchWith;

  const costSavings = costWithoutSuccinct - costWithSuccinct;
  const timeSavings = timeWithoutSuccinct - timeWithSuccinct;

  const costSavingsPercentage = costWithoutSuccinct > 0 ? (costSavings / costWithoutSuccinct) * 100 : 0;
  const timeSavingsPercentage = timeWithoutSuccinct > 0 ? (timeSavings / timeWithoutSuccinct) * 100 : 0;

  return {
    transactions,
    costWithoutSuccinct: parseFloat(costWithoutSuccinct.toFixed(4)),
    costWithSuccinct: parseFloat(costWithSuccinct.toFixed(4)),
    timeWithoutSuccinct: parseFloat(timeWithoutSuccinct.toFixed(2)),
    timeWithSuccinct: parseFloat(timeWithSuccinct.toFixed(2)),
    costSavings: parseFloat(costSavings.toFixed(4)),
    timeSavings: parseFloat(timeSavings.toFixed(2)),
    costSavingsPercentage: parseFloat(Math.max(0, costSavingsPercentage).toFixed(2)), // Ensure percentage is not negative
    timeSavingsPercentage: parseFloat(Math.max(0, timeSavingsPercentage).toFixed(2)), // Ensure percentage is not negative
  };
}

// Helper function to format time (hours to hh:mm or similar)
export function formatTime(hours: number): string {
    if (hours < 0) hours = 0;
    if (hours < 1) {
        const minutes = hours * 60;
        return `${minutes.toFixed(1)}min`;
    }
    const fullHours = Math.floor(hours);
    const minutes = Math.floor((hours - fullHours) * 60);
    return `${fullHours}h ${minutes}m`;
}

// Helper function to format currency
export function formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
}
