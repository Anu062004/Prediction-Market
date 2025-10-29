FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* ./
RUN npm ci || npm i
COPY watcher.js ./
CMD ["node","watcher.js"]
