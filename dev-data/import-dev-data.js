const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Schools = require('../models/schools');
const Departments = require('../models/departments');
const Programs = require('../models/programs');
const Students = require('../models/students');
const Lecturers = require('../models/lecturers');
const Admin = require('../models/admin');

dotenv.config();

// const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
// const DB = process.env.DATABASE_LOCAL;
const DB = 'mongodb://localhost:27017/test_gsts';

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
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
let lecturers = getDataPromise(`${__dirname}/lecturers.json`, 'utf-8');
let admin = getDataPromise(`${__dirname}/admins.json`, 'utf-8');

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
  [schools, departments, programs, students, lecturers, admin] = await Promise.all([
    schools,
    departments,
    programs,
    students,
    lecturers,
    admin
  ]);

  await importDataFromModel(Schools, JSON.parse(schools));
  await importDataFromModel(Departments, JSON.parse(departments));
  await importDataFromModel(Programs, JSON.parse(programs));
  await importDataFromModel(Students, JSON.parse(students));
  await importDataFromModel(Lecturers, JSON.parse(lecturers));
  await importDataFromModel(Admin, JSON.parse(admin));
  console.log('Data successfully imported!');
  process.exit();
};

// DELETE DATA FROM DB
const deleteData = async () => {
  await deleteDataFromModel(Schools);
  await deleteDataFromModel(Departments);
  await deleteDataFromModel(Programs);
  await deleteDataFromModel(Students);
  await deleteDataFromModel(Lecturers);
  console.log('Data successfully deleted!');
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
