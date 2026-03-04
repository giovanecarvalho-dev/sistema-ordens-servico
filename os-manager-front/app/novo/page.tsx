'use client'
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useRouter } from 'next/navigation';

export default function NovoChamado() {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [urgencia, setUrgencia] = useState('Média');
  const [prioridade, setPrioridade] = useState('Média');
  const [usuarioId, setUsuarioId] = useState(''); 
  const router = useRouter();

  // Carrega o primeiro técnico disponível automaticamente para preencher o ID
  useEffect(() => {
    api.get('/usuarios')
      .then(res => {
        if (res.data.length > 0) {
          setUsuarioId(res.data[0].id); // Define o primeiro técnico encontrado como responsável
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
      router.push('/');
    } catch (err: any) {
      console.error(err.response?.data);
      alert("Falha ao registrar chamado: " + (err.response?.data?.error || "Verifique os dados"));
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <h2 className="text-2xl font-black text-gray-800 mb-8 tracking-tight">Novo Chamado</h2>
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <form onSubmit={salvarOrdem} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Urgência</label>
              <select value={urgencia} onChange={(e) => setUrgencia(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500">
                <option>Muito Alta</option><option>Alta</option><option>Média</option><option>Baixa</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Prioridade</label>
              <select value={prioridade} onChange={(e) => setPrioridade(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500">
                <option>Muito Alta</option><option>Alta</option><option>Média</option><option>Baixa</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Título *</label>
            <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500" placeholder="Assunto da requisição" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descrição Técnica *</label>
            <textarea className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none h-40 focus:ring-1 focus:ring-blue-500" placeholder="Descreva detalhadamente..." value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => router.push('/')} className="px-6 py-3 text-xs font-bold text-gray-400 uppercase hover:text-gray-600 transition-all">Cancelar</button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-lg shadow-md transition-all uppercase text-xs tracking-widest">Adicionar Chamado</button>
          </div>
        </form>
      </div>
    </div>
  );
}