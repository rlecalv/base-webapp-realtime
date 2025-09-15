# Multi-stage build ultra-optimisé pour Next.js
FROM node:18-alpine AS base

# Installer les dépendances système et créer l'utilisateur
RUN apk add --no-cache \
    libc6-compat \
    dumb-init \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Stage des dépendances
FROM base AS deps
WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json* ./

# Installer les dépendances avec cache optimisé
RUN npm ci --only=production && npm cache clean --force

# Stage des dépendances de développement
FROM base AS deps-dev
WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json* ./

# Installer toutes les dépendances
RUN npm ci && npm cache clean --force

# Stage de build
FROM deps-dev AS builder
WORKDIR /app

# Copier le code source
COPY --chown=nextjs:nodejs . .

# Variables d'environnement pour la build
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# Optimiser la build Next.js
RUN npm run build

# Stage de production
FROM base AS runner
WORKDIR /app

# Variables d'environnement de production
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# Copier les dépendances de production uniquement
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nextjs:nodejs /app/package.json ./package.json

# Copier les fichiers de build Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Optimiser les permissions
RUN chown -R nextjs:nodejs /app

# Utiliser l'utilisateur non-root
USER nextjs

# Exposer le port
EXPOSE 3000

# Health check optimisé
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Utiliser dumb-init pour une gestion propre des signaux
ENTRYPOINT ["dumb-init", "--"]

# Commande de démarrage
CMD ["node", "server.js"]