#!/bin/bash
set -e
# Ejecuta el script de entrada por defecto de la imagen PHP, que a su vez iniciará Apache.
exec docker-php-entrypoint "$@"