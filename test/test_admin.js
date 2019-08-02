process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');

const Admin = require('../models/admin');
const server = require('../server');

chai.use(chaiHttp);

describe.skip('Admin', () => {
  beforeEach(done => {
    Admin.deleteMany({}, () => {});
    done();
  });
  afterEach(done => {
    Admin.deleteMany({}, () => {});
    done();
  });

  describe('/POST /api/admin/', () => {
    // FIXME: This tests fails. Remember to refactor to use async later
    xit('should successfully add a admin to the database', done => {
      const admin = new Admin({
        bioData: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'admin@cedat.mak.ac.ug',
          phoneNumber: '12345'
        },
        password: 'adminPassword'
      });
      chai
        .request(server)
        .post(`/api/admin`)
        .send(admin)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Admin successfully added!');
          res.body.admin.should.have.property('_id');
          res.body.admin.bioData.should.have.property('firstName').eq('Jane');
          res.body.admin.bioData.should.have.property('lastName').eq('Doe');
          res.body.admin.bioData.should.have
            .property('email')
            .eq('admin@cedat.mak.ac.ug');
          res.body.admin.bioData.should.have.property('phoneNumber').eq('12345');
          done();
        });
    });
  });

  describe('/POST /api/admin/login', () => {
    it('should successfully login with correct credentials', done => {
      const admin = new Admin({
        bioData: {
          firstName: 'Joseph',
          lastName: 'Doe',
          email: 'admin@cedat.mak.ac.ug',
          phoneNumber: '12345'
        },
        password: 'adminPassword'
      });
      admin.save(() => {
        chai
          .request(server)
          .post(`/api/admin/login`)
          .send({
            bioData: {
              email: 'admin@cedat.mak.ac.ug'
            },
            password: 'adminPassword'
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(true);
            res.body.should.have.property('token');
            done();
          });
      });
    });

    it('should return Authentication error for incorrect credentials', done => {
      const admin = new Admin({
        bioData: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'admin@cedat.mak.ac.ug',
          phoneNumber: '12345'
        },
        password: 'adminPassword'
      });
      admin.save(() => {
        chai
          .request(server)
          .post(`/api/admin/login`)
          .send({
            bioData: {
              email: 'admin@cedat.mak.ac.ug'
            },
            password: 'wrongTestPassword'
          })
          .end((err, res) => {
            res.should.have.status(401);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(false);
            res.body.should.have.property('error').eql('Authentication error');
            done();
          });
      });
    });
  });
});
