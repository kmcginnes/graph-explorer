FROM node:24-alpine

RUN corepack enable

WORKDIR /graph-explorer
COPY . .

RUN pnpm install && chmod a+x ./process-environment.sh

CMD ["sh", "-c", "./process-environment.sh && pnpm dev"]
