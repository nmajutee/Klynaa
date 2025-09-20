# Mobile: Expo
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /usr/src/app
ENV CI=1

# Copy package files
COPY package.json ./
COPY pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

EXPOSE 19000 19001 19002
CMD ["pnpm", "run", "start"]
