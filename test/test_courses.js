process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
const Department = require('../models/departments');
const Course = require('../models/courses');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const should = chai.should();

chai.use(chaiHttp);

describe('Courses', () => {
    beforeEach((done) => {
        Department.deleteMany({}, (err) => {
        });
        Course.deleteMany({}, (err) => {
        });
        done();
    });

    describe('/GET /department/:id/course ', () => {
        it('Should GET all courses for a given department id', (done) => {
            let department = new Department({name: "Architecture and Physical planning"});
            let course = new Course({name: "Master of Architecture"});
            department.save((err, department) => {
                course.save((err, course) => {
                    Department.findById(department._id, (err, foundDept) => {
                        foundDept.courses.push(course);
                        foundDept.save((err, dept) => {
                            chai.request(server)
                                .get(`/department/${dept._id}/course`)
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

    describe('/GET /course/:id ', () => {
        it('it should GET a course by the given id', (done) => {
            let course = new Course({name: "Master of Science in Civil Engineering"});
            course.save((err, course) => {
                chai.request(server)
                    .get(`/course/${course.id}`)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('name').eq('Master of Science in Civil Engineering');
                        res.body.should.have.property('students');
                        res.body.should.have.property('_id').eql(course.id);
                        done();
                    });
            });
        });
    });

});