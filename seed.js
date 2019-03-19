const mongoose = require("mongoose");
const School = require("./models/schools");
const Department = require("./models/departments");

const schools = [
    {name: "School of Engineering"},
    {name: "School of Built Environment"},
    {name: "School of Industrial and Fine Arts"},
];

const departmentList = [
    {
        school: schools[0].name,
        departs: [
            {name: "Civil and Environmental Engineering"},
            {name: "Electrical and Computer Engineering"},
            {name: "Mechanical Engineering",}
        ]
    },
    {
        school: schools[1].name,
        departs: [
            {name: "Architecture and Physical planning"},
            {name: "Construction Economics and Management"},
            {name: "Geomatics and Land Management",}
        ]
    },
    {
        school: schools[2].name,
        departs: [
            {name: "Fine Art"},
        ]
    },
];


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

async function clearDB() {
    try {
        await School.deleteMany({});
        console.log('Schools removed');
        await Department.deleteMany({});
        console.log('Departments removed');
    } catch (err) {
        console.log(err);
    }
}

async function seedDB() {
    try {
        await clearDB();
        await seedSchools();
        await seedDepartments();
    } catch (err) {
        console.log(err);
    }
}

module.exports = seedDB;