const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const Schools = require('../models/schools');
const Departments = require('../models/departments');
const Programs = require('../models/programs');
const Students = require('../models/students');
const Staffs = require('../models/staff');
const Admin = require('../models/admin');
const Report = require('../models/reports');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
const DB = process.env.DATABASE_LOCAL;
// const DB = 'mongodb://localhost:27017/test_gsts';

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!'));

function getDataPromise(fileName, type) {
  return new Promise(function(resolve, reject) {
    fs.readFile(fileName, type, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}

let schools = getDataPromise(`${__dirname}/schools.json`, 'utf-8');
let departments = getDataPromise(`${__dirname}/departments.json`, 'utf-8');
let programs = getDataPromise(`${__dirname}/programs.json`, 'utf-8');
let students = getDataPromise(`${__dirname}/students.json`, 'utf-8');
let staff = getDataPromise(`${__dirname}/staff.json`, 'utf-8');
let admin = getDataPromise(`${__dirname}/admins.json`, 'utf-8');
let reports = getDataPromise(`${__dirname}/reports.json`, 'utf-8');

const importDataFromModel = async (Model, data) => {
  try {
    await Model.create(data);
  } catch (err) {
    console.log(err);
  }
};
const deleteDataFromModel = async Model => {
  try {
    await Model.deleteMany();
  } catch (err) {
    console.log(err);
  }
};

// IMPORT DATA INTO DB
const importData = async () => {
  [schools, departments, programs, students, staff, admin, reports] = await Promise.all([
    schools,
    departments,
    programs,
    students,
    staff,
    admin,
    reports
  ]);

  await importDataFromModel(Schools, JSON.parse(schools));
  await importDataFromModel(Departments, JSON.parse(departments));
  await importDataFromModel(Programs, JSON.parse(programs));
  await importDataFromModel(Students, JSON.parse(students));
  await importDataFromModel(Staffs, JSON.parse(staff));
  await importDataFromModel(Admin, JSON.parse(admin));
  await importDataFromModel(Report, JSON.parse(reports));
  console.log('Data successfully imported!');
  process.exit();
};

// DELETE DATA FROM DB
const deleteData = async () => {
  await deleteDataFromModel(Schools);
  await deleteDataFromModel(Departments);
  await deleteDataFromModel(Programs);
  await deleteDataFromModel(Students);
  await deleteDataFromModel(Staffs);
  await deleteDataFromModel(Admin);
  await deleteDataFromModel(Report);
  console.log('Data successfully deleted!');
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
