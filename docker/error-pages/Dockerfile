FROM nginx:alpine

# Copier les pages d'erreur personnalisées
COPY ./html /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001 -G nginx

# Permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Créer les répertoires nécessaires
RUN mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/cache/nginx/proxy_temp && \
    mkdir -p /var/cache/nginx/fastcgi_temp && \
    mkdir -p /var/cache/nginx/uwsgi_temp && \
    mkdir -p /var/cache/nginx/scgi_temp && \
    chown -R nginx:nginx /var/cache/nginx

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
