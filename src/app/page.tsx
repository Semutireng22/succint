'use client';

import { useState, useMemo, useEffect } from 'react';
import TerminalWindow from '@/components/terminal-window';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateSavings, formatTime, formatCurrency, type SimulationResult } from '@/lib/calculateSavings';
import { ArrowRight, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import ShadCN Tooltip

const DEFAULT_TRANSACTIONS = 1000;
const MAX_TRANSACTIONS = 100000;

// Updated use case parameters based on user request
const useCaseParameters = {
  'Cosmos IBC': {
    costPerTxWithout: 55, // Midpoint of $10-$100
    costPerTxWith: 0.55, // Midpoint of $0.1-$1
    baseCostWith: 0.1, // Assumed base cost
    timePerTxWithout: 12.5 * 60, // Midpoint of 5-20 minutes in seconds
    timePerBatchWith: 30, // ~30 seconds in seconds
    name: 'Cosmos IBC',
    description: "Connects 120 Cosmos chains to Ethereum with a fast, cheap, and trustless bridge.",
    withoutSuccinctDetails: "Cost $10-$100/tx, 5-20 min verification.",
    withSuccinctDetails: "Cost $0.1-$1/tx, ~30 sec verification.",
  },
  'Celestia Blobstream': {
    costPerTxWithout: 7.5, // Midpoint of $5-$10
    costPerTxWith: 0.3, // Midpoint of $0.1-$0.5
    baseCostWith: 0.1, // Assumed base cost
    timePerTxWithout: 7.5 * 60, // Midpoint of 5-10 minutes in seconds
    timePerBatchWith: 30, // ~30 seconds in seconds
    name: 'Celestia Blobstream',
    description: "Provides a trustless and cheap bridge between Celestia and Ethereum for data availability.",
    withoutSuccinctDetails: "Cost $5-$10/tx, 5-10 min verification.",
    withSuccinctDetails: "Cost $0.1-$0.5/tx, ~30 sec verification.",
  },
  'Avail VectorX': {
    costPerTxWithout: 3, // Midpoint of $1-$5
    costPerTxWith: 0.3, // Midpoint of $0.1-$0.5
    baseCostWith: 0.1, // Assumed base cost
    timePerTxWithout: 40 * 60, // Midpoint of 20-60 minutes in seconds
    timePerBatchWith: 10, // ~10 seconds in seconds
    name: 'Avail VectorX',
    description: "Enables Ethereum to validate Avail blockchain data quickly and cheaply.",
    withoutSuccinctDetails: "Cost $1-$5/tx, 20-60 min verification.",
    withSuccinctDetails: "Cost $0.1-$0.5/tx, ~10 sec verification.",
  },
};

type UseCase = keyof typeof useCaseParameters;

export default function Home() {
  const [transactionCount, setTransactionCount] = useState<number>(DEFAULT_TRANSACTIONS);
  const [inputValue, setInputValue] = useState<string>(DEFAULT_TRANSACTIONS.toString());
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [debouncedCount, setDebouncedCount] = useState<number>(DEFAULT_TRANSACTIONS);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase>('Cosmos IBC');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCount(transactionCount);
    }, 300);
    return () => clearTimeout(handler);
  }, [transactionCount]);

  useEffect(() => {
    const result = calculateSavings(debouncedCount, useCaseParameters[selectedUseCase]);
    setSimulationResult(result);
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
    }
  };

  const handleUseCaseChange = (value: string) => {
    if (value in useCaseParameters) {
      setSelectedUseCase(value as UseCase);
    }
  };

  const chartData = useMemo(() => {
    if (!simulationResult) return [];
    return [
      {
        name: 'Cost',
        'Without Succinct': simulationResult.costWithoutSuccinct,
        'With Succinct': simulationResult.costWithSuccinct,
      },
      {
        name: 'Time (s)', // Changed label to seconds
        'Without Succinct': simulationResult.timeWithoutSuccinct,
        'With Succinct': simulationResult.timeWithSuccinct,
      },
    ];
  }, [simulationResult]);

  const currentUseCase = useCaseParameters[selectedUseCase];

  const renderTooltipContent = (text: string) => (
      <TooltipContent className="max-w-xs bg-popover text-popover-foreground border border-border shadow-lg p-2 rounded-md text-xs">
          {text}
      </TooltipContent>
  );

  return (
    <TooltipProvider>
        <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 lg:p-12 bg-gradient-to-br from-background via-secondary to-background">
            <div className="w-full max-w-6xl space-y-8">
                <h1 className="text-3xl md:text-4xl font-bold text-center text-primary mb-8 flex items-center justify-center gap-2">
                    <Zap className="w-8 h-8" /> Succinct ZkProof Simulator
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Project Overview Window */}
                    <TerminalWindow title="Project Overview & Technology" className="h-full">
                        <div className="space-y-4 text-sm md:text-base">
                            <p><span className="text-primary font-semibold">$</span> Welcome to the Succinct ZkProof Simulator.</p>
                            <p><span className="text-primary font-semibold">$</span> This tool demonstrates the potential cost and time savings by integrating Succinct Labs' ZK technology for transaction verification.</p>
                            <p><span className="text-muted-foreground"># Comparing traditional verification vs. Succinct ZK batch proofs.</span></p>
                            <p><span className="text-primary font-semibold">$</span> Select a use case via the tabs in the simulation panel and input the number of transactions to see the difference.</p>

                            {/* Enhanced SP1 and ZKP Explanation */}
                            <div className="mt-6 border-t border-border pt-4">
                                <h4 className="text-lg font-semibold text-primary mb-2">Understanding the Technology</h4>
                                <div className="space-y-3 text-muted-foreground">
                                    <p>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="font-semibold text-primary border-b border-dashed border-primary cursor-help">SP1</span>
                                            </TooltipTrigger>
                                            {renderTooltipContent("Succinct Prover 1: An open-source zkVM for generating ZK proofs from standard Rust code.")}
                                        </Tooltip>
                                        {' '} is a high-performance, open-source zkVM (Zero-Knowledge Virtual Machine) built in Rust. It allows developers to generate {' '}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="font-semibold text-primary border-b border-dashed border-primary cursor-help">ZKPs</span>
                                            </TooltipTrigger>
                                            {renderTooltipContent("Zero-Knowledge Proofs: Cryptographic proofs that verify data correctness without revealing the data itself, ensuring privacy and efficiency.")}
                                        </Tooltip>
                                        {' '} for any Rust program compiled to the RISC-V instruction set. This is used to efficiently and trustlessly verify blockchain consensus or other computations on target chains like Ethereum.
                                    </p>
                                    <p>
                                        Key benefits of{' '}
                                        <Tooltip>
                                            <TooltipTrigger asChild><span className="font-semibold text-primary border-b border-dashed border-primary cursor-help">SP1</span></TooltipTrigger>
                                            {renderTooltipContent("Succinct Prover 1: An open-source zkVM for generating ZK proofs from standard Rust code.")}
                                        </Tooltip>
                                        {' '} include: simplicity (write standard Rust), high performance, and open-source accessibility.
                                    </p>
                                    <pre className="mt-2 rounded bg-card p-3 text-xs shadow-inner border border-border/50">
                                        <code className="text-foreground/80">
                                            {'// Example: Simplified Rust code for SP1'}{'\n'}
                                            {'#![no_main]'}{'\n'}
                                            {'use sp1_zkvm::io;'}{'\n'}
                                            {'\n'}
                                            {'#[sp1_zkvm::entry]'}{'\n'}
                                            {'fn main() {'}{'\n'}
                                            {'    let a = io::read::<u32>();'}{'\n'}
                                            {'    let b = io::read::<u32>();'}{'\n'}
                                            {'    let result = a.checked_add(b).expect("overflow");'}{'\n'}
                                            {'    io::commit(&result);'}{'\n'}
                                            {'}'}
                                        </code>
                                    </pre>
                                    <p className="mt-3">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="font-semibold text-primary border-b border-dashed border-primary cursor-help">ZKPs</span>
                                            </TooltipTrigger>
                                            {renderTooltipContent("Zero-Knowledge Proofs: Verify data without revealing details, enhancing privacy and efficiency.")}
                                        </Tooltip>
                                        {' '} enable {' '}
                                         <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="font-semibold text-primary border-b border-dashed border-primary cursor-help">trustless</span>
                                            </TooltipTrigger>
                                            {renderTooltipContent("Trustless: Systems that don't require trusting a central party; verification is done cryptographically.")}
                                        </Tooltip>
                                        {' '} verification by replacing large amounts of data with small, easily verifiable proofs. This significantly reduces gas costs and verification times on blockchains like Ethereum.
                                    </p>
                                    {/* Basic Diagram Concept (using text/emoji for simplicity) */}
                                    <div className="text-center mt-2 p-2 bg-card border border-border/50 rounded">
                                        <p className="text-xs font-mono">Blockchain Data 🧱 → SP1 Prover ✨ → Compact ZKP 📄 → Ethereum Verification ✅</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 border-t border-border pt-4 flex justify-center">
                              <Button
                                variant="link"
                                className="text-accent hover:text-accent/80 p-0 h-auto text-sm"
                                onClick={() => window.open('https://succinct.xyz', '_blank')}
                              >
                                Learn more at succinct.xyz <ArrowRight className="ml-1 w-4 h-4" />
                              </Button>
                            </div>
                        </div>
                    </TerminalWindow>

                    {/* Interactive Simulation Window */}
                    <TerminalWindow title="Interactive Simulation" className="h-full flex flex-col">
                        <div className="flex-grow flex flex-col space-y-6">
                            {/* Use Case Selection as Tabs */}
                            <Tabs value={selectedUseCase} onValueChange={handleUseCaseChange} className="w-full">
                                <TabsList className="grid w-full grid-cols-3 mb-4 bg-muted/50 border border-border">
                                    {Object.keys(useCaseParameters).map((key) => (
                                        <TabsTrigger
                                            key={key}
                                            value={key}
                                            className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                                        >
                                            {useCaseParameters[key as UseCase].name}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {Object.keys(useCaseParameters).map((key) => (
                                    <TabsContent key={key} value={key} className="mt-0 pt-4 border-t border-border space-y-6">
                                        {/* Use Case Description */}
                                        <div className="text-center">
                                          <p className="text-muted-foreground text-sm">{currentUseCase.description}</p>
                                          <div className="text-xs mt-1">
                                            <p>Traditional: {currentUseCase.withoutSuccinctDetails}</p>
                                            <p className="text-primary">With Succinct: {currentUseCase.withSuccinctDetails}</p>
                                          </div>
                                        </div>

                                        {/* Input Section */}
                                        <div className="space-y-3">
                                            <label htmlFor={`transactionCountInput-${key}`} className="block text-sm font-medium text-foreground">
                                                Number of Transactions:
                                            </label>
                                            <div className="flex items-center gap-4">
                                                <Input
                                                    id={`transactionCountInput-${key}`}
                                                    type="number"
                                                    min="0"
                                                    max={MAX_TRANSACTIONS}
                                                    value={inputValue}
                                                    onChange={handleInputChange}
                                                    onBlur={handleInputBlur}
                                                    className="w-32 bg-input text-foreground border-border"
                                                    aria-label="Number of Transactions"
                                                />
                                                <Slider
                                                    value={[transactionCount]}
                                                    onValueChange={handleSliderChange}
                                                    max={MAX_TRANSACTIONS}
                                                    step={Math.max(1, Math.floor(MAX_TRANSACTIONS / 100))}
                                                    className="flex-1"
                                                    aria-label="Transaction Count Slider"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">Slide or type a value between 0 and {MAX_TRANSACTIONS.toLocaleString()}.</p>
                                        </div>

                                        {/* Results Display */}
                                        {simulationResult && (
                                            <div className="space-y-4 flex-grow">
                                                <h3 className="text-lg font-semibold text-primary">Simulation Results ({simulationResult.transactions.toLocaleString()} Tx):</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <Card className="bg-card/80 border-border">
                                                        <CardHeader className="pb-2 pt-4">
                                                            <CardTitle className="text-base font-medium text-muted-foreground">Cost Comparison</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="pb-4">
                                                            <p>Without Succinct: <span className="font-semibold">{formatCurrency(simulationResult.costWithoutSuccinct)}</span></p>
                                                            <p>With Succinct: <span className="font-semibold text-primary">{formatCurrency(simulationResult.costWithSuccinct)}</span></p>
                                                            <p className="mt-2 text-accent font-medium">Savings: {formatCurrency(simulationResult.costSavings)} ({simulationResult.costSavingsPercentage}%)</p>
                                                        </CardContent>
                                                    </Card>
                                                    <Card className="bg-card/80 border-border">
                                                        <CardHeader className="pb-2 pt-4">
                                                            <CardTitle className="text-base font-medium text-muted-foreground">Time Comparison</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="pb-4">
                                                            <p>Without Succinct: <span className="font-semibold">{formatTime(simulationResult.timeWithoutSuccinct)}</span></p>
                                                            <p>With Succinct: <span className="font-semibold text-primary">{formatTime(simulationResult.timeWithSuccinct)}</span></p>
                                                            <p className="mt-2 text-accent font-medium">Savings: {formatTime(simulationResult.timeSavings)} ({simulationResult.timeSavingsPercentage}%)</p>
                                                        </CardContent>
                                                    </Card>
                                                </div>

                                                {/* Chart */}
                                                <div className="h-48 md:h-64 w-full mt-6">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
                                                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => typeof value === 'number' && value > 1000 ? `${(value / 1000).toFixed(0)}k` : value} />
                                                            <RechartsTooltip
                                                                contentStyle={{
                                                                    backgroundColor: 'hsl(var(--card))',
                                                                    borderColor: 'hsl(var(--border))',
                                                                    color: 'hsl(var(--foreground))',
                                                                    borderRadius: 'var(--radius)',
                                                                    fontSize: '12px',
                                                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                                                }}
                                                                formatter={(value, name, props) => {
                                                                    if (props.dataKey === 'Without Succinct' || props.dataKey === 'With Succinct') {
                                                                        if (props.payload.name === 'Cost') return formatCurrency(value as number);
                                                                        if (props.payload.name === 'Time (s)') return formatTime(value as number);
                                                                    }
                                                                    return value;
                                                                }}
                                                                cursor={{ fill: 'hsl(var(--accent)/0.1)' }}
                                                            />
                                                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
                                                            <Bar dataKey="Without Succinct" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} barSize={20} />
                                                            <Bar dataKey="With Succinct" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={20} />
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
                 {/* Consolidated Learn More Section */}
                <Card className="mt-8 bg-card/90 border border-border shadow-md backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl text-primary">Learn More About the Technology</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-3">
                        <p>
                           <strong>SP1 (Succinct Prover 1)</strong> is a groundbreaking zkVM that allows developers to prove the execution of standard Rust programs. This means complex logic, like verifying blockchain consensus, can be proven efficiently.
                        </p>
                        <p>
                           <strong>Zero-Knowledge Proofs (ZKPs)</strong> are the core cryptographic primitive enabling these advancements. They allow verification of computations without revealing underlying sensitive data, leading to massive improvements in scalability, privacy, and cost-efficiency for blockchain applications.
                        </p>
                        <p>
                            Together, SP1 and ZKPs enable use cases like the ones simulated above, making cross-chain communication and data availability verification significantly faster and cheaper in a trustless manner.
                        </p>
                         <div className="flex justify-center mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-accent text-accent hover:bg-accent/10"
                                onClick={() => window.open('https://succinct.xyz/blog', '_blank')}
                            >
                                Explore Succinct Blog <ArrowRight className="ml-1 w-3 h-3" />
                            </Button>
                         </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    </TooltipProvider>
  );
}
