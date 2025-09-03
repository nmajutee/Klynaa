# Blockchain: Hardhat + Ethers.js
FROM node:20-alpine
WORKDIR /usr/src/app
COPY blockchain/package.json blockchain/package-lock.json* ./
RUN npm ci || npm install
COPY blockchain .
EXPOSE 8545
CMD ["npm", "run", "dev"]
