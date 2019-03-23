process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
const Student = require('../models/students');
const Department = require("../models/departments");
const Course = require('../models/courses');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const should = chai.should();

chai.use(chaiHttp);

// Parent block
describe('Students', () => {
    beforeEach((done) => {
        Student.deleteMany({}, (err) => {
        });
        Course.deleteMany({}, (err) => {
        });
        done();
    });
    afterEach((done) => {
        Student.deleteMany({}, (err) => {
        });
        Course.deleteMany({}, (err) => {
        });
        done();
    });

    describe('/GET /course/:id/student', () => {
        it('Should GET all the students in a particular course', (done) => {
            let course = new Course({name: "Master of Architecture"});
            let student = new Student({
                    bioData: {
                        name: "Test Student",
                        netID: "test@cedat.mak.ac.ug",
                        phoneNumber: "12345",
                    },
                }
            );
            course.save((err, savedCourse) => {
                student.save((err, savedStudent) => {
                    Student.findById(savedStudent._id, (err, foundStudent) => {
                        foundStudent.course = savedCourse;
                        foundStudent.save((err, std) => {
                            savedCourse.students.push(std);
                            savedCourse.save((err, crs) => {
                                chai.request(server)
                                    .get(`/course/${crs._id}/student`)
                                    .end((err, res) => {
                                        res.should.have.status(200);
                                        res.body.should.be.a('array');
                                        res.body.length.should.not.be.eql(0);
                                        res.body[0].should.have.property('_id');
                                        res.body[0].bioData.should.have.property('name').eq('Test Student');
                                        res.body[0].bioData.should.have.property('netID').eq('test@cedat.mak.ac.ug');
                                        res.body[0].bioData.should.have.property('phoneNumber').eq('12345');
                                        res.body[0].should.have.property('course').eq(`${crs._id}`);
                                        done();
                                    });
                            })
                        })
                    })
                })
            });
        });
    });

    describe('/GET /student/:id', () => {
        it('should GET a particular student given their ID', (done) => {
            let student = new Student({
                    bioData: {
                        name: "Test Student",
                        netID: "test@cedat.mak.ac.ug",
                        phoneNumber: "12345",
                    },
                }
            );
            // todo: Refactor this to use a async/await and eliminate occasional callback hell!
            // todo: Might want to refactor other tests too with chai-http promises
            student.save((err, savedStudent) => {
                chai.request(server)
                    .get(`/student/${student._id}/`)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('_id').eq(`${student._id}`);
                        res.body.bioData.should.have.property('name').eq('Test Student');
                        res.body.bioData.should.have.property('netID').eq('test@cedat.mak.ac.ug');
                        res.body.bioData.should.have.property('phoneNumber').eq('12345');
                        done();
                    });
            })
        });
    });

    describe('/POST /student/', () => {
        it('should successfully add a student to the database', (done) => {
            let student = new Student({
                    bioData: {
                        name: "Test Student",
                        netID: "test@cedat.mak.ac.ug",
                        phoneNumber: "12345",
                    },
                }
            );
            chai.request(server)
                .post(`/student`)
                .send(student)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Student successfully added!');
                    res.body.student.should.have.property('_id');
                    res.body.student.bioData.should.have.property('name').eq('Test Student');
                    res.body.student.bioData.should.have.property('netID').eq('test@cedat.mak.ac.ug');
                    res.body.student.bioData.should.have.property('phoneNumber').eq('12345');
                    done();
                });
        });
    });

    describe('/PUT /student/:id', () => {
        it('should update student information given the id', (done) => {
            let student = new Student({
                    bioData: {
                        name: "Test Student",
                        netID: "test@cedat.mak.ac.ug",
                        phoneNumber: "12345",
                    },
                }
            );
            student.save((err, student) => {
                chai.request(server)
                    .put(`/student/${student._id}`)
                    .send({
                        bioData: {
                            name: "Test Student",
                            netID: "test@cedat.mak.ac.ug",
                            phoneNumber: "54321",
                        },
                    })
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('message').eql('Student information updated!');
                        res.body.student.bioData.should.have.property('phoneNumber').eql('54321');
                        done();
                    });
            });
        });
    });
});