import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google'; // Changed to Geist_Mono
import './globals.css';
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

// Removed Geist Sans import

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Succinct ZkProof Simulator', // Updated App Name
  description: 'Simulate cost and time savings using Succinct ZkProofs', // Updated Description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark"> {/* Added dark class for default dark mode */}
      <body className={cn(geistMono.variable, "font-mono antialiased")}> {/* Apply mono font */}
        <header className="flex items-center justify-start h-16 px-4 border-b border-border bg-background/90 backdrop-blur-md">
          <a href="/" className="flex items-center space-x-2">
            <img
              src="https://i.ibb.co.com/xKppcjWQ/Succinct-Logo.png"
              alt="Succinct Logo"
              className="w-8 h-8 mr-2"
            />
            <span className="font-bold text-lg">Succinct ZKProof Simulator</span>
          </a>
        </header>
        <main className="pt-16">
          {children}
          <Toaster /> {/* Add Toaster for potential notifications */}
        </main>
      </body>
    </html>
  );
}

