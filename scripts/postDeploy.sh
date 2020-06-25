#!/bin/bash
echo 'installing Dependencies ...'
/home/alvin/.nvm/versions/node/v14.4.0/bin/npm install
echo 'starting server'
/home/alvin/.nvm/versions/node/v14.4.0/bin/pm2 restart server
echo 'started server. ending SSH session ...'
exit