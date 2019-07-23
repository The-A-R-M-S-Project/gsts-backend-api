process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const Student = require('../models/students');
const Department = require('../models/departments');
const Staff = require('../models/staff');
const server = require('../server');
const generators = require('./generators');

chai.use(chaiHttp);

// Parent block
describe.skip('Staff', () => {
  beforeEach(done => {
    Staff.deleteMany({}, () => {});
    Department.deleteMany({}, () => {});
    Student.deleteMany({}, () => {});
    done();
  });

  afterEach(done => {
    Staff.deleteMany({}, () => {});
    Department.deleteMany({}, () => {});
    Student.deleteMany({}, () => {});
    done();
  });

  // TODO: Refactor this to pass with Auth of admin/principal/dean
  describe('/GET /api/staff', () => {
    it('Should GET all staff ', done => {
      const staff = new Staff(generators.newStaff);
      staff.save(() => {
        Staff.find({}, () => {
          chai
            .request(server)
            .get(`/api/staff`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('array');
              res.body.length.should.not.be.eql(0);
              res.body[0].should.have.property('_id');
              res.body[0].should.have.property('firstName').eq('Jane');
              res.body[0].should.have.property('lastName').eq('Doe');
              res.body[0].should.have.property('email').eq('staff@cedat.mak.ac.ug');
              res.body[0].bioData.should.have.property('phoneNumber').eq('+256772123456');
              done();
            });
        });
      });
    });
  });

  describe('/GET /api/staff', () => {
    it('Should GET a particular Staff given their ID', done => {
      const staff = new Staff(generators.newStaff);
      staff.save(() => {
        chai
          .request(server)
          .get(`/api/staff/${staff._id}/`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('_id').eq(`${staff._id}`);
            res.body.bioData.should.have.property('name').eq('Test Staff');
            res.body.bioData.should.have.property('email').eq('admin@cedat.mak.ac.ug');
            res.body.bioData.should.have.property('phoneNumber').eq('12345');
            res.body.should.have.property('students');
            done();
          });
      });
    });
  });
});
