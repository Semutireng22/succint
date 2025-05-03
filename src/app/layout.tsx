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
        {children}
        <Toaster /> {/* Add Toaster for potential notifications */}
      </body>
    </html>
  );
}
