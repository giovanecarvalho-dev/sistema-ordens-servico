'use client'
import { useEffect, useState } from 'react';
import api from '../services/api';
import { CheckCircle } from 'lucide-react';

export default function Configuracoes() {
  const [abaAtiva, setAbaAtiva] = useState<'perfil' | 'sistema'>('perfil');

  // Dados do Usuário
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [cargo, setCargo] = useState('');

  // Perfil
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [sucessoPerfil, setSucessoPerfil] = useState(false);

  // Sistema
  const [nomeSistema, setNomeSistema] = useState('');
  const [slaAlta, setSlaAlta] = useState('4');
  const [slaMuito, setSlaMuito] = useState('2');
  const [slaMedia, setSlaMedia] = useState('8');
  const [slaBaixa, setSlaBaixa] = useState('24');
  const [sucessoSistema, setSucessoSistema] = useState(false);

  useEffect(() => {
    // Busca dados do perfil logado
    api.get('/perfil').then(res => {
      const eu = res.data;
      setUsuarioId(eu.id);
      setNome(eu.nome);
      setEmail(eu.email);
      
      const perfilCargo = eu.cargo?.nome || eu.cargo || '';
      setCargo(perfilCargo);

      // Apenas admins podem ler as configurações gerais do sistema da API
      if (perfilCargo === 'Admin') {
        api.get('/configuracoes').then(resCfg => {
          const cfg = resCfg.data;
          setNomeSistema(cfg.nome_sistema || 'Central de Suporte Técnico');
          setSlaAlta(String(cfg.sla_alta ?? '4'));
          setSlaMuito(String(cfg.sla_muito_alta ?? '2'));
          setSlaMedia(String(cfg.sla_media ?? '8'));
          setSlaBaixa(String(cfg.sla_baixa ?? '24'));
        }).catch(err => {
          console.error("Erro ao carregar configurações do sistema", err);
          carregarFallbacksLocais();
        });
      } else {
        carregarFallbacksLocais();
      }
    }).catch(err => console.error("Erro ao carregar perfil", err));

    function carregarFallbacksLocais() {
      setNomeSistema(localStorage.getItem('cfg_nomeSistema') || 'Central de Suporte Técnico');
      setSlaAlta(localStorage.getItem('cfg_slaAlta') || '4');
      setSlaMuito(localStorage.getItem('cfg_slaMuito') || '2');
      setSlaMedia(localStorage.getItem('cfg_slaMedia') || '8');
      setSlaBaixa(localStorage.getItem('cfg_slaBaixa') || '24');
    }
  }, []);

  const salvarPerfil = async (e: any) => {
    e.preventDefault();
    try {
      await api.put(`/usuarios/${usuarioId}/perfil`, {
        nome,
        email,
        senha_atual: senhaAtual || undefined,
        nova_senha: novaSenha || undefined,
      });
      sessionStorage.setItem('usuarioNome', nome);
      setSucessoPerfil(true);
      setSenhaAtual('');
      setNovaSenha('');
      setTimeout(() => setSucessoPerfil(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao atualizar perfil.');
    }
  };

  const salvarSistema = async (e: any) => {
    e.preventDefault();
    try {
      await api.put('/configuracoes', {
        nome_sistema:   nomeSistema,
        sla_muito_alta: Number(slaMuito),
        sla_alta:       Number(slaAlta),
        sla_media:      Number(slaMedia),
        sla_baixa:      Number(slaBaixa),
      });
      // mantém localStorage sincronizado para o nome do sistema (usado na sidebar)
      localStorage.setItem('cfg_nomeSistema', nomeSistema);
      setSucessoSistema(true);
      setTimeout(() => setSucessoSistema(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar configurações.');
    }
  };

  const inputClass = "w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500";
  const labelClass = "text-[10px] font-bold text-slate-400 uppercase tracking-widest";
  const card = "bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 overflow-y-auto";

  return (
    <div className="max-w-2xl mx-auto py-4 md:py-6 px-4 md:px-6 h-full flex flex-col">
      <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Configurações</h2>
      <p className="text-slate-400 text-sm mb-4 md:mb-6">Gerencie suas preferências e configurações do sistema.</p>

      {/* ABAS DINÂMICAS */}
      <div className="flex gap-2 mb-4 md:mb-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <button
          onClick={() => setAbaAtiva('perfil')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
            abaAtiva === 'perfil' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          Meu Perfil
        </button>

        {/* REGRA: Apenas Admins veem a aba do Sistema */}
        {cargo === 'Admin' && (
          <button
            onClick={() => setAbaAtiva('sistema')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
              abaAtiva === 'sistema' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            Sistema
          </button>
        )}
      </div>

      {/* ABA PERFIL (Todos veem) */}
      {abaAtiva === 'perfil' && (
        <div className={card}>
          {sucessoPerfil && (
            <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl mb-4">
              <CheckCircle size={18} />
              <span className="font-bold text-sm">Perfil atualizado com sucesso!</span>
            </div>
          )}
          <form onSubmit={salvarPerfil} className="space-y-4">
            <div className="space-y-2">
              <label className={labelClass}>Nome Completo</label>
              <input className={inputClass} value={nome} onChange={e => setNome(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>E-mail</label>
              <input className={inputClass} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Alterar Senha (opcional)</p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className={labelClass}>Senha Atual</label>
                  <input className={inputClass} type="password" placeholder="••••••••" value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Nova Senha</label>
                  <input className={inputClass} type="password" placeholder="••••••••" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all uppercase text-xs tracking-widest">
                Salvar Perfil
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ABA SISTEMA (Só renderiza se for Admin) */}
      {abaAtiva === 'sistema' && cargo === 'Admin' && (
        <div className={card}>
          {sucessoSistema && (
            <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl mb-4">
              <CheckCircle size={18} />
              <span className="font-bold text-sm">Configurações salvas!</span>
            </div>
          )}
          <form onSubmit={salvarSistema} className="space-y-4">
            <div className="space-y-2">
              <label className={labelClass}>Nome do Sistema</label>
              <input className={inputClass} value={nomeSistema} onChange={e => setNomeSistema(e.target.value)} required />
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">SLA por Urgência (horas)</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={labelClass}>🔴 Muito Alta</label>
                  <input className={inputClass} type="number" min="1" value={slaMuito} onChange={e => setSlaMuito(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>🟠 Alta</label>
                  <input className={inputClass} type="number" min="1" value={slaAlta} onChange={e => setSlaAlta(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>🟡 Média</label>
                  <input className={inputClass} type="number" min="1" value={slaMedia} onChange={e => setSlaMedia(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>🔵 Baixa</label>
                  <input className={inputClass} type="number" min="1" value={slaBaixa} onChange={e => setSlaBaixa(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all uppercase text-xs tracking-widest">
                Salvar Configurações
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}