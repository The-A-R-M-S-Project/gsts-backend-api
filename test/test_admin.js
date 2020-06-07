process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const Admin = require('../models/admin');
const server = require('../server');
const generators = require('./generators');

chai.use(chaiHttp);
const client = chai.request.agent(server);

describe('Admin', () => {
  beforeEach(done => {
    Admin.deleteMany({}, () => {});
    done();
  });

  afterEach(done => {
    Admin.deleteMany({}, () => {});
    done();
  });

  describe('/POST /api/admin/', () => {
    it('should successfully add a admin to the database', async () => {
      await Admin.create(generators.defaultAdmin);
      const { email, password } = generators.defaultAdmin;

      const loginPromise = new Promise((resolve, response) => {
        client
          .post('/api/admin/login')
          .send({ email, password })
          .then(res => {
            resolve(res);
          });
      });

      const loginResponse = await loginPromise;
      const { token } = loginResponse.body;

      const requestPromise = new Promise((resolve, reject) => {
        client
          .post(`/api/admin`)
          .set('Authorization', `Bearer ${token}`)
          .send(generators.newAdmin)
          .then(res => {
            resolve(res);
          });
      });

      const res = await requestPromise;
      res.should.have.status(201);
      res.body.should.be.a('object');
      res.body.should.have.property('message').eql('admin successfully added!');
      res.body.admin.should.have.property('_id');
      res.body.admin.should.have.property('firstName').eq('Admin');
      res.body.admin.should.have.property('lastName').eq('GSTS');
      res.body.admin.should.have.property('email').eq('admin@cedat.mak.ac.ug');
      res.body.admin.should.have.property('phoneNumber').eq('+256702112201');
    });
  });

  describe('/POST /api/admin/login', () => {
    it('should successfully login with correct credentials', async () => {
      await Admin.create(generators.defaultAdmin);
      const { email, password } = generators.defaultAdmin;

      const loginPromise = new Promise((resolve, response) => {
        client
          .post('/api/admin/login')
          .send({ email, password })
          .then(res => {
            resolve(res);
          });
      });

      const res = await loginPromise;
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('status').eql('success');
      res.body.should.have.property('token');
    });

    it('should return Authentication error for incorrect credentials', async () => {
      await Admin.create(generators.defaultAdmin);
      const { email } = generators.defaultAdmin;
      const password = 'wrong password';

      const loginPromise = new Promise((resolve, response) => {
        client
          .post('/api/admin/login')
          .send({ email, password })
          .then(res => {
            resolve(res);
          });
      });

      const res = await loginPromise;
      res.should.have.status(401);
      res.body.should.be.a('object');
      res.body.should.have.property('status').eql('fail');
      res.body.should.have.property('message').eql('Incorrect email or password');
    });
  });
});
