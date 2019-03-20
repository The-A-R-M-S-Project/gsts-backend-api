const mongoose = require("mongoose");
const School = require("./models/schools");
const Department = require("./models/departments");
const Course = require('./models/courses');
const Student = require('./models/students');
const Lecturer = require('./models/lecturers');
const data = require('./seederData');

let schools = data.schools;
let departmentList = data.departments;
let studentList = data.students;
let courseList = data.courses;

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

async function seedCourses() {
    try {
        for (const department of courseList) {
            let currentDepartment = await Department.findOne({name: department.depart});
            for (const course of department.courses) {
                let newCourse = await Course.create(course);
                currentDepartment.courses.push(newCourse);
                currentDepartment.save();
                console.log('--> Added Course to Department');
            }
        }
    } catch (err) {
        console.log(err);
    }
}

async function seedStudents() {
    try {
        let counter = 0;
        for (const course of courseList) {
            let currentCourse = await Course.findOne({name: course.courses[0].name});
            let newStudent = await Student.create(studentList[counter]);
            newStudent.course = currentCourse;
            await newStudent.save();
            currentCourse.students.push(newStudent);
            await currentCourse.save();
            console.log('--> Added Student to Course');
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
        await Course.deleteMany({});
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
        await seedCourses();
        await seedStudents();
    } catch (err) {
        console.log(err);
    }
}

module.exports = seedDB;