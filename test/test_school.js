//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
const School = require('../models/schools');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const should = chai.should();

chai.use(chaiHttp);

// Parent block
describe('Schools', () => {
    beforeEach((done) => { // Before each test, empty the database
        School.deleteMany({}, (err) => {
            done();
        });
    });

    describe('/GET school', () => {
        it('Should GET all the schools', (done) => {
            chai.request(server)
                .get('/school')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(0);
                    done();
                });
        });
    });

    describe('/POST school', () => {
        it('Should successfully add a school to the database', (done) => {
            let school = {name: "School of Engineering"};
            chai.request(server)
                .post('/school')
                .send(school)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('School successfully added!');
                    res.body.school.should.have.property('name');
                    done();
                });
        });

        it('Should NOT POST a school with no name', (done) => {
            let school = {};
            chai.request(server)
                .post('/school')
                .send(school)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('name');
                    res.body.errors.name.should.have.property('kind').eql('required');
                    done();
                });
        });
    });

});