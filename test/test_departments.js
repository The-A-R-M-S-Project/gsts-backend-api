process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
const School = require('../models/schools');
const Department = require('../models/departments');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const should = chai.should();

chai.use(chaiHttp);

describe('Departments', () => {
    beforeEach((done) => {
        School.deleteMany({}, (err) => {
        });
        Department.deleteMany({}, (err) => {
        });
        done();
    });

    describe('/GET/:id/department ', () => {
        it('Should GET all departments for a given school id', (done) => {
            let school = new School({name: "School of Built Environment"});
            let department = new Department({name: "Architecture and Physical planning"});
            school.save((err, savedSchool) => {
                department.save((err, department) => {
                    School.findById(savedSchool._id, (err, foundSchool) => {
                        foundSchool.departments.push(department);
                        foundSchool.save((err, school) => {
                            chai.request(server)
                                .get(`/school/${school._id}/department`)
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    res.body.should.be.a('array');
                                    res.body.length.should.not.be.eql(0);
                                    res.body[0].should.have.property('_id');
                                    res.body[0].should.have.property('name').eq('Architecture and Physical planning');
                                    res.body[0].should.have.property('courses');
                                    done();
                                });
                        });
                    })
                });
            });
        });
    });

    describe('/GET/:schoolID/department/:id ', () => {
        it.only('it should GET a department by the given id', (done) => {
            let school = new School({name: "School of Engineering"});
            let department = new Department({name: "Electrical and Computer Engineering"});
            school.save((err, savedSchool) => {
                department.save((err, department) => {
                    School.findById(savedSchool._id, (err, foundSchool) => {
                        foundSchool.departments.push(department);
                        foundSchool.save((err, school) => {
                            chai.request(server)
                                .get(`/school/${school._id}/department/${department.id}`)
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    res.body.should.be.a('object');
                                    res.body.should.have.property('name').eq('Electrical and Computer Engineering');
                                    res.body.should.have.property('courses');
                                    res.body.should.have.property('_id').eql(department.id);
                                    done();
                                });
                        });
                    })
                });
            });
        });
    });

});