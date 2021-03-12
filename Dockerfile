FROM node:lts-alpine@sha256:a75f7cc536062f9266f602d49047bc249826581406f8bc5a6605c76f9ed18e98

WORKDIR /usr/src/app

COPY package*.json .

COPY yarn.lock .

COPY . .

RUN yarn install

RUN yarn build

USER node

ENV NODE_ENV production

CMD ["node", "build/main.js"]
