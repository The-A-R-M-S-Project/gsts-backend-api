const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    morgan = require('morgan'),
    config = require('config'),
    school = require('./routes/schools'),
    department = require('./routes/departments'),
    student = require('./routes/students'),
    program = require('./routes/programs'),
    lecturer = require('./routes/lecturers'),
    seed = require('./seed');
let port = process.env.PORT;

// -------------database--------------
let uri = process.env.DATABASEURL;
if (uri == null || uri === "") {
    uri = config.DBHost;
}

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

// ---------------ROUTES ---------------------
app.get("/", (req, res) => res.json({message: "Welcome to the Graduate Students Tracking System!"}));

// School Routes
app.route("/api/school")
    .get(school.getSchools)
    .post(school.postSchools);

app.route("/api/school/:id")
    .get(school.getSchool)
    .put(school.updateSchool)
    .delete(school.deleteSchool);

// Department Routes
app.route("/api/department")
    .get(department.getAllDepartments);

app.route("/api/school/:id/department")
    .get(department.getDepartmentsFromSchool);

app.route("/api/department/:id")
    .get(department.getDepartment);

// Student Routes
app.route("/api/student")
    .post(student.postStudent);

app.route("/api/student/:id")
    .get(student.getStudent)
    .put(student.updateStudent);

app.route("/api/program/:id/student")
    .get(student.getStudentsFromProgram);

// lecturer routes
app.route("/api/lecturer")
    .get(lecturer.getLecturers);

app.route("/api/lecturer/:id")
    .get(lecturer.getLecturer);

// Program Routes
app.route("/api/department/:id/program")
    .get(program.getPrograms);

app.route("/api/program/:id")
    .get(program.getProgram);

if (port == null || port === "") {
    port = 8080;
}

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

module.exports = app;