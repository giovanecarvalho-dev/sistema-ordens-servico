'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../services/api';

export default function Login() {
  const router = useRouter();
  const [isCadastro, setIsCadastro] = useState(false);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (isCadastro) {
        await api.post('/usuarios', { nome, cpf, email, senha });
        alert("Conta criada com sucesso!");
        setIsCadastro(false);
      } else {
        const resposta = await api.post('/login', { cpf, senha });
if (resposta.status === 200) {
    const user = resposta.data.user;
    const token = resposta.data.token;

    sessionStorage.setItem('tecnicoLogado', cpf);
    sessionStorage.setItem('usuarioId', user.id);
    sessionStorage.setItem('usuarioCargo', user.cargo?.nome || user.cargo);
    sessionStorage.setItem('usuarioNome', user.nome);
    sessionStorage.setItem('token', token);

    const temaSalvo = localStorage.getItem(`theme_${cpf}`) || 'light';
    localStorage.setItem('theme', temaSalvo);
    document.documentElement.classList.toggle('dark', temaSalvo === 'dark');

    if ((user.cargo?.nome || user.cargo) === 'Usuario') {
        router.push('/novo');
    } else {
        router.push('/');
    }
}
      }
    } catch (err) {
      alert(isCadastro ? "Erro ao criar conta." : "Credenciais inválidas.");
    }
  };

  const inputClass = "w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 dark:placeholder-slate-500";
  const labelClass = "text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
            {isCadastro ? 'Novo Usuário' : 'Central de Suporte Técnico'}
          </h1>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-[0.2em] font-bold">
            {isCadastro ? 'Crie sua credencial de acesso' : 'Identifique-se para continuar'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isCadastro && (
            <>
              <div className="space-y-1">
                <label className={labelClass}>Nome Completo</label>
                <input
                  required type="text" value={nome} onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite seu nome"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>E-mail</label>
                <input
                  required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className={inputClass}
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className={labelClass}>CPF</label>
            <input
              required type="text" value={cpf}
              onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))}
              placeholder="00000000000" maxLength={11}
              className={`${inputClass} font-mono`}
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Senha</label>
            <input
              required type="password" value={senha} onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg uppercase text-xs tracking-widest mt-4 cursor-pointer">
            {isCadastro ? 'Cadastrar' : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-800 pt-6">
          <button type="button" onClick={() => setIsCadastro(!isCadastro)} className="text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 uppercase tracking-widest cursor-pointer">
            {isCadastro ? 'Já tenho conta. Fazer Login.' : 'Não possui acesso? Cadastre-se.'}
          </button>
        </div>
      </div>
    </div>
  );
}