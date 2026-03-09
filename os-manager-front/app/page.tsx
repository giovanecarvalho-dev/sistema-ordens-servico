'use client'
import { useEffect, useState } from 'react';
import api from './services/api';

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
    setUrgencia(os.urgencia || 'Média');
    setPrioridade(os.prioridade || 'Média');
    setSolucao(os.solucao || '');
  };

  const salvarEdicao = async (e: any) => {
    e.preventDefault();
    try {
      await api.put(`/ordens/${chamadoSelecionado.id}`, {
        status,
        urgencia,
        prioridade,
        usuario_id: tecnicoId,
        solucao
      });
      buscarDados();
      setChamadoSelecionado(null);
    } catch (err) {
      alert("Erro ao atualizar.");
    }
  };

  const urgenciaCor: any = {
    'Muito Alta': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'Alta': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'Média': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Baixa': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const selectClass = "w-full p-3 mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
            Gestão de Chamados
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Visualize e gerencie as ordens de serviço do sistema.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <input 
            type="text" 
            placeholder="Filtrar chamados..." 
            className="p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs w-64 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Título</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Urgência</th>
              <th className="px-6 py-4">Prioridade</th>
              <th className="px-6 py-4">Técnico</th>
              <th className="px-6 py-4">Solução</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {ordensFiltradas.map((os: any) => (
              <tr key={os.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-mono text-blue-600 dark:text-blue-400">#{os.id}</td>
                <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{os.titulo}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                    os.status === 'Fechado' 
                      ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' 
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {os.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${urgenciaCor[os.urgencia] || 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {os.urgencia || '-'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${urgenciaCor[os.prioridade] || 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {os.prioridade || '-'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                  {os.usuario?.nome || "Pendente"}
                </td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-[160px]">
                  {os.solucao 
                    ? <span className="truncate block text-xs" title={os.solucao}>{os.solucao.substring(0, 40)}{os.solucao.length > 40 ? '...' : ''}</span>
                    : <span className="text-xs text-slate-300 dark:text-slate-600 italic">Sem solução</span>
                  }
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => abrirModalEdicao(os)} className="text-blue-600 font-bold mr-4 hover:underline">EDITAR</button>
                  <button onClick={() => deletarChamado(os.id)} className="text-red-500 font-bold hover:underline">EXCLUIR</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDIÇÃO */}
      {chamadoSelecionado && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-xl font-black mb-6 text-slate-800 dark:text-white">Editar Chamado #{chamadoSelecionado.id}</h3>
            <form onSubmit={salvarEdicao} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Técnico</label>
                <select value={tecnicoId} onChange={(e) => setTecnicoId(e.target.value)} className={selectClass}>
                  <option value="">Selecione...</option>
                  {tecnicos.map((t: any) => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Urgência</label>
                  <select value={urgencia} onChange={(e) => setUrgencia(e.target.value)} className={selectClass}>
                    <option>Muito Alta</option>
                    <option>Alta</option>
                    <option>Média</option>
                    <option>Baixa</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Prioridade</label>
                  <select value={prioridade} onChange={(e) => setPrioridade(e.target.value)} className={selectClass}>
                    <option>Muito Alta</option>
                    <option>Alta</option>
                    <option>Média</option>
                    <option>Baixa</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
                  <option>Novo</option>
                  <option>Em andamento</option>
                  <option>Fechado</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Solução</label>
                <textarea 
                  value={solucao} 
                  onChange={(e) => setSolucao(e.target.value)} 
                  placeholder="Descreva a solução aplicada..."
                  className="w-full p-3 mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm h-28 resize-none outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setChamadoSelecionado(null)} className="text-slate-400 font-bold hover:text-slate-600 dark:hover:text-slate-200">CANCELAR</button>
                <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20">SALVAR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}