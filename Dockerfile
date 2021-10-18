#Source
FROM node:alpine

#Directory
RUN mkdir -p /usr/src/app
WORKDIR /user/src/app

COPY package.json ./usr/src/app
RUN npm install

COPY ./ ./
EXPOSE  3000
CMD ["npm", "start"]

