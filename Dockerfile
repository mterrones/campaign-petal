# Build: docker build -t enviamas-frontend --build-arg VITE_API_BASE_URL=https://api.tu-dominio.com .
# Run:   docker run --rm -p 8080:80 enviamas-frontend
# La URL del API se inyecta en build (Vite); si cambia, hay que reconstruir la imagen.

FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

FROM nginx:1.27-alpine AS runner

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
