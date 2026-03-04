'use client'
import { useEffect, useState } from 'react';
import api from './services/api';
import ModoEscuro from './components/ModoEscuro'; 

export default function ListaChamados() {
  const [ordens, setOrdens] = useState([]);
  const [busca, setBusca] = useState('');
  const [tecnicos, setTecnicos] = useState([]);
  const [chamadoSelecionado, setChamadoSelecionado] = useState<any>(null);
  const [tecnicoId, setTecnicoId] = useState('');
  const [status, setStatus] = useState('');
  const [urgencia, setUrgencia] = useState('');
  const [prioridade, setPrioridade] = useState('');
  const [solucao, setSolucao] = useState('');

  const buscarDados = async () => {
    try {
      const [resOrdens, resTecnicos] = await Promise.all([
        api.get('/ordens'),
        api.get('/usuarios')
      ]);
      setOrdens(resOrdens.data);
      setTecnicos(resTecnicos.data);
    } catch (err) {
      console.error("Erro ao carregar dados");
    }
  };

  useEffect(() => { buscarDados(); }, []);

  const ordensFiltradas = ordens.filter((os: any) => 
    os.titulo.toLowerCase().includes(busca.toLowerCase()) || 
    os.id.toString().includes(busca)
  );

  const deletarChamado = async (id: number) => {
    if (confirm("Deseja excluir este chamado permanentemente?")) {
      try {
        await api.delete(`/ordens/${id}`);
        buscarDados(); 
      } catch (err) {
        alert("Erro ao excluir chamado.");
      }
    }
  };

  const abrirModalEdicao = (os: any) => {
    setChamadoSelecionado(os);
    setStatus(os.status);
    setTecnicoId(os.usuario_id || '');
    setUrgencia(os.urgencia);
    setPrioridade(os.prioridade);
    setSolucao(os.solucao || '');
  };

  const salvarEdicao = async (e: any) => {
    e.preventDefault();
    try {
      await api.put(`/ordens/${chamadoSelecionado.id}`, {
        status, 
        usuario_id: tecnicoId,
        urgencia, 
        prioridade, 
        solucao
      });
      buscarDados();
      setChamadoSelecionado(null);
    } catch (err) {
      alert("Erro ao atualizar.");
    }
  };

  return (
    // Adicionado dark:bg-slate-900 para o fundo do tema escuro [cite: 2026-03-02]
    <div className="max-w-[98%] mx-auto py-10 px-4 min-h-screen transition-colors duration-300 dark:bg-slate-900">
      
      <div className="flex justify-between items-center mb-8">
        {/* Título com suporte a dark mode */}
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tighter uppercase">
          Gestão de Chamados
        </h2>
        
        {/* Grupo de Busca + Botão de Tema (Onde estava seu cursor) */}
        <div className="flex items-center gap-3">
          <input 
            type="text" 
            placeholder="Filtrar por título ou ID..." 
            className="p-2 border rounded-lg text-xs w-64 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <ModoEscuro /> 
        </div>
      </div>

      {/* Tabela com suporte a dark mode [cite: 2026-03-02] */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700 text-gray-400 dark:text-slate-400 uppercase font-bold">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Técnico</th>
              <th className="px-4 py-3">Urgência</th>
              <th className="px-4 py-3">Prioridade</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {ordensFiltradas.map((os: any) => (
              <tr key={os.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-4 font-mono text-blue-600 dark:text-blue-400">#{os.id}</td>
                <td className="px-4 py-4 font-bold text-gray-800 dark:text-slate-200">{os.titulo}</td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${
                    os.status === 'Fechado' 
                      ? 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400' 
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {os.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-gray-500 dark:text-slate-400 font-medium">
                  {os.usuario?.nome || <span className="text-red-300 dark:text-red-400/60">Não atribuído</span>}
                </td> 
                <td className="px-4 py-4 dark:text-slate-300">{os.urgencia}</td>
                <td className="px-4 py-4 dark:text-slate-300">{os.prioridade}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => abrirModalEdicao(os)} 
                      className="text-blue-600 dark:text-blue-400 font-black hover:underline"
                    >
                      EDITAR
                    </button>
                    <span className="text-gray-300 dark:text-slate-600">|</span>
                    <button 
                      onClick={() => deletarChamado(os.id)} 
                      className="text-red-500 dark:text-red-400 font-black hover:underline"
                    >
                      EXCLUIR
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {ordensFiltradas.length === 0 && (
          <div className="p-10 text-center text-gray-400 dark:text-slate-500 font-medium">
            Nenhum chamado encontrado.
          </div>
        )}
      </div>

      {/* MODAL DE EDIÇÃO COM DARK MODE */}
      {chamadoSelecionado && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-xl shadow-2xl p-6 border dark:border-slate-700">
            <h3 className="text-lg font-black mb-6 border-b dark:border-slate-700 pb-4 text-slate-800 dark:text-slate-100">
              Editar Chamado #{chamadoSelecionado.id}
            </h3>
            <form onSubmit={salvarEdicao} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Técnico Responsável</label>
                  <select 
                    value={tecnicoId} 
                    onChange={(e) => setTecnicoId(e.target.value)} 
                    className="w-full p-2 bg-gray-50 dark:bg-slate-700 border dark:border-slate-600 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                    <option value="">Selecione...</option>
                    {tecnicos.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)} 
                    className="w-full p-2 bg-gray-50 dark:bg-slate-700 border dark:border-slate-600 rounded text-sm dark:text-white"
                  >
                    <option>Novo</option>
                    <option>Em andamento</option>
                    <option>Fechado</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Solução Aplicada</label>
                <textarea 
                  value={solucao} 
                  onChange={(e) => setSolucao(e.target.value)} 
                  className="w-full p-3 bg-gray-50 dark:bg-slate-700 border dark:border-slate-600 rounded text-sm h-24 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" 
                  placeholder="Descreva o que foi feito..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setChamadoSelecionado(null)} 
                  className="text-xs font-bold text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                >
                  CANCELAR
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-lg text-xs shadow-lg transition-all"
                >
                  SALVAR ALTERAÇÕES
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}