const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    cors = require('cors');

// -------------logs------------------
if (process.env.NODE_ENV !== 'test') {
    let logger = process.env.NODE_ENV === 'development' ? 'dev' : 'combined';
    app.use(morgan(logger));
}

// -------------parsing App data--------------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type: 'application/json'}));

// ------------ ENABLE CORS FOR ALL ORIGINS -------
app.use(cors());

// ---------------ROUTES ---------------------
app.get("/", (req, res) => res.json({message: "Welcome to the Graduate Students Tracking System!"}));
const router = express.Router();
const routes = require('./routes/app.js');
app.use('/api', routes(router));


module.exports = app;