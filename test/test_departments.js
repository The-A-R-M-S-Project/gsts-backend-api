process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const School = require('../models/schools');
const Department = require('../models/departments');
const Program = require('../models/programs');
const server = require('../server');

const client = chai.request.agent(server);
chai.use(chaiHttp);

describe('Departments', () => {
  beforeEach(done => {
    Program.deleteMany({}, () => {});
    Department.deleteMany({}, () => {});
    done();
  });
  afterEach(done => {
    Program.deleteMany({}, () => {});
    Department.deleteMany({}, () => {});
    done();
  });

  describe('/GET /api/department/', () => {
    it('should GET all departments in database', async () => {
      const requestPromise = new Promise((resolve, reject) => {
        client.get('/api/department').then(res => {
          resolve(res);
        });
      });
      const res = await requestPromise;
      res.should.have.status(200);
      res.body.should.be.a('array');
      res.body.length.should.be.eql(0);
    });
  });

  describe('/GET /api/department/:id/program ', () => {
    it('Should GET all programs for a given department id', async () => {
      const department = await Department.create({
        name: 'Architecture and Physical planning'
      });
      const program = await Program.create({ name: 'Master of Architecture' });
      program.department = department._id;
      await program.save();
      const requestPromise = new Promise((resolve, reject) => {
        client.get(`/api/department/${department._id}/program`).then(res => {
          resolve(res);
        });
      });
      const res = await requestPromise;
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.programs.should.be.a('array');
      res.body.programs.length.should.not.be.eql(0);
      res.body.programs[0].should.have.property('_id');
      res.body.programs[0].should.have.property('name').eq('Master of Architecture');
    });
  });

  describe('/GET /api/department/:id ', () => {
    it('it should GET a department by the given id', async () => {
      const department = await Department.create({
        name: 'Electrical and Computer Engineering'
      });
      const requestPromise = new Promise((resolve, reject) => {
        client.get(`/api/department/${department._id}`).then(res => {
          resolve(res);
        });
      });
      const res = await requestPromise;
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('name').eq('Electrical and Computer Engineering');
      res.body.should.have.property('_id').eql(department.id);
    });
  });
});
