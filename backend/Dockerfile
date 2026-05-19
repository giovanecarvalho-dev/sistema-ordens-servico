FROM php:8.4-fpm

# Instala dependências do sistema e PostgreSQL
RUN apt-get update && apt-get install -y libpq-dev zip unzip git curl netcat-openbsd

# Extensões PHP necessárias
RUN docker-php-ext-install pdo pdo_pgsql

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Diretório de trabalho
WORKDIR /var/www

# Copia o código
COPY . .

# Permite execução do entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Comando padrão
CMD ["/entrypoint.sh"]