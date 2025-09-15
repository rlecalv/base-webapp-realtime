FROM node:18-alpine

# Créer le répertoire de l'application
WORKDIR /app

# Installer les dépendances système nécessaires pour Node.js et Puppeteer
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
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances Node.js
RUN npm ci && npm cache clean --force

# Copier le code source
COPY . .

# Construire le projet TypeScript
RUN npm run build

# Créer le répertoire d'exports
RUN mkdir -p /app/exports

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Changer la propriété des fichiers
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exposer le port
EXPOSE 8000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=8000

# Commande de démarrage
CMD ["npm", "start"]