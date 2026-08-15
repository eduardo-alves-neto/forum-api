# ---------- Base ----------
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

# ---------- Dependencies ----------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---------- Build ----------
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ---------- Production dependencies ----------
# Mantém o pacote "prisma" (CLI) para rodar "prisma migrate deploy" no start.
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm install prisma@$(node -p "require('./package.json').devDependencies.prisma.replace('^','')")

# ---------- Runtime ----------
FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/generated ./src/generated
COPY --from=build /app/prisma ./prisma
COPY package.json prisma.config.ts ./

RUN addgroup -S nodejs && adduser -S nestjs -G nodejs \
  && mkdir -p /app/data && chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
