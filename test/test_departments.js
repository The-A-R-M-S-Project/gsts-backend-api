process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const School = require('../models/schools');
const Department = require('../models/departments');
const server = require('../server');

chai.use(chaiHttp);

describe('Departments', () => {
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

  describe('/GET /api/department/', () => {
    it('should GET all departments regardless of school', done => {
      chai
        .request(server)
        .get('/api/department')
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

  describe('/GET /api/department/:id ', () => {
    it('it should GET a department by the given id', done => {
      const department = new Department({
        name: 'Electrical and Computer Engineering'
      });
      department.save(() => {
        chai
          .request(server)
          .get(`/api/department/${department.id}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have
              .property('name')
              .eq('Electrical and Computer Engineering');
            res.body.should.have.property('programs');
            res.body.should.have.property('_id').eql(department.id);
            done();
          });
      });
    });
  });
});
