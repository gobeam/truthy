FROM node:14-alpine As development

WORKDIR /usr/src/app

# COPY package*.json ./
COPY package.json ./

COPY yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

FROM node:14-alpine As production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json ./

COPY yarn.lock ./

RUN yarn install --production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/main"]