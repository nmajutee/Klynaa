# Blockchain: Hardhat + Ethers.js
FROM node:20-alpine
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
EXPOSE 8545
CMD ["npm", "run", "dev"]
