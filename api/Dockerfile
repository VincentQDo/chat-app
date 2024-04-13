FROM node:lts-alpine3.19

COPY package.json .
COPY package-lock.json .

RUN npm i

COPY app.js .

CMD [ "node", "app.js" ]