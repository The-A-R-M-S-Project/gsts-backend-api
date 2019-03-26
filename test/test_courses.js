process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
const Department = require('../models/departments');
const Program = require('../models/programs');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const should = chai.should();

chai.use(chaiHttp);

describe('Programs', () => {
    beforeEach((done) => {
        Department.deleteMany({}, (err) => {
        });
        Program.deleteMany({}, (err) => {
        });
        done();
    });
    afterEach((done) => {
        Department.deleteMany({}, (err) => {
        });
        Program.deleteMany({}, (err) => {
        });
        done();
    });

    describe('/GET /department/:id/program ', () => {
        it('Should GET all programs for a given department id', (done) => {
            let department = new Department({name: "Architecture and Physical planning"});
            let program = new Program({name: "Master of Architecture"});
            department.save((err, department) => {
                program.save((err, program) => {
                    Department.findById(department._id, (err, foundDept) => {
                        foundDept.programs.push(program);
                        foundDept.save((err, dept) => {
                            chai.request(server)
                                .get(`/department/${dept._id}/program`)
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    res.body.should.be.a('array');
                                    res.body.length.should.not.be.eql(0);
                                    res.body[0].should.have.property('_id');
                                    res.body[0].should.have.property('name').eq('Master of Architecture');
                                    res.body[0].should.have.property('students');
                                    done();
                                });
                        });
                    })
                });
            });
        });
    });

    describe('/GET /program/:id ', () => {
        it('it should GET a program by the given id', (done) => {
            let program = new Program({name: "Master of Science in Civil Engineering"});
            program.save((err, program) => {
                chai.request(server)
                    .get(`/program/${program.id}`)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('name').eq('Master of Science in Civil Engineering');
                        res.body.should.have.property('students');
                        res.body.should.have.property('_id').eql(program.id);
                        done();
                    });
            });
        });
    });

});