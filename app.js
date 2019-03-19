const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    morgan = require('morgan'),
    config = require('config'),
    school = require('./routes/schools'),
    department = require('./routes/departments'),
    student = require('./routes/students'),
    seed = require('./seed'),
    port = 8080;

// -------------database--------------
mongoose.connect(config.DBHost, {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
// seed();

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
    .get(school.getSchools)
    .post(school.postSchools);

app.route("/school/:id")
    .get(school.getSchool)
    .put(school.updateSchool)
    .delete(school.deleteSchool);

app.route("/school/:id/department")
    .get(department.getDepartments);

app.route("/school/:schoolID/department/:id")
    .get(department.getDepartment);

app.route("/student/:id")
    .get(student.getStudent);

app.route("/course/:id/student")
    .get(student.getStudentsFromDepartment);

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

module.exports = app;