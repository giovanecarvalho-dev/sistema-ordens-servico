'use client'
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ClipboardList, UserPlus, Users, BarChart3, Settings, LogOut, Sun, Moon } from 'lucide-react';

export default function Sidebar() {
  const [cargo, setCargo] = useState('');
  const [nome, setNome] = useState('');
  const [theme, setTheme] = useState('light');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const c = localStorage.getItem('usuarioCargo') || '';
    const n = localStorage.getItem('usuarioNome') || '';
    const savedTheme = localStorage.getItem('theme') || 'light';
    setCargo(c);
    setNome(n);
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');

    if (!c && pathname !== '/login') {
      router.push('/login');
      return;
    }

    if (c === 'Usuario' && pathname !== '/novo' && pathname !== '/login') {
      router.push('/novo');
    }

    if (c === 'Tecnico' && (pathname === '/usuarios' || pathname === '/estatisticas')) {
      router.push('/');
    }
  }, [pathname]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const logout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (pathname === '/login') return null;

  const linkClass = "flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-medium text-slate-600 dark:text-slate-300";

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed h-full shadow-sm">
      <div className="p-6">
  <div className="flex items-center justify-between">
    <h1 className="text-xl font-black tracking-tighter text-blue-600 dark:text-blue-400 uppercase">
      Central de Suporte Técnico
    </h1>
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
      title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
    >
      {theme === 'light' ? (
        <Moon className="text-slate-600" size={18} />
      ) : (
        <Sun className="text-yellow-400" size={18} />
      )}
    </button>
  </div>
  {nome && (
    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate">
      {nome} — <span className="font-bold text-blue-500">{cargo}</span>
    </p>
  )}
</div>
      <nav className="flex-1 px-4 space-y-1">
        <Link href="/novo" className={linkClass}>
          <UserPlus size={18} /> Criar Chamado
        </Link>

        {(cargo === 'Tecnico' || cargo === 'Admin') && (
          <Link href="/" className={linkClass}>
            <ClipboardList size={18} /> Chamados
          </Link>
        )}

        {cargo === 'Admin' && (
          <>
            <Link href="/usuarios" className={linkClass}>
              <Users size={18} /> Usuários
            </Link>
            <Link href="/estatisticas" className={linkClass}>
              <BarChart3 size={18} /> Estatísticas
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
        {cargo === 'Admin' && (
          <Link href="/configuracoes" className={`${linkClass} text-slate-500 dark:text-slate-400`}>
            <Settings size={18} /> Configurações
          </Link>
        )}
        <button onClick={logout} className="flex items-center gap-3 p-3 w-full text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all rounded-xl font-medium">
          <LogOut size={18} /> Sair
        </button>
      </div>
    </aside>
  );
}