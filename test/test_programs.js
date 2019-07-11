process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const Department = require('../models/departments');
const Program = require('../models/programs');
const server = require('../server');

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

  describe('/GET /api/program/:id ', () => {
    it('it should GET a program by the given id', done => {
      const program = new Program({
        name: 'Master of Science in Civil Engineering'
      });
      program.save(() => {
        chai
          .request(server)
          .get(`/api/program/${program.id}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have
              .property('name')
              .eq('Master of Science in Civil Engineering');
            res.body.should.have.property('students');
            res.body.should.have.property('_id').eql(program.id);
            done();
          });
      });
    });
  });
});
