#!/bin/bash
echo 'installing Dependencies ...'
npm install
echo 'starting server'
pm2 restart server
echo 'started server. ending SSH session ...'
exit