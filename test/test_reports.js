process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');

const Report = require('../models/reports');
const Student = require('../models/students');
const server = require('../server');
const generators = require('./generators');

chai.use(chaiHttp);
const client = chai.request.agent(server);

describe.only('Reports', () => {
  beforeEach(done => {
    Report.deleteMany({}, () => {});
    Student.deleteMany({}, () => {});
    done();
  });
  afterEach(done => {
    Report.deleteMany({}, () => {});
    Student.deleteMany({}, () => {});
    done();
  });

  describe('/GET /api/report', () => {
    it('Should get all the reports', async () => {
      const student = await Student.create(generators.newStudent);
      const report = new Report(generators.newReport);
      report.student = student._id;

      await report.save();

      const requestPromise = new Promise((resolve, reject) => {
        client.get('/api/report').then(res => {
          resolve(res);
        });
      });
      const res = await requestPromise;
      res.should.have.status(200);
      res.body.should.be.a('array');
      res.body.should.not.be.eql(0);
      res.body[0].should.have.property('reportStatus');
      res.body[0].should.have.property('reportStatus');
      res.body[0].should.have.property('student');
    });

    it('Should be able to add a report', async () => {
      const student = new Report(generators.newStudent);
      const report = new Report(generators.newReport);
      report.student = student._id;

      const requestPromise = new Promise((resolve, reject) => {
        client
          .post('/api/report')
          .send(report)
          .then(res => {
            resolve(res);
          });
      });
      const res = await requestPromise;
      res.should.have.status(201);
      res.body.should.be.an('object');
      res.body.should.have.property('message');
      res.body.should.have.property('report');
    });
  });
});
