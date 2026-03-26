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
    // 1. Busca APENAS os dados do usuário logado (usando a nossa nova rota)
    api.get('/perfil').then(res => {
      const eu = res.data;
      setUsuarioId(eu.id);
      setNome(eu.nome);
      setEmail(eu.email);
      setCargo(eu.cargo); // Guardamos o cargo para a regra de negócio visual
    }).catch(err => console.error("Erro ao carregar perfil", err));

    // Carrega configurações do sistema do localStorage
    setNomeSistema(localStorage.getItem('cfg_nomeSistema') || 'Central de Suporte Técnico');
    setSlaAlta(localStorage.getItem('cfg_slaAlta') || '4');
    setSlaMuito(localStorage.getItem('cfg_slaMuito') || '2');
    setSlaMedia(localStorage.getItem('cfg_slaMedia') || '8');
    setSlaBaixa(localStorage.getItem('cfg_slaBaixa') || '24');
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
      localStorage.setItem('usuarioNome', nome);
      setSucessoPerfil(true);
      setSenhaAtual('');
      setNovaSenha('');
      setTimeout(() => setSucessoPerfil(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao atualizar perfil.');
    }
  };

  const salvarSistema = (e: any) => {
    e.preventDefault();
    localStorage.setItem('cfg_nomeSistema', nomeSistema);
    localStorage.setItem('cfg_slaAlta', slaAlta);
    localStorage.setItem('cfg_slaMuito', slaMuito);
    localStorage.setItem('cfg_slaMedia', slaMedia);
    localStorage.setItem('cfg_slaBaixa', slaBaixa);
    setSucessoSistema(true);
    setTimeout(() => setSucessoSistema(false), 3000);
  };

  const inputClass = "w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500";
  const labelClass = "text-[10px] font-bold text-slate-400 uppercase tracking-widest";
  const card = "bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm";

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Configurações</h2>
      <p className="text-slate-400 text-sm mb-8">Gerencie suas preferências e configurações do sistema.</p>

      {/* ABAS DINÂMICAS */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800">
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
            <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl mb-6">
              <CheckCircle size={18} />
              <span className="font-bold text-sm">Perfil atualizado com sucesso!</span>
            </div>
          )}
          <form onSubmit={salvarPerfil} className="space-y-5">
            <div className="space-y-2">
              <label className={labelClass}>Nome Completo</label>
              <input className={inputClass} value={nome} onChange={e => setNome(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>E-mail</label>
              <input className={inputClass} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Alterar Senha (opcional)</p>
              <div className="space-y-4">
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
            <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl mb-6">
              <CheckCircle size={18} />
              <span className="font-bold text-sm">Configurações salvas!</span>
            </div>
          )}
          <form onSubmit={salvarSistema} className="space-y-5">
            <div className="space-y-2">
              <label className={labelClass}>Nome do Sistema</label>
              <input className={inputClass} value={nomeSistema} onChange={e => setNomeSistema(e.target.value)} required />
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">SLA por Urgência (horas)</p>
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