const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    morgan = require('morgan'),
    config = require('config'),
    port = 8080;


app.listen(port, ()=>{
    console.log(`Server is listening on port ${port}`);
});
