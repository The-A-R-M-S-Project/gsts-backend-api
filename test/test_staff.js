process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const Student = require('../models/students');
const Department = require('../models/departments');
const Staff = require('../models/staff');
const server = require('../server');
const generators = require('./generators');

chai.use(chaiHttp);
const client = chai.request.agent(server);

describe('Staff', () => {
  beforeEach(done => {
    Staff.deleteMany({}, () => {});
    done();
  });

  afterEach(done => {
    Staff.deleteMany({}, () => {});
    done();
  });

  // TODO: Refactor this to pass with Auth of admin/principal/dean
  describe('/GET /api/staff', () => {
    it('Should GET all staff ', async () => {
      await Staff.create(generators.newDean);
      const { email, password } = generators.newDean;

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
          .get('/api/staff')
          .set('Authorization', `Bearer ${token}`)
          .then(res => {
            resolve(res);
          });
      });
      const res = await requestPromise;
      res.should.have.status(200);
      res.body.should.be.a('array');
      res.body.length.should.not.be.eql(0);
      res.body[0].should.have.property('_id');
      res.body[0].should.have.property('firstName').eq('Dean');
      res.body[0].should.have.property('lastName').eq('Mr/Mrs.');
      res.body[0].should.have.property('email').eq('dean@cedat.mak.ac.ug');
      res.body[0].should.have.property('phoneNumber').eq('+256772121856');
    });
  });

  describe('/GET /api/staff', () => {
    it('Should GET a particular Staff given their ID', async () => {
      const staffMember = await Staff.create(generators.newPrincipal);
      const { email, password } = generators.newPrincipal;

      const loginPromise = new Promise((resolve, response) => {
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
          .get(`/api/staff/${staffMember._id}`)
          .set('Authorization', `Bearer ${token}`)
          .then(res => {
            resolve(res);
          });
      });

      const res = await requestPromise;
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('_id').eq(`${staffMember._id}`);
      res.body.should.have.property('firstName').eq('Principal');
      res.body.should.have.property('lastName').eq('Mr/Mrs.');
      res.body.should.have.property('email').eq('principal@cedat.mak.ac.ug');
      res.body.should.have.property('phoneNumber').eq('+256772123456');
    });
  });
});
