# -------- Etapa 1: Composer (solo dependencias de producción) --------
FROM composer:2 AS composer_stage
WORKDIR /app

# Copiamos definiciones de PHP para resolver deps
COPY composer.json composer.lock ./
# Evita correr scripts (no hay 'artisan' aún en esta etapa)
RUN composer install --no-dev --no-scripts --prefer-dist --no-interaction --no-progress --optimize-autoloader

# -------- Etapa 2: Node (build de Vite) --------
FROM node:20-alpine AS node_stage
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* .npmrc* ./
RUN npm ci || npm install
COPY . .
RUN npm run build

# -------- Etapa 3: Runtime PHP --------
FROM php:8.3-cli-alpine

# Paquetes del sistema y extensiones PHP necesarias
RUN apk add --no-cache \
    git curl zip unzip icu-libs icu-data-full oniguruma libpng libjpeg-turbo libwebp libpq \
    postgresql-dev icu-dev libzip-dev zlib-dev libpng-dev libjpeg-turbo-dev libwebp-dev \
 && docker-php-ext-configure gd --with-jpeg --with-webp \
 && docker-php-ext-install -j$(nproc) gd intl zip pdo pdo_pgsql

WORKDIR /app

# Copiamos TODO el proyecto
COPY . .

# Copiamos vendor desde la etapa de composer
COPY --from=composer_stage /app/vendor ./vendor

# Copiamos build de Vite (public/build) desde la etapa de node
COPY --from=node_stage /app/public/build ./public/build

# Permisos para cache y storage (antes del CMD)
RUN chmod -R 775 storage bootstrap/cache || true

# Render expone $PORT (p.ej., 10000)
ENV PORT=8080
EXPOSE 8080

# Arranque en runtime (ahora sí existen las env vars de Render)
# - Limpia/recachea config
# - Crea storage:link si hace falta
# - Ejecuta migraciones
# - Sirve la app con 'php artisan serve' escuchando en $PORT
CMD php artisan config:clear \
 && php artisan storage:link || true \
 && php artisan migrate --force \
 && php artisan config:cache \
 && php artisan serve --host 0.0.0.0 --port ${PORT}
