#!/arms/bin/bash
echo 'set production environment'
echo NODE_ENV=production >> .env
echo 'installing Dependencies ...'
echo 'Installing eslint peer dependencies...'
/usr/bin/npx install-peerdeps --dev eslint-config-airbnb-base
echo 'Installing other
 dependencies...'
/usr/bin/npm install
echo 'starting server'
/usr/bin/pm2 restart server
echo 'started server. ending SSH session ...'
exit