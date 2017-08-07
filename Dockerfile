FROM node

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/

COPY app.js /usr/src/app/
COPY bucket.js /usr/src/app/
COPY constants.js /usr/src/app/
COPY routes.js /usr/src/app/
COPY trie.js /usr/src/app/

RUN npm install

EXPOSE 3000
CMD [ "npm", "start" ]
