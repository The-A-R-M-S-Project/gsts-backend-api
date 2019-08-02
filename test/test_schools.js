process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const School = require('../models/schools');
const Department = require('../models/departments');
const server = require('../server');

let client = chai.request.agent(server);
chai.use(chaiHttp);

describe('Schools', () => {
  beforeEach(done => {
    School.deleteMany({}, () => {});
    Department.deleteMany({}, () => {});
    done();
  });
  afterEach(done => {
    School.deleteMany({}, () => {});
    Department.deleteMany({}, () => {});
    done();
  });

  describe('/GET /api/school', () => {
    it('Should GET all the schools', async () => {
      const requestPromise = new Promise((resolve, reject) => {
        client.get('/api/school').then(res => {
          resolve(res);
        });
      });
      const res = await requestPromise;
      res.should.have.status(200);
      res.body.should.be.a('array');
      res.body.length.should.be.eql(0);
    });
  });

  describe('/GET /api/school/:id/department ', async () => {
    it('Should GET all departments for a given school id', async () => {
      const school = await School.create({ name: 'School of Built Environment' });
      const department = await Department.create({
        name: 'Architecture and Physical planning'
      });
      department.school = school._id;
      await department.save();

      const requestPromise = new Promise((resolve, reject) => {
        client.get(`/api/school/${school._id}/department`).then(res => {
          resolve(res);
        });
      });
      const res = await requestPromise;
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.departments.should.be.a('array');
      res.body.departments.length.should.not.be.eql(0);
      res.body.departments[0].should.have
        .property('name')
        .eq('Architecture and Physical planning');
    });
  });

  describe('/POST /api/school', () => {
    it('Should successfully add a school to the database', async () => {
      const school = { name: 'School of Engineering' };
      const requestPromise = new Promise((resolve, reject) => {
        client
          .post('/api/school')
          .send(school)
          .then(res => {
            resolve(res);
          });
      });
      const res = await requestPromise;
      res.should.have.status(201);
      res.body.should.be.a('object');
      res.body.should.have.property('message').eql('School successfully added!');
      res.body.school.should.have.property('name');
    });

    it('Should NOT POST a school with no name', async () => {
      const school = {};
      const requestPromise = new Promise((resolve, reject) => {
        client
          .post('/api/school')
          .send(school)
          .then(res => {
            resolve(res);
          });
      });
      const res = await requestPromise;
      res.should.have.status(500);
      res.body.should.be.a('object');
      res.body.should.have.property('status').eql('error');
      res.body.should.have
        .property('message')
        .eql('school validation failed: name: A school must have a name');
    });
  });

  describe('/GET /api/school/:id', () => {
    it('it should GET a school by the given id', async () => {
      const school = await School.create({ name: 'School of Built Environment' });

      const requestPromise = new Promise((resolve, reject) => {
        client.get(`/api/school/${school._id}`).then(res => {
          resolve(res);
        });
      });
      const res = await requestPromise;
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('name');
      res.body.should.have.property('_id').eql(school.id);
    });
  });

  describe('/PATCH /api/school/:id', async () => {
    it('it should UPDATE a school given the id', async () => {
      const school = await School.create({ name: 'School of Industrial and Fine Arts' });

      const requestPromise = new Promise((resolve, reject) => {
        client
          .patch(`/api/school/${school.id}`)
          .send({ name: 'School of Engineering' })
          .then(res => {
            resolve(res);
          });
      });
      const res = await requestPromise;
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('message').eql('School updated!');
      res.body.school.should.have.property('name').eql('School of Engineering');
    });
  });

  describe('/DELETE /api/school/:id', async () => {
    it('it should DELETE a school given the id', async () => {
      const school = await School.create({ name: 'School of Industrial and Fine Arts' });

      const requestPromise = new Promise((resolve, reject) => {
        client.delete(`/api/school/${school.id}`).then(res => {
          resolve(res);
        });
      });
      const res = await requestPromise;
      res.should.have.status(204);
      res.body.should.be.a('object').eql({});
    });
  });
});
