FROM node:10
COPY . /instagras-user-ws
WORKDIR /instagras-user-ws
RUN npm install
EXPOSE 3000
CMD [ "node", "api.js" ]