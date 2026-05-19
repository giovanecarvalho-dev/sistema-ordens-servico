'use client'
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ClipboardList, UserPlus, Users, BarChart3, Settings, LogOut, Sun, Moon, ChevronLeft, Menu } from 'lucide-react';
import api from '../services/api'; // Certifique-se de que o caminho está correto

export default function Sidebar() {
  const [cargo, setCargo] = useState('');
  const [nome, setNome] = useState('');
  const [theme, setTheme] = useState('light');
  const [nomeSistema, setNomeSistema] = useState('Central de Suporte Técnico');
  const [isCollapsed, setIsCollapsed] = useState(false);
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
    setIsCollapsed(localStorage.getItem('sidebarCollapsed') === 'true');
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

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
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
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-sm relative z-20`}>
      <div className={`flex flex-col ${isCollapsed ? 'p-4 items-center gap-4' : 'p-6'}`}>
        {!isCollapsed ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-xl font-black tracking-tighter text-blue-600 dark:text-blue-400 uppercase leading-tight">
                {nomeSistema}
              </h1>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Alternar Tema">
                  {theme === 'light' ? <Moon size={18} /> : <Sun className="text-yellow-400" size={18} />}
                </button>
                <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-blue-600 dark:hover:text-blue-400" title="Recolher Menu">
                  <ChevronLeft size={18} />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 uppercase font-bold tracking-widest line-clamp-3">
              <span className="text-black-500">{nome}</span> <span className="text-blue-500">{cargo}</span>
            </p>
          </>
        ) : (
          <>
            <span className="font-black text-blue-600 dark:text-blue-400 text-xl mb-2" title={nomeSistema}>OS</span>
            <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-blue-600 dark:hover:text-blue-400" title="Expandir Menu">
              <Menu size={20} />
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Alternar Tema">
              {theme === 'light' ? <Moon size={18} /> : <Sun className="text-yellow-400" size={18} />}
            </button>
          </>
        )}
      </div>

      <nav className={`flex-1 space-y-1 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <Link href="/novo" title="Criar Chamado" className={`${linkClass} ${pathname === '/novo' ? activeClass : ''} ${isCollapsed ? 'justify-center' : ''}`}>
          <UserPlus size={isCollapsed ? 22 : 18} className="flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Criar Chamado</span>}
        </Link>

        {(cargo === 'Tecnico' || cargo === 'Admin') && (
          <Link href="/" title="Chamados" className={`${linkClass} ${pathname === '/' ? activeClass : ''} ${isCollapsed ? 'justify-center' : ''}`}>
            <ClipboardList size={isCollapsed ? 22 : 18} className="flex-shrink-0" />
            {!isCollapsed && <span className="truncate">Chamados</span>}
          </Link>
        )}

        {cargo === 'Admin' && (
          <>
            <Link href="/usuarios" title="Usuários" className={`${linkClass} ${pathname === '/usuarios' ? activeClass : ''} ${isCollapsed ? 'justify-center' : ''}`}>
              <Users size={isCollapsed ? 22 : 18} className="flex-shrink-0" />
              {!isCollapsed && <span className="truncate">Usuários</span>}
            </Link>
            <Link href="/estatisticas" title="Estatísticas" className={`${linkClass} ${pathname === '/estatisticas' ? activeClass : ''} ${isCollapsed ? 'justify-center' : ''}`}>
              <BarChart3 size={isCollapsed ? 22 : 18} className="flex-shrink-0" />
              {!isCollapsed && <span className="truncate">Estatísticas</span>}
            </Link>
          </>
        )}
      </nav>

      <div className={`py-4 border-t border-slate-200 dark:border-slate-800 space-y-1 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <Link href="/configuracoes" title="Configurações" className={`${linkClass} ${pathname === '/configuracoes' ? activeClass : ''} ${isCollapsed ? 'justify-center' : ''}`}>
          <Settings size={isCollapsed ? 22 : 18} className="flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Configurações</span>}
        </Link>
        
        <button onClick={logout} title="Sair" className={`flex items-center gap-3 p-3 w-full text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all rounded-xl font-medium text-sm ${isCollapsed ? 'justify-center' : ''}`}>
          <LogOut size={isCollapsed ? 22 : 18} className="flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Sair</span>}
        </button>
      </div>
    </aside>
  );
}