'use client'
import { useState, useEffect } from 'react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [listaCategorias, setListaCategorias] = useState<any[]>([]);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("aux_categorias");
      if (cached) {
        const parsed = JSON.parse(cached);
        setListaCategorias(parsed);
        if (parsed.length > 0) {
          setCategoria(parsed[0].nome);
        }
        return;
      }
    } catch {}

    api.get('/categorias')
      .then((res) => {
        setListaCategorias(res.data);
        try {
          sessionStorage.setItem("aux_categorias", JSON.stringify(res.data));
        } catch {}
        if (res.data.length > 0) {
          setCategoria(res.data[0].nome);
        }
      })
      .catch((err) => console.error("Erro ao carregar categorias", err));
  }, []);

  const categorias = listaCategorias.length ? listaCategorias : [
    { id: 1, nome: "Rede" }, { id: 2, nome: "Acesso" }, { id: 3, nome: "Infraestrutura" }
  ];

  const salvarOrdem = async (e: any) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // O Front-end agora envia APENAS os dados do formulário.
      // A identidade (Token) vai automaticamente nos bastidores pelo axios/api.
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
    } catch (err: any) {
      let errorMessage = "Verifique os dados";
      if (err.response?.data?.errors) {
        const firstErrorKey = Object.keys(err.response.data.errors)[0];
        errorMessage = err.response.data.errors[firstErrorKey][0];
      } else if (err.response?.data?.message && err.response?.data?.message !== "The given data was invalid.") {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      alert("Falha ao registrar chamado:\n" + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500";

  const Contador = ({ atual, limite }: { atual: number, limite: number }) => (
    <span className={`text-[10px] font-bold ${atual >= limite ? 'text-red-500' : atual >= limite * 0.8 ? 'text-yellow-500' : 'text-slate-400'}`}>
      {atual}/{limite}
    </span>
  );

  return (
    <div className="max-w-4xl mx-auto py-4 md:py-6 px-4 md:px-6 h-full flex flex-col">
      <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white mb-4 md:mb-6 tracking-tight">Novo Chamado</h2>

      {/* Modal de Sucesso */}
      {sucesso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl flex flex-col items-center justify-center max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={40} className="text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white text-center mb-3 tracking-tight">Chamado Registrado!</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center text-sm mb-8 leading-relaxed">
              Sua solicitação foi enviada com sucesso e em breve será analisada pela nossa equipe técnica.
            </p>
            <button
              onClick={() => {
                setSucesso(false);
                setTitulo('');
                setDescricao('');
                setCategoria(categorias[0]?.nome || 'Rede');
                setLocalizacao('');
                setAnexo(null);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all uppercase text-xs tracking-widest shadow-lg shadow-blue-600/20"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1">
        <form onSubmit={salvarOrdem} className="space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categoria *</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={inputClass} required>
                {categorias.map((c: any) => (
                  <option key={c.id} value={c.nome}>{c.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Localização</label>
              <Contador atual={localizacao.length} limite={LIMITE_LOCALIZACAO} />
            </div>
            <input
              className={inputClass}
              placeholder="Ex: Sala 101, Prédio A"
              value={localizacao}
              maxLength={LIMITE_LOCALIZACAO}
              onChange={(e) => setLocalizacao(e.target.value)}
            />
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
              className={`${inputClass} h-28 md:h-32 resize-none`}
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
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-lg shadow-md transition-all uppercase text-xs tracking-widest ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {isSubmitting ? 'Enviando...' : 'Abrir Chamado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}