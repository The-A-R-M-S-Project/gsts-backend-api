process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const Student = require('../models/students');
const Department = require('../models/departments');
const Examiner = require('../models/examiners');
const server = require('../server');

chai.use(chaiHttp);

// Parent block
describe('Examiners', () => {
  beforeEach(done => {
    Examiner.deleteMany({}, () => {});
    Department.deleteMany({}, () => {});
    Student.deleteMany({}, () => {});
    done();
  });

  afterEach(done => {
    Examiner.deleteMany({}, () => {});
    Department.deleteMany({}, () => {});
    Student.deleteMany({}, () => {});
    done();
  });

  describe('/GET /api/examiner', () => {
    it('Should GET all examiners ', done => {
      const examiner = new Examiner({
        bioData: {
          name: 'Test Examiner',
          email: 'admin@cedat.mak.ac.ug',
          phoneNumber: '12345'
        },
        isAdministrator: false
      });
      examiner.save(() => {
        Examiner.find({}, () => {
          chai
            .request(server)
            .get(`/api/examiner`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('array');
              res.body.length.should.not.be.eql(0);
              res.body[0].should.have.property('_id');
              res.body[0].bioData.should.have
                .property('name')
                .eq('Test Examiner');
              res.body[0].bioData.should.have
                .property('email')
                .eq('admin@cedat.mak.ac.ug');
              res.body[0].bioData.should.have
                .property('phoneNumber')
                .eq('12345');
              done();
            });
        });
      });
    });
  });

  describe('/GET /api/examiner', () => {
    it('Should GET a particular Examiner given their ID', done => {
      const examiner = new Examiner({
        bioData: {
          name: 'Test Examiner',
          email: 'admin@cedat.mak.ac.ug',
          phoneNumber: '12345'
        },
        isAdministrator: true
      });
      examiner.save(() => {
        chai
          .request(server)
          .get(`/api/examiner/${examiner._id}/`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('_id').eq(`${examiner._id}`);
            res.body.bioData.should.have.property('name').eq('Test Examiner');
            res.body.bioData.should.have
              .property('email')
              .eq('admin@cedat.mak.ac.ug');
            res.body.bioData.should.have.property('phoneNumber').eq('12345');
            res.body.should.have.property('students');
            done();
          });
      });
    });
  });
});
