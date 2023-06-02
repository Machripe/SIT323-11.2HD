FROM node:16

WORKDIR /user/src/app

COPY package*.json ./

RUN npm install

COPY index.js ./
COPY index.html ./
COPY dashboard.html ./
COPY ./public/css/* ./public/css/

EXPOSE 8080
CMD [ "node", "index.js" ]