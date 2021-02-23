echo 'creating .env file ...'
echo PORT=$PORT >> .env
echo DATABASE=$DATABASE >> .env
echo DATABASE_PASSWORD=$DATABASE_PASSWORD >> .env
echo DATABASE_LOCAL=$DATABASE_LOCAL >> .env
echo DATABASE_TEST=$DATABASE_TEST >> .env
echo JWT_SECRET=$JWT_SECRET >> .env
echo JWT_EXPIRES_IN=$JWT_EXPIRES_IN >> .env
echo JWT_COOKIE_EXPIRES_IN=$JWT_COOKIE_EXPIRES_IN >> .env
echo JWT_ISSUER=$JWT_ISSUER >> .env
echo EMAIL_USERNAME=$EMAIL_USERNAME >> .env
echo EMAIL_PASSWORD=$EMAIL_PASSWORD >> .env
echo EMAIL_HOST=$EMAIL_HOST >> .env
echo EMAIL_PORT=$EMAIL_PORT >> .env
echo DO_ENDPOINT=$DO_ENDPOINT >> .env
echo DO_BUCKET=$DO_BUCKET >> .env
echo DO_ACCESS_KEY=$DO_ACCESS_KEY >> .env
echo DO_SECRET_ACCESS_KEY=$DO_SECRET_ACCESS_KEY >> .env
echo DO_S3REGION=$DO_S3REGION >> .env

echo 'securely copy .env file ...'
scp .env arms-test@161.35.252.183:~/