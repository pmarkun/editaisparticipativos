import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/client';

export const metadata: Metadata = {
  title: 'Edital Participativo',
  description: 'Plataforma de editais participativos',
};

type Palette = 'blue' | 'green' | 'wine';

const paletteStyles: Record<Palette, Record<string, string>> = {
  blue: {
    '--primary': '198 90% 64%',
    '--accent': '174 38% 64%',
    '--background': '188 70% 93%',
  },
  green: {
    '--primary': '152 60% 45%',
    '--accent': '148 40% 40%',
    '--background': '144 60% 92%',
  },
  wine: {
    '--primary': '338 60% 40%',
    '--accent': '330 40% 45%',
    '--background': '350 60% 95%',
  },
};

async function getThemePalette(): Promise<Palette> {
  try {
    const snap = await getDoc(doc(db, 'config', 'theme'));
    if (snap.exists()) {
      return (snap.data().palette as Palette) || 'blue';
    }
  } catch (err) {
    console.error('Erro ao carregar paleta', err);
  }
  return 'blue';
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const palette = await getThemePalette();
  const styleVars = paletteStyles[palette] || paletteStyles.blue;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body
        className="font-body antialiased min-h-screen flex flex-col"
        style={{ '--font-body': "'PT Sans', sans-serif", ...styleVars } as React.CSSProperties}
      >
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
