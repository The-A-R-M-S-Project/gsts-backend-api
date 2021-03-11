process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');

const Report = require('../models/reports');
const Student = require('../models/students');
const { Staff } = require('../models/staff');
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

  describe('/api/report', () => {
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
          .post(`/api/report`)
          .set('Authorization', `Bearer ${token}`)
          .send({ title: 'New Report Over here' })
          .then(res => {
            resolve(res);
          });
      });

      const res = await requestPromise;
      res.should.have.status(201);
      res.body.should.be.a('object');
      res.body.report.should.have.property('status').eq('notSubmitted');
      res.body.report.should.have.property('title').eq('New Report Over here');
      res.body.report.should.have.property('student').eq(`${student.id}`);
    });

    it('Should allow student to only edit specific fields in report', async () => {
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

      const reportPromise = new Promise((resolve, reject) => {
        client
          .post(`/api/report`)
          .set('Authorization', `Bearer ${token}`)
          .send({ title: 'New Report Over here' })
          .then(res => {
            resolve(res);
          });
      });

      await reportPromise;

      const requestPromise = new Promise((resolve, reject) => {
        client
          .patch(`/api/report/student`)
          .set('Authorization', `Bearer ${token}`)
          .send({ title: 'Edited Report Over here', status: 'submitted' })
          .then(res => {
            resolve(res);
          });
      });

      const res = await requestPromise;
      // console.log(res.body.report);
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.report.should.have.property('status').eq('notSubmitted');
      res.body.report.should.have.property('title').eq('Edited Report Over here');
      res.body.report.student.should.have.property('_id').eq(`${student.id}`);
    });

    it('should not allow student to edit already submitted report unless it is pending revision', async () => {
      await Report.create(generators.newReport);
      await Student.create(generators.newStudentWithReport);
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
          .patch(`/api/report/student`)
          .set('Authorization', `Bearer ${token}`)
          .send({ title: 'Edited Report Over here' })
          .then(res => {
            resolve(res);
          });
      });

      const res = await requestPromise;
      res.should.have.status(400);
      res.body.should.be.a('object');
      res.body.should.have.property('status').eq('fail');
      res.body.should.have.property('message').eq('Cannot edit already submitted report');
    });
  });
});
