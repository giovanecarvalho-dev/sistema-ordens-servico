import './globals.css';
import { Inter } from 'next/font/google';
import Sidebar from './components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300`}>
        <div className="flex min-h-screen overflow-hidden">
          <Sidebar />
          <main className="ml-64 min-h-screen w-[calc(100vw-16rem)] overflow-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}