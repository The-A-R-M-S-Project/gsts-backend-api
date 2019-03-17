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
describe('Books', () => {
    beforeEach((done) => { // Before each test, empty the database
        School.deleteMany({}, (err) => {
            done();
        });
    });

    /*
    * /GET route test
    */
    describe('/GET school', () => {
        it('it should GET all the schools', (done) => {
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

});