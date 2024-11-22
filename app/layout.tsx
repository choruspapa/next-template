import StoreProvider from '@/lib/store-provider';
import { SessionProvider } from 'next-auth/react';
import './globals.css';

// import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'Next.js App Router + NextAuth + Tailwind CSS',
  description:
    'A user admin dashboard configured with Next.js, Postgres, NextAuth, Tailwind CSS, TypeScript, and Prettier.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
    <html lang="en">
      <SessionProvider>
      <body className="flex min-h-screen w-full flex-col">{children}</body>
      </SessionProvider>
      {/* <Analytics /> */}
    </html>
    </StoreProvider>
  );
}
