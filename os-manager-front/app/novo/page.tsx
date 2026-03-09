'use client'
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function NovoChamado() {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [urgencia, setUrgencia] = useState('Média');
  const [prioridade, setPrioridade] = useState('Média');
  const [usuarioId, setUsuarioId] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const router = useRouter();

  useEffect(() => {
    api.get('/usuarios')
      .then(res => {
        if (res.data.length > 0) {
          setUsuarioId(res.data[0].id);
        }
      })
      .catch(() => console.error("Erro ao carregar técnicos"));
  }, []);

  const salvarOrdem = async (e: any) => {
    e.preventDefault();
    const idFinal = usuarioId || 1;
    try {
      await api.post('/ordens', {
        titulo,
        descricao,
        urgencia,
        prioridade,
        usuario_id: idFinal,
        status: 'Novo',
      });

      setSucesso(true);
      setTimeout(() => {
        setSucesso(false);
        setTitulo('');
        setDescricao('');
        setUrgencia('Média');
        setPrioridade('Média');
      }, 3000);

    } catch (err: any) {
      console.error(err.response?.data);
      alert("Falha ao registrar chamado: " + (err.response?.data?.error || "Verifique os dados"));
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-8 tracking-tight">Novo Chamado</h2>

      {sucesso && (
        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-5 py-4 rounded-xl mb-6 animate-pulse">
          <CheckCircle size={22} />
          <span className="font-bold text-sm">Chamado registrado com sucesso!</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={salvarOrdem} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Urgência</label>
              <select value={urgencia} onChange={(e) => setUrgencia(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100">
                <option value="Muito Alta">Muito Alta</option>
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prioridade</label>
              <select value={prioridade} onChange={(e) => setPrioridade(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100">
                <option value="Muito Alta">Muito Alta</option>
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Título *</label>
            <input
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="Assunto da requisição"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descrição Técnica *</label>
            <textarea
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none h-40 focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="Descreva detalhadamente..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-6 py-3 text-xs font-bold text-slate-400 uppercase hover:text-slate-600 dark:hover:text-slate-200 transition-all"
            >
              Cancelar
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-lg shadow-md transition-all uppercase text-xs tracking-widest">
              Adicionar Chamado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}