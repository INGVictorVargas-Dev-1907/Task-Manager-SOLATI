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
ENV COMPOSER_MEMORY_LIMIT=-1

# ========================================
# INSTALACIÓN DE DEPENDENCIAS DEL SISTEMA
# ========================================
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    libicu-dev \
    netcat-openbsd \
    iputils-ping \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ========================================
# INSTALACIÓN DE EXTENSIONES DE PHP
# ========================================
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pgsql \
    zip \
    opcache \
    intl

# ========================================
# SCRIPT DE INICIO PERSONALIZADO
# ========================================
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# ========================================
# CONFIGURACIÓN DE PHP
# ========================================
RUN { \
    echo 'opcache.memory_consumption=128'; \
    echo 'opcache.interned_strings_buffer=8'; \
    echo 'opcache.max_accelerated_files=4000'; \
    echo 'opcache.revalidate_freq=60'; \
    echo 'opcache.fast_shutdown=1'; \
    echo 'opcache.enable_cli=1'; \
    echo 'opcache.enable=1'; \
    echo 'upload_max_filesize=10M'; \
    echo 'post_max_size=10M'; \
    echo 'memory_limit=256M'; \
    echo 'max_execution_time=120'; \
    echo 'date.timezone=UTC'; \
} > /usr/local/etc/php/conf.d/custom-settings.ini

# ========================================
# CONFIGURACIÓN DE APACHE
# ========================================
RUN a2enmod rewrite headers \
    && sed -ri -e "s!/var/www/html!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/sites-available/*.conf \
    && sed -ri -e "s!/var/www/!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# ========================================
# INSTALACIÓN DE COMPOSER
# ========================================
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

# ========================================
# DIRECTORIO DE TRABAJO Y COPIA DE ARCHIVOS
# ========================================
WORKDIR /var/www/html
COPY composer.json composer.lock* ./

# ========================================
# INSTALACIÓN DE DEPENDENCIAS
# ========================================
RUN if [ -f "composer.json" ]; then \
    # Instalar dependencias optimizadas para producción \
    composer install --no-dev --no-autoloader --no-scripts --no-progress --prefer-dist --optimize-autoloader; \
fi

# ========================================
# COPIA DEL RESTO DE LA APLICACIÓN
# ========================================
COPY . .

# ========================================
# CONFIGURACIÓN FINAL DE COMPOSER Y PERMISOS
# ========================================
RUN if [ -f "composer.json" ]; then \
    composer dump-autoload --optimize; \
    fi && \
    chown -R www-data:www-data /var/www/html \
    && find /var/www/html -type f -exec chmod 644 {} \; \
    && find /var/www/html -type d -exec chmod 755 {} \;

# ========================================
# CREACIÓN DE DIRECTORIOS NECESARIOS
# ========================================
RUN mkdir -p /var/log/php \
    && chown -R www-data:www-data /var/log/php \
    && mkdir -p /tmp/openapi \
    && chown -R www-data:www-data /tmp/openapi

# ========================================
# HEALTHCHECK
# ========================================
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# ========================================
# PUERTO DE EXPOSICIÓN Y COMANDO DE INICIO
# ========================================
EXPOSE 80
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["apache2-foreground"]