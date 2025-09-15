# Image Nginx optimisée avec compression avancée
FROM nginx:alpine

# Installer les outils nécessaires
RUN apk add --no-cache \
    brotli \
    gzip

# Créer les répertoires nécessaires
RUN mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/cache/nginx/proxy_temp && \
    mkdir -p /var/cache/nginx/fastcgi_temp && \
    mkdir -p /var/cache/nginx/uwsgi_temp && \
    mkdir -p /var/cache/nginx/scgi_temp && \
    mkdir -p /var/log/nginx && \
    mkdir -p /etc/nginx/conf.d && \
    mkdir -p /usr/share/nginx/html/assets

# Copier la configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/ /etc/nginx/conf.d/

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001 -G nginx

# Permissions
RUN chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html

# Script pour pré-compresser les assets
COPY precompress.sh /usr/local/bin/precompress.sh
RUN chmod +x /usr/local/bin/precompress.sh

USER nginx

EXPOSE 80

STOPSIGNAL SIGQUIT

# Pré-compresser les assets au démarrage puis lancer nginx
CMD ["/usr/local/bin/precompress.sh"]
