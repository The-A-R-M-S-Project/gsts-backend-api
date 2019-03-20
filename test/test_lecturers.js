process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
const Student = require('../models/students');
const Department = require("../models/departments");
const Lecturer = require('../models/lecturers');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
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

    describe('/GET /lecturer', () => {
        it.only('Should GET all lecturers ', (done) => {
            let lecturer = new Lecturer({
                    bioData: {
                        name: "Test Lecturer",
                        netID: "admin@cedat.mak.ac.ug",
                        phoneNumber: "12345",
                    },
                    isAdministrator: false
                }
            );
            lecturer.save((err, lecturer) => {
                Lecturer.find((err, lect) => {
                    chai.request(server)
                        .get(`/lecturer`)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('array');
                            res.body.length.should.not.be.eql(0);
                            res.body[0].should.have.property('_id');
                            res.body[0].bioData.should.have.property('name').eq('Test Lecturer');
                            res.body[0].bioData.should.have.property('netID').eq('admin@cedat.mak.ac.ug');
                            res.body[0].bioData.should.have.property('phoneNumber').eq('12345');
                            done();
                        });
                })
            });
        });

    });

});