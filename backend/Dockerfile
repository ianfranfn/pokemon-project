FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG PORT=4000
ENV PORT $PORT
EXPOSE $PORT
EXPOSE 9080

CMD ["npm", "start"]
