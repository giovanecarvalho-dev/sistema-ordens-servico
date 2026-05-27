import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {

    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // O código 401 significa que o JWT expirou ou é inválido
      
      // Se o erro 401 for na rota de login, não mostramos "sessão expirada", 
      // pois é apenas uma tentativa de login inválida.
      if (error.config.url?.includes('/login')) {
        return Promise.reject(error);
      }
      
      //Limpa tudo que é velho no navegador
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('usuarioId');
      sessionStorage.removeItem('usuarioCargo');
      
      alert("Sua sessão expirou. Por segurança, por favor, faça login novamente para continuar.");

      // Chuta o usuário de volta para o login
      // Usamos window.location porque aqui estamos fora de um componente React
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;