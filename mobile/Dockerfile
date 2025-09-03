# Mobile: Expo
FROM node:20-alpine
WORKDIR /usr/src/app
ENV CI=1
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
EXPOSE 19000 19001 19002
CMD ["npm", "run", "start"]
