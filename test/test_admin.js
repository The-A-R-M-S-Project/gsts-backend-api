process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const Admin = require('../models/admin');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();

chai.use(chaiHttp);

describe('Admin', () => {
  beforeEach((done) => {
    Admin.deleteMany({}, (err) => {
    });
    done();
  });
  afterEach((done) => {
    Admin.deleteMany({}, (err) => {
    });
    done();
  });

  describe('/POST /api/admin/', () => {
    xit('should successfully add a admin to the database', (done) => {
      let admin = new Admin({
          bioData: {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'admin@cedat.mak.ac.ug',
            phoneNumber: '12345'
          },
          password: 'adminPassword'
        }
      );
      chai.request(server)
        .post(`/api/admin`)
        .send(admin)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Admin successfully added!');
          res.body.admin.should.have.property('_id');
          res.body.admin.bioData.should.have.property('firstName').eq('Jane');
          res.body.admin.bioData.should.have.property('lastName').eq('Doe');
          res.body.admin.bioData.should.have.property('email').eq('admin@cedat.mak.ac.ug');
          res.body.admin.bioData.should.have.property('phoneNumber').eq('12345');
          done();
        });
    });
  });

  describe('/POST /api/admin/login', () => {
    it('should successfully login with correct credentials', (done) => {
      let admin = new Admin({
          bioData: {
            firstName: 'Joseph',
            lastName: 'Doe',
            email: 'admin@cedat.mak.ac.ug',
            phoneNumber: '12345'
          },
          password: 'adminPassword'
        }
      );
      admin.save((err, savedAdmin) => {
        chai.request(server)
          .post(`/api/admin/login`)
          .send({
            bioData: {
              'email': 'admin@cedat.mak.ac.ug'
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

    it('should return Authentication error for incorrect credentials', (done) => {
      let admin = new Admin({
          bioData: {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'admin@cedat.mak.ac.ug',
            phoneNumber: '12345'
          },
          password: 'adminPassword'
        }
      );
      admin.save((err, savedAdmin) => {
        chai.request(server)
          .post(`/api/admin/login`)
          .send({
            bioData: {
              'email': 'admin@cedat.mak.ac.ug'
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