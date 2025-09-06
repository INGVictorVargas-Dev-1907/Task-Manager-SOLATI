# ========================================
# IMAGEN BASE
# ========================================
FROM php:8.2-apache

# ========================================
# VARIABLES DE ENTORNO
# ========================================
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
ENV COMPOSER_ALLOW_SUPERUSER=1
ENV DEBIAN_FRONTEND=noninteractive

# ========================================
# INSTALACIÓN DE DEPENDENCIAS DEL SISTEMA
# ========================================
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ========================================
# INSTALACIÓN DE EXTENSIONES DE PHP
# ========================================
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pgsql \
    zip \
    opcache

# ========================================
# CONFIGURACIÓN DE OPCACHE
# ========================================
RUN { \
    echo 'opcache.memory_consumption=128'; \
    echo 'opcache.interned_strings_buffer=8'; \
    echo 'opcache.max_accelerated_files=4000'; \
    echo 'opcache.revalidate_freq=60'; \
    echo 'opcache.fast_shutdown=1'; \
    echo 'opcache.enable_cli=1'; \
} > /usr/local/etc/php/conf.d/opcache-recommended.ini

# ========================================
# CONFIGURACIÓN DE APACHE
# ========================================
RUN a2enmod rewrite headers

# Configurar document root
RUN sed -ri -e "s!/var/www/html!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/sites-available/*.conf \
    && sed -ri -e "s!/var/www/!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# ========================================
# INSTALACIÓN DE COMPOSER
# ========================================
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

# ========================================
# DIRECTORIO DE TRABAJO
# ========================================
WORKDIR /var/www/html

# ========================================
# COPIA DE ARCHIVOS DE COMPOSER
# ========================================
COPY composer.json ./

# ========================================
# INSTALACIÓN DE DEPENDENCIAS
# ========================================
RUN if [ -f "composer.json" ]; then \
        # Si composer.lock existe, úsalo, sino instala normalmente \
        if [ -f "composer.lock" ]; then \
            composer install --no-dev --no-autoloader --no-scripts --no-progress --prefer-dist; \
        else \
            composer install --no-dev --no-autoloader --no-scripts --no-progress --prefer-dist; \
        fi; \
    fi

# Copiar el resto de la aplicación
COPY . .

# ========================================
# CONFIGURACIÓN FINAL DE COMPOSER
# ========================================
RUN if [ -f "composer.json" ]; then \
        composer dump-autoload --optimize; \
    fi

# ========================================
# CONFIGURACIÓN DE PERMISOS
# ========================================
RUN chown -R www-data:www-data /var/www/html \
    && find /var/www/html -type f -exec chmod 644 {} \; \
    && find /var/www/html -type d -exec chmod 755 {} \;

# ========================================
# CREACIÓN DE DIRECTORIOS
# ========================================
RUN mkdir -p /var/log/php \
    && chown -R www-data:www-data /var/log/php

# ========================================
# HEALTHCHECK
# ========================================
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# ========================================
# PUERTO DE EXPOSICIÓN
# ========================================
EXPOSE 80

# ========================================
# COMANDO DE INICIO
# ========================================
CMD ["apache2-foreground"]