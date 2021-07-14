FROM node:16

WORKDIR /usr/app

COPY package*.json ./
    
RUN npm install

COPY src src

WORKDIR /usr/app/src

CMD [ "node", "server.js" ]
