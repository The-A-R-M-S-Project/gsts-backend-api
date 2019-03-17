const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    morgan = require('morgan'),
    config = require('config'),
    port = 8080;

// -------------database--------------
// db connection
mongoose.connect(config.DBHost, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


app.listen(port, ()=>{
    console.log(`Server is listening on port ${port}`);
});
