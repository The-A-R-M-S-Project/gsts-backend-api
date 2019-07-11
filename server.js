const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({path: './.env'});
const app = require('./app');

// -------------database--------------
let DB = process.env.NODE_ENV === 'production' ? process.env.DATABASE : process.env.DATABASE_LOCAL;
if (process.env.NODE_ENV === 'test')
    DB = process.env.DATABASE_TEST;

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

module.exports = app;
