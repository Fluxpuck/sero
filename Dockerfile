FROM node:16.15.0
WORKDIR /flux
COPY package.json /flux
COPY package-lock.json ./
RUN npm install
COPY . /flux
CMD node main.js