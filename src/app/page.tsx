'use client';

import { useState, useMemo, useEffect } from 'react';
import TerminalWindow from '@/components/terminal-window';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateSavings, formatTime, formatCurrency, type SimulationResult } from '@/lib/calculateSavings';
import { ArrowRight, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DEFAULT_TRANSACTIONS = 1000;
const MAX_TRANSACTIONS = 100000;

// New: Define use case parameters
const useCaseParameters = {
  'Cosmos IBC': {
    costPerTxWithout: 0.01, // Average of $10-$100
    costPerTxWith: 0.0005, // Average of $0.1-$1
    baseCostWith: 0.5,
    timePerTxWithout: 0.2083, // Average of 5-20 minutes in hours
    timePerBatchWith: 0.0083, // In hours
    name: 'Cosmos IBC',
    description: "Connects 120 Cosmos chains to Ethereum with a fast, cheap, and trustless bridge.",
    withoutSuccinctDetails: "Cost $10-$100/tx, 5-20 min verification.",
    withSuccinctDetails: "Cost $0.1-$1/tx, ~30 sec verification.",
  },
  'Celestia Blobstream': {
    costPerTxWithout: 7.5, // Average of $5-$10
    costPerTxWith: 0.3, // Average of $0.1-$0.5
    baseCostWith: 0.3,
    timePerTxWithout: 0.125, // Average of 5-10 minutes in hours
    timePerBatchWith: 0.0083, // In hours
    name: 'Celestia Blobstream',
    description: "Provides a trustless and cheap bridge between Celestia and Ethereum for data availability.",
    withoutSuccinctDetails: "Cost $5-$10/tx, 5-10 min verification.",
    withSuccinctDetails: "Cost $0.1-$0.5/tx, ~30 sec verification.",
  },
  'Avail VectorX': {
    costPerTxWithout: 3, // Average of $1-$5
    costPerTxWith: 0.3, // Average of $0.1-$0.5
    baseCostWith: 0.3,
    timePerTxWithout: 0.6667, // Average of 20-60 minutes in hours
    timePerBatchWith: 0.0028, // In hours
    name: 'Avail VectorX',
    description: "Enables Ethereum to validate Avail blockchain data quickly and cheaply.",
    withoutSuccinctDetails: "Cost $1-$5/tx, 20-60 min verification.",
    withSuccinctDetails: "Cost $0.1-$0.5/tx, ~10 sec verification.",
  },
};

// New: Define type for use case selection
type UseCase = keyof typeof useCaseParameters;

export default function Home() {
  const [transactionCount, setTransactionCount] = useState<number>(DEFAULT_TRANSACTIONS);
  const [inputValue, setInputValue] = useState<string>(DEFAULT_TRANSACTIONS.toString());
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [debouncedCount, setDebouncedCount] = useState<number>(DEFAULT_TRANSACTIONS);
  // New: Add state for selected use case, defaulting to Cosmos
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase>('Cosmos IBC');

   // Debounce transaction count update for calculations
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCount(transactionCount);
    }, 300); // 300ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [transactionCount]);

  // Perform calculation when debounced count changes
  useEffect(() => {
     if (debouncedCount > 0) {
       const result = calculateSavings(debouncedCount, useCaseParameters[selectedUseCase]);
       setSimulationResult(result);
     } else {
       setSimulationResult(calculateSavings(0, useCaseParameters[selectedUseCase])); // Handle zero/negative case
     }
  }, [debouncedCount, selectedUseCase]);


  const handleSliderChange = (value: number[]) => {
    const newCount = value[0];
    setTransactionCount(newCount);
    setInputValue(newCount.toString());
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= MAX_TRANSACTIONS) {
      setTransactionCount(numValue);
    } else if (value === '') {
       setTransactionCount(0);
    }
  };

   const handleInputBlur = () => {
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < 0) {
      setTransactionCount(0);
      setInputValue('0');
    } else if (numValue > MAX_TRANSACTIONS) {
      setTransactionCount(MAX_TRANSACTIONS);
      setInputValue(MAX_TRANSACTIONS.toString());
    } else {
       // Already handled by handleInputChange + debounce
    }
  };

  // New: Handler for use case selection
  const handleUseCaseChange = (value: UseCase) => {
      setSelectedUseCase(value);
  };


  const chartData = useMemo(() => {
    if (!simulationResult) return [];
    return [
      {
        name: 'Cost',
        'Without Succinct': simulationResult.costWithoutSuccinct,
        'With Succinct': simulationResult.costWithSuccinct,
      },
      // Scale time for better visualization - maybe represent in minutes if large
      {
        name: 'Time',
        'Without Succinct': simulationResult.timeWithoutSuccinct,
        'With Succinct': simulationResult.timeWithSuccinct,
      },
    ];
  }, [simulationResult]);

  const currentUseCase = useCaseParameters[selectedUseCase];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 lg:p-12 bg-gradient-to-br from-background via-secondary to-background">
      <div className="w-full max-w-6xl space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-primary mb-8 flex items-center justify-center gap-2">
          <Zap className="w-8 h-8" /> Succinct ZkProof Simulator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Overview Window */}
          <TerminalWindow title="Project Overview - ZkProof Comparison" className="h-full">
            <div className="space-y-4 text-sm md:text-base">
              <p><span className="text-primary font-semibold">$</span> Welcome to the Succinct ZkProof Simulator.</p>
              <p><span className="text-primary font-semibold">$</span> This tool demonstrates the potential cost and time savings by integrating Succinct Labs' ZK technology for transaction verification.</p>
              <p><span className="text-muted-foreground"># Comparing traditional verification vs. Succinct ZK batch proofs.</span></p>
              <p><span className="text-primary font-semibold">$</span> Select a use case and input the number of transactions to see the difference.</p>

              {/* SP1 and ZKP Explanation */}
              <div className="mt-4 border-t border-border pt-4 text-muted-foreground">
                <h4 className="font-semibold">Understanding SP1 and ZKPs</h4>
                <p>
                  <span className="font-semibold text-primary">SP1</span> is a zkVM open-source based in Rust that allows developers to generate{' '}
                  <span className="group relative">
                    ZKPs
                    <span className="hidden group-hover:block absolute bg-gray-700 text-white p-2 rounded text-xs z-10">
                      Zero-Knowledge Proofs verify data without revealing details, enhancing privacy and efficiency.
                    </span>
                  </span>{' '}
                  for RISC-V program execution, used to verify blockchain consensus for Cosmos, Celestia, and Avail.
                </p>
                <p>
                  <span className="font-semibold text-primary">ZKPs</span> are cryptographic techniques that verify data integrity without revealing the data itself, enabling secure, inexpensive, and fast blockchain transactions.
                </p>
                <p className="mt-2">
                  In {currentUseCase.name}, ZKPs significantly reduce transaction costs and verification times.
                </p>
                <pre className="mt-2 rounded bg-gray-800 p-2 text-xs">
                  <code className="text-gray-300">
                    fn verify_consensus(input: ConsensusData) -> bool &#123;{'\n'}
                    &nbsp;&nbsp;&nbsp;&nbsp;// Consensus verification logic{'\n'}
                    &nbsp;&nbsp;&nbsp;&nbsp;true{'\n'}
                    &#125;
                  </code>
                </pre>
              </div>
              {/* End SP1 and ZKP Explanation */}

              <Button
                variant="link"
                className="text-accent hover:text-accent/80 p-0 h-auto"
                onClick={() => window.open('https://succinct.xyz', '_blank')}
              >
                Learn more at succinct.xyz <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </div>
          </TerminalWindow>

          {/* Interactive Simulation Window */}
          <TerminalWindow title="Interactive Simulation" className="h-full flex flex-col">
             <div className="flex-grow flex flex-col space-y-6">
                 {/* New: Use Case Selection as Tabs */}
                <Tabs value={selectedUseCase} onValueChange={handleUseCaseChange}>
                    <TabsList className="grid w-full grid-cols-3">
                        {Object.keys(useCaseParameters).map((key) => (
                            <TabsTrigger key={key} value={key as UseCase} className="data-[state=active]:bg-secondary">{useCaseParameters[key as UseCase].name}</TabsTrigger>
                        ))}
                    </TabsList>
                    {Object.keys(useCaseParameters).map((key) => (
                        <TabsContent key={key} value={key as UseCase}>
                            {/* Input Section */}
                            <div className="space-y-3">
                                <label htmlFor="transactionCountInput" className="block text-sm font-medium text-foreground">
                                    Number of Transactions:
                                </label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        id="transactionCountInput"
                                        type="number"
                                        min="0"
                                        max={MAX_TRANSACTIONS}
                                        value={inputValue}
                                        onChange={handleInputChange}
                                        onBlur={handleInputBlur}
                                        className="w-32 bg-input text-foreground"
                                        aria-label="Number of Transactions"
                                    />
                                    <Slider
                                        value={[transactionCount]}
                                        onValueChange={handleSliderChange}
                                        max={MAX_TRANSACTIONS}
                                        step={Math.max(1, Math.floor(MAX_TRANSACTIONS / 100))} // Dynamic step
                                        className="flex-1"
                                        aria-label="Transaction Count Slider"
                                    />
                                </div>
                                 <p className="text-xs text-muted-foreground">Slide or type a value between 0 and {MAX_TRANSACTIONS.toLocaleString()}.</p>
                            </div>

                             {/* Results Display */}
                            {simulationResult && (
                                <div className="space-y-4 flex-grow">
                                    <h3 className="text-lg font-semibold text-primary">Simulation Results ({simulationResult.transactions.toLocaleString()} Transactions):</h3>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                       <Card className="bg-card/80">
                                         <CardHeader className="pb-2">
                                           <CardTitle className="text-base font-medium text-muted-foreground">Cost Comparison</CardTitle>
                                         </CardHeader>
                                         <CardContent>
                                           <p>Without Succinct: <span className="font-semibold">{formatCurrency(simulationResult.costWithoutSuccinct)}</span></p>
                                           <p>With Succinct: <span className="font-semibold text-primary">{formatCurrency(simulationResult.costWithSuccinct)}</span></p>
                                           <p className="mt-2 text-accent">Savings: {formatCurrency(simulationResult.costSavings)} ({simulationResult.costSavingsPercentage}%)</p>
                                         </CardContent>
                                       </Card>
                                       <Card className="bg-card/80">
                                           <CardHeader className="pb-2">
                                               <CardTitle className="text-base font-medium text-muted-foreground">Time Comparison</CardTitle>
                                           </CardHeader>
                                           <CardContent>
                                               <p>Without Succinct: <span className="font-semibold">{formatTime(simulationResult.timeWithoutSuccinct)}</span></p>
                                               <p>With Succinct: <span className="font-semibold text-primary">{formatTime(simulationResult.timeWithSuccinct)}</span></p>
                                                <p className="mt-2 text-accent">Savings: {formatTime(simulationResult.timeSavings)} ({simulationResult.timeSavingsPercentage}%)</p>
                                           </CardContent>
                                       </Card>
                                     </div>

                                     {/* Chart */}
                                     <div className="h-48 md:h-64 w-full mt-4">
                                       <ResponsiveContainer width="100%" height="100%">
                                         <BarChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                                           <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                           <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                           <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => typeof value === 'number' && value > 1000 ? `${(value/1000).toFixed(0)}k` : value} />
                                           <Tooltip
                                               contentStyle={{
                                                   backgroundColor: 'hsl(var(--card))',
                                                   borderColor: 'hsl(var(--border))',
                                                   color: 'hsl(var(--foreground))',
                                                   borderRadius: 'var(--radius)',
                                               }}
                                               formatter={(value, name, props) => {
                                                  if (props.payload.name === 'Cost') return formatCurrency(value as number);
                                                  if (props.payload.name === 'Time') return formatTime(value as number);
                                                  return value;
                                               }}
                                           />
                                           <Legend wrapperStyle={{ fontSize: '12px' }}/>
                                           <Bar dataKey="Without Succinct" fill="hsl(var(--secondary-foreground))" radius={[4, 4, 0, 0]} />
                                           <Bar dataKey="With Succinct" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                         </BarChart>
                                       </ResponsiveContainer>
                                     </div>
                                </div>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
          </TerminalWindow>
        </div>
      </div>
    </main>
  );
}
