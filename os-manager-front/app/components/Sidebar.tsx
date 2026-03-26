'use client'
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ClipboardList, UserPlus, Users, BarChart3, Settings, LogOut, Sun, Moon } from 'lucide-react';
import api from '../services/api'; // Certifique-se de que o caminho está correto

export default function Sidebar() {
  const [cargo, setCargo] = useState('');
  const [nome, setNome] = useState('');
  const [theme, setTheme] = useState('light');
  const [nomeSistema, setNomeSistema] = useState('Central de Suporte Técnico');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const c = localStorage.getItem('usuarioCargo') || '';
    const n = localStorage.getItem('usuarioNome') || '';
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    setCargo(c);
    setNome(n);
    setTheme(savedTheme);
    setNomeSistema(localStorage.getItem('cfg_nomeSistema') || 'Central de Suporte Técnico');
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');

    // PROTEÇÃO DE ROTAS ATUALIZADA
    if (!c && pathname !== '/login') {
      router.push('/login');
      return;
    }

    // Se for Usuário Comum, ele só pode acessar "Novo Chamado" E "Configurações"
    const rotasPermitidasUsuario = ['/novo', '/configuracoes'];
    if (c === 'Usuario' && !rotasPermitidasUsuario.includes(pathname) && pathname !== '/login') {
      router.push('/novo');
    }

    // Se for Técnico, não acessa usuários nem estatísticas
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

  const logout = async () => {
    try {
        await api.post('/logout'); // Usando sua instância da API que já tem o token
    } catch (e) {
        console.error('Erro ao fazer logout:', e);
    }
    localStorage.clear();
    router.push('/login');
  };

  if (pathname === '/login') return null;

  const linkClass = "flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-medium text-slate-600 dark:text-slate-300";
  const activeClass = "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400";

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed h-full shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black tracking-tighter text-blue-600 dark:text-blue-400 uppercase leading-tight">
            {nomeSistema}
          </h1>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            {theme === 'light' ? <Moon size={18} /> : <Sun className="text-yellow-400" size={18} />}
          </button>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 uppercase font-bold tracking-widest">
          {nome} — <span className="text-blue-500">{cargo}</span>
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <Link href="/novo" className={`${linkClass} ${pathname === '/novo' ? activeClass : ''}`}>
          <UserPlus size={18} /> Criar Chamado
        </Link>

        {(cargo === 'Tecnico' || cargo === 'Admin') && (
          <Link href="/" className={`${linkClass} ${pathname === '/' ? activeClass : ''}`}>
            <ClipboardList size={18} /> Chamados
          </Link>
        )}

        {cargo === 'Admin' && (
          <>
            <Link href="/usuarios" className={`${linkClass} ${pathname === '/usuarios' ? activeClass : ''}`}>
              <Users size={18} /> Usuários
            </Link>
            <Link href="/estatisticas" className={`${linkClass} ${pathname === '/estatisticas' ? activeClass : ''}`}>
              <BarChart3 size={18} /> Estatísticas
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
        {/* AGORA VISÍVEL PARA TODOS */}
        <Link href="/configuracoes" className={`${linkClass} ${pathname === '/configuracoes' ? activeClass : ''}`}>
          <Settings size={18} /> Configurações
        </Link>
        
        <button onClick={logout} className="flex items-center gap-3 p-3 w-full text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all rounded-xl font-medium text-sm">
          <LogOut size={18} /> Sair
        </button>
      </div>
    </aside>
  );
}