# Frontend: Next.js
FROM node:20-alpine
WORKDIR /usr/src/app
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci || npm install
COPY frontend .
EXPOSE 3000
CMD ["npm", "run", "dev"]
