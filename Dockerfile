FROM node:12-alpine
WORKDIR .
COPY . .
RUN yarn install --production
CMD ["npm", "start"]
