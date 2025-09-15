# Multi-stage build optimisé pour le backend
FROM node:18-alpine AS base

# Installer les dépendances système communes
RUN apk add --no-cache \
    dumb-init \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# Stage de développement avec toutes les dépendances
FROM base AS deps
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (dev + prod)
RUN npm ci --include=dev && npm cache clean --force

# Stage de build
FROM deps AS build
WORKDIR /app

# Copier le code source
COPY --chown=nodejs:nodejs . .

# Construire le projet TypeScript
RUN npm run build

# Nettoyer les dépendances de dev
RUN npm prune --production && npm cache clean --force

# Stage de production avec Puppeteer
FROM base AS production-deps
WORKDIR /app

# Installer les dépendances système pour Puppeteer
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && ln -sf python3 /usr/bin/python

# Variables d'environnement pour Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    CHROME_BIN=/usr/bin/chromium-browser

# Copier les dépendances de production
COPY --from=build --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nodejs:nodejs /app/package*.json ./

# Stage final de production
FROM production-deps AS production
WORKDIR /app

# Copier les fichiers construits
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist
COPY --from=build --chown=nodejs:nodejs /app/package*.json ./

# Créer les répertoires nécessaires
RUN mkdir -p /app/exports && \
    chown -R nodejs:nodejs /app

# Utiliser l'utilisateur non-root
USER nodejs

# Exposer le port
EXPOSE 8000

# Variables d'environnement par défaut
ENV NODE_ENV=production \
    PORT=8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Utiliser dumb-init pour une gestion propre des signaux
ENTRYPOINT ["dumb-init", "--"]

# Commande de démarrage
CMD ["npm", "start"]