export interface SimulationResult {
  transactions: number;
  costWithoutSuccinct: number;
  costWithSuccinct: number;
  timeWithoutSuccinct: number; // in seconds
  timeWithSuccinct: number; // in seconds
  costSavings: number;
  timeSavings: number;
  costSavingsPercentage: number;
  timeSavingsPercentage: number;
}

// These are placeholder values and assumptions.
// Replace with actual benchmark data or more complex models.
const COST_PER_TX_WITHOUT = 0.005; // Example cost in USD per tx without Succinct
const COST_PER_TX_WITH = 0.0001; // Example cost in USD per tx with Succinct (batching effect)
const BASE_COST_WITH = 1; // Example base cost in USD for a single ZK proof batch with Succinct
const TIME_PER_TX_WITHOUT = 0.5; // Example verification time in seconds per tx without Succinct
const TIME_PER_BATCH_WITH = 10; // Example verification time in seconds for a ZK proof batch with Succinct

export function calculateSavings(transactions: number): SimulationResult {
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

  const costWithoutSuccinct = transactions * COST_PER_TX_WITHOUT;
  // Simplified cost model for Succinct: base cost + small per-tx cost (or just base cost if batching handles many)
  const costWithSuccinct = BASE_COST_WITH + transactions * COST_PER_TX_WITH;

  const timeWithoutSuccinct = transactions * TIME_PER_TX_WITHOUT;
  // Simplified time model for Succinct: assumes one batch proof covers all transactions
  const timeWithSuccinct = TIME_PER_BATCH_WITH;

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

// Helper function to format time (seconds to hh:mm:ss or similar)
export function formatTime(seconds: number): string {
    if (seconds < 0) seconds = 0;
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}min`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = (seconds % 60).toFixed(0);
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
}

// Helper function to format currency
export function formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
}
