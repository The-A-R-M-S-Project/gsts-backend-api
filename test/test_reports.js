process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');

const Report = require('../models/reports');
const Student = require('../models/students');
const Staff = require('../models/staff');
const server = require('../server');
const generators = require('./generators');

chai.use(chaiHttp);
const client = chai.request.agent(server);

describe('Reports', () => {
  beforeEach(done => {
    Report.deleteMany({}, () => {});
    Student.deleteMany({}, () => {});
    Staff.deleteMany({}, () => {});
    done();
  });
  afterEach(done => {
    Report.deleteMany({}, () => {});
    Student.deleteMany({}, () => {});
    Staff.deleteMany({}, () => {});
    done();
  });

  describe('/GET /api/report', () => {
    it('Only Elevated staff should get all the reports', async () => {
      await Staff.create(generators.newPrincipal);
      const { email, password } = generators.newPrincipal;

      const loginPromise = new Promise((resolve, reject) => {
        client
          .post('/api/staff/login')
          .send({ email, password })
          .then(res => {
            resolve(res);
          });
      });

      const loginResponse = await loginPromise;
      const { token } = loginResponse.body;

      const requestPromise = new Promise((resolve, reject) => {
        client
          .get('/api/report')
          .set('Authorization', `Bearer ${token}`)
          .then(res => {
            resolve(res);
          });
      });
      const res = await requestPromise;
      res.should.have.status(200);
      res.body.should.be.a('array');
      res.body.length.should.eql(0);
    });
  });

  describe('/api/student/report', () => {
    it('only student should be able to add a report', async () => {
      const student = await Student.create(generators.newStudent);
      const { email, password } = generators.newStudent;

      const loginPromise = new Promise((resolve, reject) => {
        client
          .post(`/api/student/login`)
          .send({
            email,
            password
          })
          .then(res => {
            resolve(res);
          });
      });
      const loginResponse = await loginPromise;
      const { token } = loginResponse.body;

      const requestPromise = new Promise((resolve, reject) => {
        client
          .post(`/api/student/report`)
          .set('Authorization', `Bearer ${token}`)
          .send({ reportUrl: 'New Report Over here' })
          .then(res => {
            resolve(res);
          });
      });

      const res = await requestPromise;
      res.should.have.status(201);
      res.body.should.be.a('object');
      res.body.report.should.have.property('reportStatus').eq('notSubmitted');
      res.body.report.should.have.property('reportUrl').eq('New Report Over here');
      res.body.report.should.have.property('student').eq(`${student._id}`);
    });
  });
});