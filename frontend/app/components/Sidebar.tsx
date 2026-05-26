'use client'
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ClipboardList, UserPlus, Users, BarChart3, Settings, LogOut, Sun, Moon, ChevronLeft, Menu, Bell } from 'lucide-react';
import api from '../services/api'; // Certifique-se de que o caminho está correto

export default function Sidebar() {
  const [cargo, setCargo] = useState('');
  const [nome, setNome] = useState('');
  const [theme, setTheme] = useState('light');
  const [nomeSistema, setNomeSistema] = useState('Central de Suporte Técnico');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [showNotificacoes, setShowNotificacoes] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const fetchNotificacoes = () => {
    if (pathname === '/login') return;
    api.get('/notificacoes')
      .then(res => {
        setNotificacoes(res.data || []);
      })
      .catch(err => console.error("Erro ao carregar notificações", err));
  };

  // 1. Inicialização (Roda uma única vez ao montar)
  useEffect(() => {
    if (pathname === '/login') return;

    // UX rápida / Preferências locais síncronas
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    setNomeSistema(localStorage.getItem('cfg_nomeSistema') || 'Central de Suporte Técnico');
    setIsCollapsed(localStorage.getItem('sidebarCollapsed') === 'true');
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');

    // Inicializa valores locais para resposta visual rápida
    setCargo(localStorage.getItem('usuarioCargo') || '');
    setNome(localStorage.getItem('usuarioNome') || '');

    // Busca dados reais do perfil para garantir a proteção
    api.get('/perfil')
      .then(res => {
        const eu = res.data;
        const cargoReal = eu.cargo?.nome || eu.cargo || '';
        const nomeReal = eu.nome || '';

        setCargo(cargoReal);
        setNome(nomeReal);

        // Sincroniza localStorage (UX rápida)
        localStorage.setItem('usuarioCargo', cargoReal);
        localStorage.setItem('usuarioNome', nomeReal);
      })
      .catch(err => {
        // Se falhar (não autenticado ou sessão expirada) e não estamos no login, redireciona
        localStorage.clear();
        router.push('/login');
      });

    // Carrega notificações e inicia polling
    fetchNotificacoes();
    const interval = setInterval(fetchNotificacoes, 30000);
    return () => clearInterval(interval);
  }, []);

  // 2. Proteção de rotas instantânea por pathname (Zero chamadas de rede no clique)
  useEffect(() => {
    if (pathname === '/login') return;

    // Esconde o popover de notificações ao mudar de página
    setShowNotificacoes(false);

    // Valida acessos baseado no cargo atual carregado localmente
    const currentCargo = cargo || localStorage.getItem('usuarioCargo') || '';
    if (currentCargo) {
      if (currentCargo === 'Usuario') {
        const rotasPermitidasUsuario = ['/', '/novo', '/configuracoes'];
        if (!rotasPermitidasUsuario.includes(pathname)) {
          router.push('/novo');
        }
      } else if (currentCargo === 'Tecnico') {
        if (pathname === '/usuarios' || pathname === '/estatisticas') {
          router.push('/');
        }
      }
    }
  }, [pathname, cargo, router]);

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

  const marcarTodasComoLidas = async () => {
    try {
      await api.put('/notificacoes/ler-todas');
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
    } catch (err) {
      console.error("Erro ao marcar todas como lidas", err);
    }
  };

  const marcarComoLida = async (id: number) => {
    try {
      await api.put(`/notificacoes/${id}/ler`);
      setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
    } catch (err) {
      console.error("Erro ao marcar notificação como lida", err);
    }
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

  const unreadCount = notificacoes.filter((n: any) => !n.lida).length;

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
              <div className="flex items-center gap-1 flex-shrink-0 relative">
                {/* Botão de Notificações */}
                <button 
                  onClick={() => setShowNotificacoes(!showNotificacoes)} 
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative text-slate-500 hover:text-blue-600 dark:hover:text-blue-400" 
                  title="Notificações"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </button>
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
            <button 
              onClick={() => setShowNotificacoes(!showNotificacoes)} 
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative text-slate-500 hover:text-blue-600 dark:hover:text-blue-400" 
              title="Notificações"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Alternar Tema">
              {theme === 'light' ? <Moon size={18} /> : <Sun className="text-yellow-400" size={18} />}
            </button>
          </>
        )}
      </div>

      {/* Popover de Notificações */}
      {showNotificacoes && (
        <div className="absolute left-full top-16 ml-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 flex flex-col max-h-96 overflow-hidden animate-in fade-in slide-in-from-left-2 duration-200">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
              Notificações {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            {unreadCount > 0 && (
              <button 
                onClick={marcarTodasComoLidas} 
                className="text-[10px] text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold uppercase tracking-wider"
              >
                Marcar todas
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notificacoes.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 italic">
                Nenhuma notificação por enquanto.
              </div>
            ) : (
              notificacoes.map((n: any) => (
                <div 
                  key={n.id} 
                  onClick={() => !n.lida && marcarComoLida(n.id)}
                  className={`p-4 transition-colors cursor-pointer text-left ${
                    !n.lida 
                      ? 'bg-blue-50/30 dark:bg-blue-900/5 hover:bg-blue-50/50 dark:hover:bg-blue-900/10' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${!n.lida ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      {n.titulo}
                    </span>
                    {!n.lida && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                    {n.mensagem}
                  </p>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-1">
                    {new Date(n.criado_em).toLocaleString('pt-BR')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <nav className={`flex-1 space-y-1 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <Link href="/novo" title="Criar Chamado" className={`${linkClass} ${pathname === '/novo' ? activeClass : ''} ${isCollapsed ? 'justify-center' : ''}`}>
          <UserPlus size={isCollapsed ? 22 : 18} className="flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Criar Chamado</span>}
        </Link>

        <Link href="/" title="Chamados" className={`${linkClass} ${pathname === '/' ? activeClass : ''} ${isCollapsed ? 'justify-center' : ''}`}>
          <ClipboardList size={isCollapsed ? 22 : 18} className="flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Chamados</span>}
        </Link>

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