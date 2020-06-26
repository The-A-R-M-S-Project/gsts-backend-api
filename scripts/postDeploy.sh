#!/arms/bin/bash
echo 'set production environment'
echo NODE_ENV=production >> .env
echo 'installing Dependencies ...'
/usr/bin/npm install
echo 'starting server'
/usr/bin/pm2 restart server
echo 'started server. ending SSH session ...'
exit