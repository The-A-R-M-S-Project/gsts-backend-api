process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const Student = require('../models/students');
const Program = require('../models/programs');
const server = require('../server');

const should = chai.should(); // no need to repeat this line in other tests
chai.use(chaiHttp);

describe('Students', () => {
  beforeEach(done => {
    Student.deleteMany({}, () => {});
    Program.deleteMany({}, () => {});
    done();
  });
  afterEach(done => {
    Student.deleteMany({}, () => {});
    Program.deleteMany({}, () => {});
    done();
  });

  describe('/GET /api/program/:id/student', () => {
    it('Should GET all the students in a particular program', done => {
      const program = new Program({ name: 'Master of Architecture' });
      const student = new Student({
        bioData: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'test@cedat.mak.ac.ug',
          phoneNumber: '12345'
        },
        password: 'testPassword'
      });
      program.save((err, savedProgram) => {
        student.save((err, savedStudent) => {
          Student.findById(savedStudent._id, (err, foundStudent) => {
            foundStudent.program = savedProgram;
            foundStudent.save((err, std) => {
              savedProgram.students.push(std);
              savedProgram.save((err, crs) => {
                chai
                  .request(server)
                  .get(`/api/program/${crs._id}/student`)
                  .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.not.be.eql(0);
                    res.body[0].should.have.property('_id');
                    res.body[0].bioData.should.have
                      .property('firstName')
                      .eq('John');
                    res.body[0].bioData.should.have
                      .property('lastName')
                      .eq('Doe');
                    res.body[0].bioData.should.have
                      .property('email')
                      .eq('test@cedat.mak.ac.ug');
                    res.body[0].bioData.should.have
                      .property('phoneNumber')
                      .eq('12345');
                    res.body[0].should.have
                      .property('program')
                      .eq(`${crs._id}`);
                    done();
                  });
              });
            });
          });
        });
      });
    });
  });

  describe('/GET /api/student/:id', () => {
    it('should GET a particular student given their ID with Authorization token', done => {
      const student = new Student({
        bioData: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'test@cedat.mak.ac.ug',
          phoneNumber: '12345'
        },
        password: 'testPassword'
      });
      let token;
      // todo: Refactor this to use a async/await and eliminate occasional callback hell!
      // todo: Might want to refactor other tests too with chai-http promises
      student.save(() => {
        const client = chai.request.agent(server);
        client
          .post(`/api/student/login`)
          .send({
            bioData: {
              email: 'test@cedat.mak.ac.ug'
            },
            password: 'testPassword'
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(true);
            res.body.should.have.property('token');
            ({ token } = res.body);
            return client
              .get(`/api/student/${student._id}/`)
              .set('Authorization', `bearer ${token}`)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('_id').eq(`${student._id}`);
                res.body.bioData.should.have.property('firstName').eq('John');
                res.body.bioData.should.have.property('lastName').eq('Doe');
                res.body.bioData.should.have
                  .property('email')
                  .eq('test@cedat.mak.ac.ug');
                res.body.bioData.should.have
                  .property('phoneNumber')
                  .eq('12345');
                done();
              });
          });
      });
    });

    it('should require Authorization to GET student details', done => {
      const student = new Student({
        bioData: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'test@cedat.mak.ac.ug',
          phoneNumber: '12345'
        },
        password: 'testPassword'
      });
      student.save(() => {
        const client = chai.request.agent(server);
        client
          .post(`/api/student/login`)
          .send({
            bioData: {
              email: 'test@cedat.mak.ac.ug'
            },
            password: 'testPassword'
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(true);
            res.body.should.have.property('token');
            return client
              .get(`/api/student/${student._id}/`)
              .end((err, res) => {
                res.should.have.status(401);
                res.body.should.be.a('object');
                res.body.should.have
                  .property('error')
                  .eq('Authentication error. Token required.');
                done();
              });
          });
      });
    });
  });

  describe('/POST /api/student/', () => {
    it('should successfully add a student to the database', done => {
      const student = new Student({
        bioData: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'test@cedat.mak.ac.ug',
          phoneNumber: '12345'
        },
        password: 'testPassword'
      });
      chai
        .request(server)
        .post(`/api/student`)
        .send(student)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have
            .property('message')
            .eql('Student successfully added!');
          res.body.student.should.have.property('_id');
          res.body.student.bioData.should.have.property('firstName').eq('Jane');
          res.body.student.bioData.should.have.property('lastName').eq('Doe');
          res.body.student.bioData.should.have
            .property('email')
            .eq('test@cedat.mak.ac.ug');
          res.body.student.bioData.should.have
            .property('phoneNumber')
            .eq('12345');
          done();
        });
    });
  });

  describe('/POST /api/student/login', () => {
    it('should successfully login with correct credentials', done => {
      const student = new Student({
        bioData: {
          firstName: 'Joseph',
          lastName: 'Doe',
          email: 'test@cedat.mak.ac.ug',
          phoneNumber: '12345'
        },
        password: 'testPassword'
      });
      student.save(() => {
        chai
          .request(server)
          .post(`/api/student/login`)
          .send({
            bioData: {
              email: 'test@cedat.mak.ac.ug'
            },
            password: 'testPassword'
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
      const student = new Student({
        bioData: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'test@cedat.mak.ac.ug',
          phoneNumber: '12345'
        },
        password: 'testPassword'
      });
      student.save(() => {
        chai
          .request(server)
          .post(`/api/student/login`)
          .send({
            bioData: {
              email: 'test@cedat.mak.ac.ug'
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

  describe('/PATCH /api/student/:id', () => {
    it('should update student information given the id', done => {
      const student = new Student({
        bioData: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'test@cedat.mak.ac.ug',
          phoneNumber: '12345'
        },
        password: 'testPassword'
      });
      let token;
      student.save(() => {
        const client = chai.request.agent(server);
        client
          .post(`/api/student/login`)
          .send({
            bioData: {
              email: 'test@cedat.mak.ac.ug'
            },
            password: 'testPassword'
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(true);
            res.body.should.have.property('token');
            ({ token } = res.body);
            return client
              .patch(`/api/student/${student._id}/`)
              .set('Authorization', `bearer ${token}`)
              .send({
                bioData: {
                  firstName: 'Jane',
                  lastName: 'Doe',
                  email: 'test@cedat.mak.ac.ug',
                  phoneNumber: '54321'
                }
              })
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have
                  .property('message')
                  .eql('Student information updated!');
                res.body.student.bioData.should.have
                  .property('phoneNumber')
                  .eql('54321');
                done();
              });
          });
      });
    });
  });
});
