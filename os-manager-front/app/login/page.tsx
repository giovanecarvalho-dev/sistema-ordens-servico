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

    localStorage.setItem('tecnicoLogado', cpf);
    localStorage.setItem('usuarioId', user.id);
    localStorage.setItem('usuarioCargo', user.cargo?.nome || user.cargo);
    localStorage.setItem('usuarioNome', user.nome);
    localStorage.setItem('token', token);

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
      alert(isCadastro ? "Erro ao criar conta. Verifique o Back-end." : "Credenciais inválidas.");
    }
  };

  return (
    <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
          {isCadastro ? 'Novo Usuário' : 'Central de Suporte Técnico'}
        </h1>
        <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-[0.2em] font-bold">
          {isCadastro ? 'Crie sua credencial de acesso' : 'Identifique-se para continuar'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {isCadastro && (
          <>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Nome Completo</label>
              <input
                required type="text" value={nome} onChange={(e) => setNome(e.target.value)}
                placeholder="Digite seu nome"
                className="w-full p-3 bg-gray-50 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">E-mail</label>
              <input
                required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full p-3 bg-gray-50 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
              />
            </div>
          </>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">CPF</label>
          <input
  required type="text" value={cpf}
  onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))}
  placeholder="00000000000" maxLength={11}
  className="w-full p-3 bg-gray-50 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
/>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Senha</label>
          <input
            required type="password" value={senha} onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
            className="w-full p-3 bg-gray-50 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg uppercase text-xs tracking-widest mt-4">
          {isCadastro ? 'Cadastrar' : 'Entrar no Sistema'}
        </button>
      </form>

      <div className="mt-8 text-center border-t border-gray-100 pt-6">
        <button type="button" onClick={() => setIsCadastro(!isCadastro)} className="text-xs font-bold text-slate-500 hover:text-blue-600 uppercase tracking-widest">
          {isCadastro ? 'Já tenho conta. Fazer Login.' : 'Não possui acesso? Cadastre-se.'}
        </button>
      </div>
    </div>
  );
}