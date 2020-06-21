#!/usr/bin/env sh
set -x
export NODE_ENV=production
export NVM_BIN=$HOME/.nvm/versions/node/v14.4.0/bin
cd /home/$REMOTE_USER/$REMOTE_APP_DIR && \
tar zxvf package.tgz -C . && \
mv build/package.json . && \
npm install && \
npm run start