# Dockerfile in project root
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

# Copy backend code (server/)
COPY server ./server

# Copy frontend build
COPY dist/bachelor-work-app/browser ./dist/browser

WORKDIR /app/server

EXPOSE 3000
CMD ["node", "server.js"]
