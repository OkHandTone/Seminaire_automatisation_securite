# Étape 1 : build du front React avec Vite.
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Étape 2 : runtime Node — un seul service Express qui sert l'API ET le front.
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
# --ignore-scripts : pas de hook husky (devDep absente) dans l'image runtime.
RUN npm ci --omit=dev --ignore-scripts
COPY server ./server
COPY src ./src
COPY --from=build /app/dist ./dist

# Render fournit la variable PORT ; le serveur s'y adapte (défaut 10000).
ENV PORT=10000
EXPOSE 10000

CMD ["node", "server/index.js"]
