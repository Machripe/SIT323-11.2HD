FROM node:16

WORKDIR /user/src/app

COPY package*.json ./

RUN npm install

COPY app.js ./
COPY passport.js ./
COPY rsa_public.pem ./

EXPOSE 3001
CMD [ "node", "app.js" ]