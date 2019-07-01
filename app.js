const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    morgan = require('morgan'),
    cors = require('cors'),
    config = require('config'),
    lecturer = require('./routes/lecturers'),
    seed = require('./seed');
let port = process.env.PORT || 8080;

// -------------database--------------
let uri = process.env.DATABASEURL || config.DBHost;

mongoose.connect(uri, {useNewUrlParser: true});
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

// ------------ ENABLE CORS FOR ALL ORIGINS -------
app.use(cors());

// ---------------ROUTES ---------------------
app.get("/", (req, res) => res.json({message: "Welcome to the Graduate Students Tracking System!"}));
const router = express.Router();
const routes = require('./routes/app.js');
app.use('/api', routes(router));


// lecturer routes
app.route("/api/lecturer")
    .get(lecturer.getLecturers);

app.route("/api/lecturer/:id")
    .get(lecturer.getLecturer);

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

module.exports = app;