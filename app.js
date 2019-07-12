const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const adminRouter = require('./routes/admin');
const schoolRouter = require('./routes/schools');
const programRouter = require('./routes/programs');
const studentRouter = require('./routes/students');
const lecturerRouter = require('./routes/lecturers');
const departmentRouter = require('./routes/departments');

const app = express();

// -------------logs------------------
if (process.env.NODE_ENV !== 'test') {
  const logger = process.env.NODE_ENV === 'development' ? 'dev' : 'combined';
  app.use(morgan(logger));
}

// -------------parsing App data--------------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json' }));

// ------------ ENABLE CORS FOR ALL ORIGINS -------
app.use(cors());

// ---------------ROUTES ---------------------
app.get('/', (req, res) =>
  res.json({ message: 'Welcome to the Graduate Students Tracking System!' })
);

app.use('/api/admin', adminRouter);
app.use('/api/school', schoolRouter);
app.use('/api/program', programRouter);
app.use('/api/student', studentRouter);
app.use('/api/lecturer', lecturerRouter);
app.use('/api/department', departmentRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
