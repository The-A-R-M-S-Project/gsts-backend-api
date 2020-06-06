# Graduate Students Tracking System API

[![Build Status](https://travis-ci.com/The-A-R-M-S-Project/gsts-backend-api.svg?branch=mongo-atlas-deploy)](https://travis-ci.com/The-A-R-M-S-Project/gsts-backend-api)

### RUN API LOCALLY

Make sure you have mongodb running on your machine. Set up an environment variable file `.env` and include values of the following variables

```
NODE_ENV=development
PORT=<REPLACE WITH LOCAL DEV PORT>
DATABASE=<REPLACE WITH CONNECTION STRING TO MONGODB ATLAS DATABASE>
DATABASE_PASSWORD=<REPLACE WITH PASSWORD TO MONGODB ATLAS DATABASE>
DATABASE_LOCAL=mongodb://localhost:27017/gsts
DATABASE_TEST=mongodb://localhost:27017/test_gsts

JWT_SECRET=<REPLACE WITH ANY LONG RANDOM STRING>
JWT_EXPIRES_IN=<REPLACE WITH JWT EXPIRATION TIME>
JWT_COOKIE_EXPIRES_IN=<REPLACE WITH REPLACE WITH COOKIE EXPIRATION TIME>
JWT_ISSUER=<REPLACE WITH BACKEND-HOST DOMAIN>

EMAIL_USERNAME=<REPLACE WITH EMAIL USERNAME FROM MAILTRAP>
EMAIL_PASSWORD=<REPLACE WITH PASSWORD FROM MAILTRAP>
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=<REPLACE WITH PORT FROM MAILTRAP>

HOST=<REPLACE WITH FRONT-END HOST DOMAIN>
```

In order to test the system with a locally populated database, you need to first clear and populate the database with dummy data

```bash
cd dev-data
```

Clearing the local database

```bash
node import-dev-data.js --delete
```

Populating the local database

```bash
node import-dev-data.js --delete
```

#### Run the application

Install dependencies

```bash
npm install
```

Run application on localhost

```bash
npm start
```

### RUNNING TESTS

```bash
npm test
```

### Postman Tests

[![Run in Postman](https://run.pstmn.io/button.svg)](https://www.getpostman.com/collections/87d3c38f633d018d2abd)
