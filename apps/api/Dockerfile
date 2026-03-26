FROM node:22-bookworm-slim

WORKDIR /app

RUN corepack enable
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./
COPY apps ./apps
COPY packages ./packages
COPY prisma ./prisma

RUN pnpm install --frozen-lockfile
RUN pnpm db:generate

EXPOSE 3010

CMD ["pnpm", "--filter", "@ctb/api", "start"]
