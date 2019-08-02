process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const Department = require('../models/departments');
const Program = require('../models/programs');
const server = require('../server');

const client = chai.request.agent(server);
chai.use(chaiHttp);

describe('Programs', () => {
  beforeEach(done => {
    Department.deleteMany({}, () => {});
    Program.deleteMany({}, () => {});
    done();
  });
  afterEach(done => {
    Department.deleteMany({}, () => {});
    Program.deleteMany({}, () => {});
    done();
  });

  describe('/GET /api/program/:id ', async () => {
    it('it should GET a program by the given id', async () => {
      const program = await Program.create({
        name: 'Master of Science in Civil Engineering'
      });
      const requestPromise = new Promise((resolve, reject) => {
        client.get(`/api/program/${program._id}`).then(res => {
          resolve(res);
        });
      });
      const res = await requestPromise;
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('name').eq('Master of Science in Civil Engineering');
      res.body.should.have.property('_id').eql(program.id);
    });
  });

  describe('/GET /api/program/ ', async () => {
    it('it should GET all programs', async () => {
      const program = await Program.create({
        name: 'Master of Science in Civil Engineering'
      });
      const requestPromise = new Promise((resolve, reject) => {
        client.get(`/api/program`).then(res => {
          resolve(res);
        });
      });
      const res = await requestPromise;
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.programs[0].should.have
        .property('name')
        .eq('Master of Science in Civil Engineering');
      res.body.programs[0].should.have.property('_id').eql(program.id);
    });
  });
});
