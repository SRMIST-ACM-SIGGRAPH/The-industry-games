import type { Metadata } from 'next';
import './globals.css';
import LenisProvider from '@/components/providers/LenisProvider';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'The Industry Games | Hackathon',
  description: 'Hunger Games themed hackathon event.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LenisProvider>
          <Navbar />
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
