import type { Metadata } from 'next';
import './globals.css';
import LenisProvider from '@/components/providers/LenisProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AnnouncementsTicker from '@/components/announcements/AnnouncementsTicker';
import { Analytics } from '@vercel/analytics/next';
import ScrollToTop from '@/components/layout/ScrollToTop';

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
          <header className="app-header">
            <AnnouncementsTicker />
            <Navbar />
          </header>
          {children}
          <Footer />
          <ScrollToTop />
          <Analytics />
        </LenisProvider>
      </body>
    </html>
  );
}
