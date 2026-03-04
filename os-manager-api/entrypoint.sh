#!/bin/sh

# Espera o banco estar pronto para evitar erro de conexão na API
echo "Aguardando banco subir..."
until nc -z db 5432; do
  echo "Banco ainda não disponível, aguardando..."
  sleep 2
done

echo "Banco disponível!"

# Instala dependências se a pasta vendor não existir (útil para novos setups)
if [ ! -d "vendor" ]; then
  echo "Instalando dependências do Composer..."
  composer install --no-interaction --optimize-autoloader
fi

# REMOVIDO: php artisan migrate --force 

# Sobe o servidor do Laravel
echo "Iniciando servidor da API..."
php artisan serve --host=0.0.0.0 --port=8000