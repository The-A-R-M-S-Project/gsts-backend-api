const mongoose = require("mongoose");
const School = require("./models/schools");
const Department = require("./models/departments");
const Program = require('./models/programs');
const Student = require('./models/students');
const Lecturer = require('./models/lecturers');
const data = require('./seederData');

let schools = data.schools;
let departmentList = data.departments;
let studentList = data.students;
let programList = data.programs;

async function seedSchools() {
    try {
        for (const seed of schools) {
            let school = await School.create(seed);
            console.log('School created');
        }
    } catch (err) {
        console.log(err);
    }
}

async function seedDepartments() {
    try {
        for (const seed of schools) {
            let currentSchool = seed.name;
            let school = await School.findOne({name: currentSchool});
            let depts;
            for (const seed of departmentList) {
                if (seed.school === currentSchool) {
                    depts = seed.departs;
                    break;
                }
            }
            for (const dept of depts) {
                let deptCreated = await Department.create(dept);
                console.log('Department created');
                school.departments.push(deptCreated);
                await school.save();
                console.log('--> Added to school!');
            }
        }
    } catch (err) {
        console.log(err);
    }
}

async function seedPrograms() {
    try {
        for (const department of programList) {
            let currentDepartment = await Department.findOne({name: department.depart});
            for (const program of department.programs) {
                let newProgram = await Program.create(program);
                currentDepartment.programs.push(newProgram);
                currentDepartment.save();
                console.log('--> Added Program to Department');
            }
        }
    } catch (err) {
        console.log(err);
    }
}

async function seedStudents() {
    try {
        let counter = 0;
        for (const program of programList) {
            let currentProgram = await Program.findOne({name: program.programs[0].name});
            let newStudent = await Student.create(studentList[counter]);
            newStudent.program = currentProgram;
            await newStudent.save();
            currentProgram.students.push(newStudent);
            await currentProgram.save();
            console.log('--> Added Student to Program');
            counter++;
        }
    } catch (err) {
        console.log(err);
    }
}

async function clearDB() {
    try {
        await School.deleteMany({});
        await Department.deleteMany({});
        await Lecturer.deleteMany({});
        await Program.deleteMany({});
        await Student.deleteMany({});
        console.log('Entire Database Cleaned!');
    } catch (err) {
        console.log(err);
    }
}

async function seedDB() {
    try {
        await clearDB();
        await seedSchools();
        await seedDepartments();
        await seedPrograms();
        await seedStudents();
    } catch (err) {
        console.log(err);
    }
}

module.exports = seedDB;