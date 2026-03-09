import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { LayoutDashboard, ClipboardList, UserPlus, Users, BarChart3, Settings } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300`}>
        <div className="flex min-h-screen">
          
          {/* SIDEBAR COMPLETA */}
          <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed h-full shadow-sm">
            <div className="p-6">
              <h1 className="text-xl font-black tracking-tighter text-blue-600 dark:text-blue-400 uppercase">
                Sistema OS Local
              </h1>
            </div>

            <nav className="flex-1 px-4 space-y-1">
              <Link href="/" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-medium text-slate-600 dark:text-slate-300">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link href="/chamados" className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold">
                <ClipboardList size={18} /> Chamados
              </Link>
              <Link href="/criar-chamado" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-medium text-slate-600 dark:text-slate-300">
                <UserPlus size={18} /> Criar Chamado
              </Link>
              <Link href="/usuarios" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-medium text-slate-600 dark:text-slate-300">
                <Users size={18} /> Usuários
              </Link>
              <Link href="/estatisticas" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-medium text-slate-600 dark:text-slate-300">
                <BarChart3 size={18} /> Estatísticas
              </Link>
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <Link href="/configuracoes" className="flex items-center gap-3 p-3 w-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all rounded-xl">
                <Settings size={18} /> Configurações
              </Link>
            </div>
          </aside>

          {/* CONTEÚDO PRINCIPAL */}
          <main className="flex-1 ml-64 min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}