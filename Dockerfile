# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable
RUN corepack prepare pnpm@10.13.1 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

FROM deps AS dev
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
COPY . .

EXPOSE 5173

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:5173/ || exit 1

CMD ["pnpm", "dev", "--host", "0.0.0.0"]

FROM base AS build
ARG VITE_API_BASE_URL
ENV NODE_ENV=production
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM nginxinc/nginx-unprivileged:1.29-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:5173/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
