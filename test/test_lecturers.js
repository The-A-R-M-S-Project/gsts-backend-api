process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
const Student = require('../models/students');
const Department = require("../models/departments");
const Lecturer = require('../models/lecturers');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();

chai.use(chaiHttp);

// Parent block
describe('Lecturers', () => {
    beforeEach((done) => {
        Lecturer.deleteMany({}, (err) => {
        });
        Department.deleteMany({}, (err) => {
        });
        Student.deleteMany({}, (err) => {
        });
        done();
    });

    afterEach((done) => {
        Lecturer.deleteMany({}, (err) => {
        });
        Department.deleteMany({}, (err) => {
        });
        Student.deleteMany({}, (err) => {
        });
        done();
    });

    describe('/GET /api/lecturer', () => {
        it('Should GET all lecturers ', (done) => {
            let lecturer = new Lecturer({
                    bioData: {
                        name: "Test Lecturer",
                        email: "admin@cedat.mak.ac.ug",
                        phoneNumber: "12345",
                    },
                    isAdministrator: false
                }
            );
            lecturer.save((err, lecturer) => {
                Lecturer.find((err, lect) => {
                    chai.request(server)
                        .get(`/api/lecturer`)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('array');
                            res.body.length.should.not.be.eql(0);
                            res.body[0].should.have.property('_id');
                            res.body[0].bioData.should.have.property('name').eq('Test Lecturer');
                            res.body[0].bioData.should.have.property('email').eq('admin@cedat.mak.ac.ug');
                            res.body[0].bioData.should.have.property('phoneNumber').eq('12345');
                            done();
                        });
                })
            });
        });

    });

    describe('/GET /api/lecturer', () => {
        it('Should GET a particular Lecturer given their ID', (done) => {
            let lecturer = new Lecturer({
                    bioData: {
                        name: "Test Lecturer",
                        email: "admin@cedat.mak.ac.ug",
                        phoneNumber: "12345",
                    },
                    isAdministrator: true
                },
            );
            lecturer.save((err, lecturer) => {
                chai.request(server)
                    .get(`/api/lecturer/${lecturer._id}/`)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('_id').eq(`${lecturer._id}`);
                        res.body.bioData.should.have.property('name').eq('Test Lecturer');
                        res.body.bioData.should.have.property('email').eq('admin@cedat.mak.ac.ug');
                        res.body.bioData.should.have.property('phoneNumber').eq('12345');
                        res.body.should.have.property('students');
                        done();
                    });
            })
        });
    });

});