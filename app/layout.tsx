import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers'; // 1. Импортируем провайдер

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NFC Магазин', // Можно заодно поменять название сайта
  description: 'Магазин розумних NFC рішень',
  openGraph: {
    images: [{ url: 'https://bolt.new/static/og_default.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [{ url: 'https://bolt.new/static/og_default.png' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Добавляем suppressHydrationWarning, чтобы не было ошибок при смене тем
    <html lang="uk" suppressHydrationWarning> 
      <body className={inter.className}>
        {/* 2. Оборачиваем все приложение в Providers */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}