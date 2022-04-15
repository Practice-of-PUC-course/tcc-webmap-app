#!/bin/sh

echo "NODE_ENV=production" > .env
echo "API_LISTEN_PORT="${API_LISTEN_PORT} >> .env

pm2-runtime start ecosystem.config.cjs