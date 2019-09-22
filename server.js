const mongoose = require('mongoose');
const dotenv = require('dotenv');

if (process.env.NODE_ENV !== 'test') {
  process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
  });
}

dotenv.config({ path: './.env' });
const app = require('./app');

// -------------database--------------
let DB =
  process.env.NODE_ENV === 'production'
    ? process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
    : process.env.DATABASE_LOCAL;
if (process.env.NODE_ENV === 'test')
  DB = process.env.DATABASE_TEST || 'mongodb://mongo:27017/quickstarter-mongo-test';

console.log(`\n----> DATABASE: ${DB}\n`);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
if (process.env.NODE_ENV !== 'test') {
  process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });
}

module.exports = app;
