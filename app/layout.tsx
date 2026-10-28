import type { Metadata, Viewport } from 'next';
import './globals.css';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import { LanguageProvider } from '@/lib/LanguageContext';

export const metadata: Metadata = {
  title: 'ShikshaMitra AI — Your Learning Companion',
  description:
    'An AI-powered learning companion for primary-school students. Learn Maths, Science, and English with interactive lessons and quizzes.',
  keywords: ['education', 'learning', 'AI tutor', 'primary school', 'quiz', 'maths', 'science', 'english'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ShikshaMitra AI',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  themeColor: '#8b5cf6',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="bg-slate-50 text-slate-800 antialiased min-h-screen">
        <ServiceWorkerRegistration />
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
