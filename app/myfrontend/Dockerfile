# --- Etapa 1: build da aplicação ---
FROM node:20 AS builder

WORKDIR /app

# Copia apenas arquivos essenciais primeiro (melhora cache)
COPY package*.json ./
RUN npm install

# Agora copia o restante e gera o build
COPY . .
RUN npm run build


# --- Etapa 2: serve o build com imagem mínima ---
FROM node:20-slim

WORKDIR /app

# Instala apenas o 'serve'
RUN npm install -g serve

# Copia apenas os arquivos finais da etapa de build
COPY --from=builder /app/build ./build

# Roda o app em http://localhost:3000
CMD ["serve", "-s", "build", "-l", "3000"]