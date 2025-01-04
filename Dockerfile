# Dockerfile
FROM node:18

RUN apt-get update && apt-get install -y postgresql-client netcat-openbsd


WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
# docker system prune -a -f --volumes & docker rmi $(docker images -q) & docker rm $(docker ps -aq) & docker rmi $(docker images -q)  