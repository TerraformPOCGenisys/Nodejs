FROM node:alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install
RUN apt update -y  && apt install curl -y
EXPOSE 3000