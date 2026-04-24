'use client'
import { useState } from 'react';
import api from '../services/api';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

const LIMITE_TITULO = 100;
const LIMITE_DESCRICAO = 200;
const LIMITE_LOCALIZACAO = 120;

export default function NovoChamado() {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Rede');
  const [localizacao, setLocalizacao] = useState('');
  const [anexo, setAnexo] = useState<File | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const router = useRouter();

  const salvarOrdem = async (e: any) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('descricao', descricao);
      formData.append('categoria', categoria);
      formData.append('localizacao', localizacao);
      if (anexo) {
        formData.append('anexo', anexo);
      }

      await api.post('/ordens', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSucesso(true);
      setTimeout(() => {
        setSucesso(false);
        setTitulo('');
        setDescricao('');
        setCategoria('Rede');
        setLocalizacao('');
        setAnexo(null);
      }, 3000);
    } catch (err: any) {
      console.error(err.response?.data);
      alert("Falha ao registrar chamado: " + (err.response?.data?.error || "Verifique os dados"));
    }
  };

  const inputClass = "w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500";

  const Contador = ({ atual, limite }: { atual: number, limite: number }) => (
    <span className={`text-[10px] font-bold ${atual >= limite ? 'text-red-500' : atual >= limite * 0.8 ? 'text-yellow-500' : 'text-slate-400'}`}>
      {atual}/{limite}
    </span>
  );

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
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categoria *</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={inputClass} required>
                <option value="Rede">Rede</option>
                <option value="Infraestrutura">Infraestrutura</option>
                <option value="Acesso">Acesso</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Localização</label>
                <Contador atual={localizacao.length} limite={LIMITE_LOCALIZACAO} />
              </div>
              <input
                className={inputClass}
                placeholder="Ex: GETAG - DETIN"
                value={localizacao}
                maxLength={LIMITE_LOCALIZACAO}
                onChange={(e) => setLocalizacao(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Título *</label>
              <Contador atual={titulo.length} limite={LIMITE_TITULO} />
            </div>
            <input
              className={inputClass}
              placeholder="Assunto da requisição"
              value={titulo}
              maxLength={LIMITE_TITULO}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descrição *</label>
              <Contador atual={descricao.length} limite={LIMITE_DESCRICAO} />
            </div>
            <textarea
              className={`${inputClass} h-40`}
              placeholder="Descreva detalhadamente o problema..."
              value={descricao}
              maxLength={LIMITE_DESCRICAO}
              onChange={(e) => setDescricao(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Anexo (Opcional)</label>
            </div>
            <input
              type="file"
              className={inputClass}
              onChange={(e) => setAnexo(e.target.files?.[0] || null)}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <p className="text-[10px] text-slate-400">Formatos aceitos: PDF, JPG, PNG (Max: 5MB)</p>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => router.push('/')}
              className="px-6 py-3 text-xs font-bold text-slate-400 uppercase hover:text-slate-600 dark:hover:text-slate-200 transition-all">
              Cancelar
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-lg shadow-md transition-all uppercase text-xs tracking-widest">
              Abrir Chamado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}