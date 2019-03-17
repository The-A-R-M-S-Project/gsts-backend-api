const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    morgan = require('morgan'),
    config = require('config'),
    school = require('./routes/schools'),
    port = 8080;

// -------------database--------------
mongoose.connect(config.DBHost, {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// -------------logs------------------
if (config.util.getEnv('NODE_ENV') !== 'test') {
    app.use(morgan('combined'));
}

// -------------parsing App data--------------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type: 'application/json'}));

// ---------------ROUTES ---------------------
app.get("/", (req, res) => res.json({message: "Welcome to our the Graduate Students Tracking System!"}));

app.route("/school")
    .get(school.getSchools);


app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

module.exports = app;