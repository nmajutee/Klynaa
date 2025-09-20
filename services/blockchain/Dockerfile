# Blockchain: Hardhat + Ethers.js
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /usr/src/app

# Copy package files
COPY package.json ./
COPY pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

EXPOSE 8545
CMD ["pnpm", "run", "dev"]
