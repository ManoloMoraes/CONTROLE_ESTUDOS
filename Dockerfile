# Dockerfile para deploy no Coolify de um projeto React (Vite)
# Imagem base oficial do Node.js
FROM node:20-alpine as build

# Diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Instala as dependências
RUN npm install

# Copia o restante do código
COPY . .

# Build do projeto
RUN npm run build

# ---
# Fase de produção: Servir arquivos estáticos com nginx
FROM nginx:alpine

# Remove a configuração padrão do nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos buildados para o nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copia configuração customizada do nginx (opcional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expõe a porta padrão do nginx
EXPOSE 80

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]
