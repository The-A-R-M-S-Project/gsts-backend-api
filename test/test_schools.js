process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const School = require('../models/schools');
const Department = require('../models/departments');
const server = require('../server');

chai.use(chaiHttp);

describe('Schools', () => {
  beforeEach(done => {
    School.deleteMany({}, () => {
      done();
    });
  });
  afterEach(done => {
    School.deleteMany({}, () => {
      done();
    });
  });

  describe('/GET /api/school', () => {
    it('Should GET all the schools', done => {
      chai
        .request(server)
        .get('/api/school')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });
  });

  describe('/GET /api/school/:id/department ', () => {
    it('Should GET all departments for a given school id', done => {
      const school = new School({ name: 'School of Built Environment' });
      const department = new Department({
        name: 'Architecture and Physical planning'
      });
      school.save(() => {
        department.save((err, savedDepartment) => {
          School.findById(school._id, (err, foundSchool) => {
            foundSchool.departments.push(savedDepartment);
            foundSchool.save(() => {
              chai
                .request(server)
                .get(`/api/school/${school._id}/department`)
                .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.departments.should.be.a('array');
                  res.body.departments.length.should.not.be.eql(0);
                  res.body.departments[0].should.have
                    .property('name')
                    .eq('Architecture and Physical planning');
                  done();
                });
            });
          });
        });
      });
    });
  });

  describe('/POST /api/school', () => {
    it('Should successfully add a school to the database', done => {
      const school = { name: 'School of Engineering' };
      chai
        .request(server)
        .post('/api/school')
        .send(school)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have
            .property('message')
            .eql('School successfully added!');
          res.body.school.should.have.property('name');
          done();
        });
    });

    it('Should NOT POST a school with no name', done => {
      const school = {};
      chai
        .request(server)
        .post('/api/school')
        .send(school)
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.be.a('object');
          res.body.should.have.property('status').eql('error');
          res.body.should.have
            .property('message')
            .eql('school validation failed: name: A school must have a name');
          done();
        });
    });
  });

  describe('/GET /api/school/:id', () => {
    it('it should GET a school by the given id', done => {
      const school = new School({ name: 'School of Built Environment' });
      school.save(() => {
        chai
          .request(server)
          .get(`/api/school/${school._id}`)
          .send(school)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('name');
            res.body.should.have.property('departments');
            res.body.should.have.property('_id').eql(school.id);
            done();
          });
      });
    });
  });

  describe('/PATCH /api/school/:id', () => {
    it('it should UPDATE a school given the id', done => {
      const school = new School({ name: 'School of Industrial and Fine Arts' });
      school.save(() => {
        chai
          .request(server)
          .patch(`/api/school/${school.id}`)
          .send({ name: 'School of Engineering' })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('School updated!');
            res.body.school.should.have
              .property('name')
              .eql('School of Engineering');
            done();
          });
      });
    });
  });

  describe('/DELETE /api/school/:id', () => {
    it('it should DELETE a school given the id', done => {
      const school = new School({ name: 'School of Engineering' });
      school.save(() => {
        chai
          .request(server)
          .delete(`/api/school/${school.id}`)
          .end((err, res) => {
            res.should.have.status(204);
            res.body.should.be.a('object').eql({});
            done();
          });
      });
    });
  });
});
