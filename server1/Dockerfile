FROM node:16

WORKDIR /usr/app

RUN npm install pnpm -g && pnpm install && pnpm build

EXPOSE 8080

CMD ["npm","run","deploy"]