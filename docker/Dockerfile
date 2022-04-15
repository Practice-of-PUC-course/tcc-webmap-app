FROM node:17.9-alpine

LABEL mantainer="Andre Carvalho <afacarvalho@yahoo.com.br>"

WORKDIR /app

COPY ./package.json .
ENV NPM_CONFIG_LOGLEVEL warn

# Install app dependencies
RUN npm install \
&& npm install pm2 -g
# && pm2 install pm2-server-monit \
# && pm2 install pm2-logrotate

COPY ./docker/setenv.sh .
COPY ./src ./src
COPY ./LICENSE .
COPY ./ecosystem.config.cjs .
RUN chmod +x setenv.sh

EXPOSE 3000
VOLUME ["/data/logs"]

ENTRYPOINT [ "./setenv.sh" ]