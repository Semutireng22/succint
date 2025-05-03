import type { ReactNode } from 'react';
import { cn } from "@/lib/utils";

interface TerminalWindowProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const TerminalWindow = ({ title, children, className }: TerminalWindowProps) => {
  return (
    <div
      className={cn(
        "rounded-lg shadow-lg overflow-hidden bg-card/90 border border-border backdrop-blur-sm", // Slightly increased opacity
        className
      )}
    >
      {/* Title Bar */}
      <div className="flex items-center px-4 py-2 bg-muted border-b border-border/80"> {/* Slightly softer border */}
        <div className="flex space-x-2">
          <span className="w-3 h-3 bg-red-500 rounded-full border border-black/10"></span> {/* Added subtle border */}
          <span className="w-3 h-3 bg-yellow-500 rounded-full border border-black/10"></span>
          <span className="w-3 h-3 bg-green-500 rounded-full border border-black/10"></span>
        </div>
        <div className="flex-1 text-center text-sm font-medium text-muted-foreground">
          {title}
        </div>
        {/* Placeholder for potential right-side controls */}
        <div className="w-16"></div> {/* Adjusted width for symmetry */}
      </div>

      {/* Content Area */}
      <div className="p-4 md:p-6 lg:p-8 h-full overflow-y-auto"> {/* Increased padding */}
        {children}
      </div>
    </div>
  );
};

export default TerminalWindow;