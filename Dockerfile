FROM node:latest
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build && \
    npm install -g serve
CMD ["serve", "-s", "build"]