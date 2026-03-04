'use client'
import "./globals.css";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);

  
  useEffect(() => {
    const savedUser = localStorage.getItem('usuario');
    if (savedUser) {
      setUsuarioLogado(JSON.parse(savedUser));
    }
  }, []);

  const menuItems = [
    { name: 'Chamados', href: '/' },
    { name: 'Criar chamado', href: '/novo' },
    { name: 'Usuários', href: '/usuarios' },
    { name: 'Estatísticas', href: '/estatisticas' },
  ];

  if (pathname === '/login') {
    return (
      <html lang="pt-br">
        <body className="antialiased bg-gray-50 flex items-center justify-center min-h-screen">
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="pt-br">
      <body className="antialiased">
        <div className="flex h-screen bg-gray-50 text-gray-900">
          <aside className="w-64 bg-[#2c3e50] text-white flex flex-col fixed h-full shadow-2xl">
            <div className="p-6 border-b border-slate-700">
              <h1 className="text-lg font-black tracking-tight uppercase">Central de Chamados</h1>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest">Suporte Técnico</p>
            </div>
            
            <nav className="flex-1 p-4 space-y-1">
              <p className="text-slate-500 text-[10px] font-bold uppercase mb-4 px-2 tracking-widest">Assistência</p>
              {menuItems.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href} 
                  className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all text-sm ${
                    pathname === item.href ? 'bg-blue-600 font-bold text-white' : 'text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

      
            {usuarioLogado && (
              <div className="p-4 bg-slate-800/50 border-t border-slate-700">
                <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Logado como:</p>
                <p className="text-sm font-bold text-blue-400">{usuarioLogado.nome}</p>
                <p className="text-[10px] text-slate-400">{usuarioLogado.cargo}</p>
              </div>
            )}

            <div className="p-4 border-t border-slate-700 text-[10px] text-center text-slate-500 font-mono uppercase tracking-tighter">
              Docker Environment v1.0
            </div>
          </aside>

          <main className="flex-1 ml-64 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}