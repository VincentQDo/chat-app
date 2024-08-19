FROM node:lts-alpine3.19

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080

CMD [ "node", "app.js" ]
