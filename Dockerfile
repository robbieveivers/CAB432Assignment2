#Source
FROM node:alpine

#Directory
RUN mkdir -p /usr/src/app
WORKDIR /user/src/app

COPY package.json ./usr/src/app
RUN npm install

COPY ecosystem.config.js



COPY ./ ./
EXPOSE  3000
CMD [ "pm2", "start", "ecosystem.config.js", "--no-deamon"]
CMD ["npm", "start"]

