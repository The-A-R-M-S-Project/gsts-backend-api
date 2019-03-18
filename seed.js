const mongoose = require("mongoose");
const School = require("./models/schools");
const Department = require("./models/departments");

const seeds = [
    {
        name: "School of Engineering",
    },
];

const departments = [
    {
        name: "Civil and Environmental Engineering",
    },
    {
        name:
            "Electrical and Computer Engineering",
    },
    {
        name: "Mechanical Engineering",
    }
];

// todo: Find a way of populating the db with all bits of data in one go
async function seedDB() {
    try {
        await School.remove({});
        console.log('Schools removed');
        await Department.remove({});
        console.log('Departments removed');

        for (const seed of seeds) {
            let school = await School.create(seed);
            console.log('School created');
            let department = await Department.create(
                departments[0]
            );
            console.log('Department created');
            school.departments.push(department);
            school.save();
            console.log('Department added to school');
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports = seedDB;