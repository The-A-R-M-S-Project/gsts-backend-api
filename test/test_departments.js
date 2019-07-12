process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const School = require('../models/schools');
const Department = require('../models/departments');
const Program = require('../models/programs');
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

  describe('/GET /api/department/:id/program ', () => {
    it('Should GET all programs for a given department id', done => {
      const department = new Department({
        name: 'Architecture and Physical planning'
      });
      const program = new Program({ name: 'Master of Architecture' });
      department.save(() => {
        program.save(() => {
          Department.findById(department._id, (err, foundDept) => {
            foundDept.programs.push(program);
            foundDept.save((err, dept) => {
              chai
                .request(server)
                .get(`/api/department/${dept._id}/program`)
                .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.programs.should.be.a('array');
                  res.body.programs.length.should.not.be.eql(0);
                  res.body.programs[0].should.have.property('_id');
                  res.body.programs[0].should.have
                    .property('name')
                    .eq('Master of Architecture');
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
