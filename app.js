const express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    morgan = require("morgan"),
    cors = require("cors");

const adminRouter = require('./routes/admin');
const schoolRouter = require('./routes/schools');
const programRouter = require('./routes/programs');
const studentRouter = require('./routes/students');
const lecturerRouter = require('./routes/lecturers');
const departmentRouter = require('./routes/departments');

// -------------logs------------------
if (process.env.NODE_ENV !== "test") {
    let logger = process.env.NODE_ENV === "development" ? "dev" : "combined";
    app.use(morgan(logger));
}

// -------------parsing App data--------------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type: "application/json"}));

// ------------ ENABLE CORS FOR ALL ORIGINS -------
app.use(cors());

// ---------------ROUTES ---------------------
app.get("/", (req, res) =>
    res.json({message: "Welcome to the Graduate Students Tracking System!"})
);

app.use("/api/admin", adminRouter);
app.use("/api/school", schoolRouter);
app.use("/api/program", programRouter);
app.use("/api/student", studentRouter);
app.use("/api/lecturer", lecturerRouter);
app.use("/api/department", departmentRouter);

module.exports = app;