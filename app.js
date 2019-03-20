const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    morgan = require('morgan'),
    config = require('config'),
    school = require('./routes/schools'),
    department = require('./routes/departments'),
    student = require('./routes/students'),
    course = require('./routes/courses'),
    lecturer = require('./routes/lecturers'),
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

// School Routes
app.route("/school")
    .get(school.getSchools)
    .post(school.postSchools);

app.route("/school/:id")
    .get(school.getSchool)
    .put(school.updateSchool)
    .delete(school.deleteSchool);

// Department Routes
app.route("/school/:id/department")
    .get(department.getDepartments);

app.route("/school/:schoolID/department/:id")
    .get(department.getDepartment);

// Student Routes
app.route("/student")
    .post(student.postStudent);

app.route("/student/:id")
    .get(student.getStudent)
    .put(student.updateStudent);

app.route("/course/:id/student")
    .get(student.getStudentsFromCourse);

// lecturer routes
app.route('/lecturer')
    .get(lecturer.getLecturers);

app.route('/lecturer/:id')
    .get(lecturer.getLecturer);

// Course Routes
app.route("/department/:id/course")
    .get(course.getCourses);

app.route("/course/:id")
    .get(course.getCourse);

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

module.exports = app;