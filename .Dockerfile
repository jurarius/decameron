# -------- Etapa 1: Composer (solo dependencias de producción) --------
FROM composer:2 AS composer_stage
WORKDIR /app

# Copiamos definiciones de PHP (para resolver dependencias)
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --optimize-autoloader

# -------- Etapa 2: Node (build de Vite) --------
FROM node:20-alpine AS node_stage
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* .npmrc* ./
# Si usas npm:
RUN npm ci || npm install
COPY . .
RUN npm run build

# -------- Etapa 3: Runtime PHP (servidor embebido) --------
FROM php:8.3-cli-alpine

# Paquetes del sistema y extensiones PHP necesarias
RUN apk add --no-cache \
    git curl zip unzip icu-libs icu-data-full oniguruma libpng libjpeg-turbo libwebp libpq \
    postgresql-dev icu-dev libzip-dev zlib-dev libpng-dev libjpeg-turbo-dev libwebp-dev \
 && docker-php-ext-configure gd --with-jpeg --with-webp \
 && docker-php-ext-install -j$(nproc) gd intl zip pdo pdo_pgsql

WORKDIR /app

# Copiamos la app
COPY . .

# Copiamos vendor desde la etapa de composer
COPY --from=composer_stage /app/vendor ./vendor

# Copiamos build de Vite (public/build) desde la etapa de node
COPY --from=node_stage /app/public/build ./public/build

# Optimizaciones de Laravel para prod
RUN php artisan config:clear || true \
 && php artisan route:clear || true \
 && php artisan view:clear || true \
 && php artisan config:cache || true \
 && php artisan route:cache || true \
 && php artisan view:cache || true

# Permisos para cache y storage
RUN chmod -R 775 storage bootstrap/cache || true

# Render expone un $PORT (p.ej. 10000). Respetarlo.
ENV PORT=8080
EXPOSE 8080

# Al arrancar:
# 1) Migraciones con --force (ignora interacción)
# 2) Servidor embebido PHP sirviendo /public
CMD php artisan migrate --force && php -S 0.0.0.0:${PORT} -t public
