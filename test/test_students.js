process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');

const Student = require('../models/students');
const Program = require('../models/programs');
const server = require('../server');
const generators = require('./generators');

const should = chai.should(); // no need to repeat this line in other tests
chai.use(chaiHttp);
const client = chai.request.agent(server);

describe.only('Students', () => {
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
    it('Should GET all the students in a particular program', async () => {
      const program = await Program.create({ name: 'Master of Architecture' });
      const student = await Student.create(generators.newStudent);
      student.program = program._id;
      program.students.push(student._id);

      await program.save();
      await student.save({ validateBeforeSave: false });

      const responsePromise = new Promise((resolve, reject) => {
        client.get(`/api/program/${program._id}/student`).then(res => {
          resolve(res);
        });
      });
      const res = await responsePromise;
      res.should.have.status(200);
      res.body.should.be.a('array');
      res.body.length.should.not.be.eql(0);
      res.body[0].should.have.property('_id');
      res.body[0].should.have.property('firstName').eq('John');
      res.body[0].should.have.property('lastName').eq('Doe');
      res.body[0].should.have.property('email').eq('test@cedat.mak.ac.ug');
      res.body[0].should.have.property('phoneNumber').eq('+256772123456');
      res.body[0].should.have.property('program').eq(`${program._id}`);
    });
  });

  // TODO: refactor this test to either pass with the Admin model or fail with the student model
  // describe('/GET /api/student/:id', () => {
  //   it('should GET a particular student when logged in', async () => {
  //     const student = await Student.create(generators.newStudent);
  //     const { email, password } = generators.newStudent;

  //     const loginPromise = new Promise((resolve, reject) => {
  //       client
  //         .post(`/api/student/login`)
  //         .send({
  //           email,
  //           password
  //         })
  //         .then(res => {
  //           resolve(res);
  //         });
  //     });
  //     const loginResponse = await loginPromise;
  //     const { token } = loginResponse.body;

  //     const responsePromise = new Promise((resolve, reject) => {
  //       client
  //         .get(`/api/student/${student._id}/`)
  //         .set('Authorization', `Bearer ${token}`)
  //         .then(res => {
  //           resolve(res);
  //         });
  //     });
  //     const res = await responsePromise;
  //     res.should.have.status(200);
  //     res.body.should.be.a('object');
  //     res.body.should.have.property('_id').eq(`${student._id}`);
  //     res.body.should.have.property('role').eq(`${student.role}`);
  //     res.body.should.have.property('firstName').eq(student.firstName);
  //     res.body.should.have.property('lastName').eq(student.lastName);
  //     res.body.should.have.property('email').eq(student.email);
  //     res.body.should.have.property('phoneNumber').eq(student.phoneNumber);
  //   });
  // });

  // TODO: Refactor this test to only pass with Admin credentials
  // describe('/POST /api/student/', () => {
  //   it('should successfully add a student to the database', done => {
  //     const student = new Student({
  //       bioData: {
  //         firstName: 'Jane',
  //         lastName: 'Doe',
  //         email: 'test@cedat.mak.ac.ug',
  //         phoneNumber: '12345'
  //       },
  //       password: 'testPassword'
  //     });
  //     chai
  //       .request(server)
  //       .post(`/api/student`)
  //       .send(student)
  //       .end((err, res) => {
  //         res.should.have.status(201);
  //         res.body.should.be.a('object');
  //         res.body.should.have.property('message').eql('Student successfully added!');
  //         res.body.student.should.have.property('_id');
  //         res.body.student.should.have.property('firstName').eq('Jane');
  //         res.body.student.should.have.property('lastName').eq('Doe');
  //         res.body.student.should.have
  //           .property('email')
  //           .eq('test@cedat.mak.ac.ug');
  //         res.body.student.bioData.should.have.property('phoneNumber').eq('12345');
  //         done();
  //       });
  //   });
  // });

  describe('/POST /api/student/login', () => {
    it('should successfully login with correct credentials', async () => {
      const student = await Student.create(generators.newStudent);
      const { email, password } = generators.newStudent;

      const responsePromise = new Promise((resolve, reject) => {
        client
          .post(`/api/student/login`)
          .send({
            email,
            password
          })
          .then(res => {
            resolve(res);
          });
      });
      const res = await responsePromise;
      res.should.have.status(201);
      res.body.should.be.a('object');
      res.body.should.have.property('status').eql('success');
      res.body.should.have.property('token');
      res.body.data.user.should.have.property('firstName').eq(student.firstName);
      res.body.data.user.should.have.property('lastName').eq(student.lastName);
      res.body.data.user.should.have.property('email').eq(student.email);
      res.body.data.user.should.have.property('phoneNumber').eq(student.phoneNumber);
    });

    it('should return Authentication error for incorrect credentials', async () => {
      await Student.create(generators.newStudent);
      const { email } = generators.newStudent;

      const responsePromise = new Promise((resolve, reject) => {
        client
          .post(`/api/student/login`)
          .send({
            email,
            password: 'wrongTestPassword'
          })
          .then(res => {
            resolve(res);
          });
      });
      const res = await responsePromise;
      res.body.should.be.a('object');
      res.body.should.have.property('status').eql('fail');
      res.body.should.have.property('message').eql('Incorrect email or password');
    });
  });

  describe('/PATCH /api/student/:id', () => {
    it('should update student information given the id', async () => {
      const student = await Student.create(generators.newStudent);
      const { email, password } = generators.newStudent;

      const loginPromise = new Promise((resolve, reject) => {
        client
          .post(`/api/student/login`)
          .send({
            email,
            password
          })
          .then(res => {
            resolve(res);
          });
      });
      const loginResponse = await loginPromise;
      const { token } = loginResponse.body;

      const responsePromise = new Promise((resolve, reject) => {
        client
          .patch(`/api/student/updateMe/`)
          .set('Authorization', `Bearer ${token}`)
          .send({ phoneNumber: '+256783123456' })
          .then(res => {
            resolve(res);
          });
      });

      const res = await responsePromise;
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('status').eql('success');
      res.body.data.student.should.have.property('role').eq(`${student.role}`);
      res.body.data.student.should.have.property('firstName').eq(student.firstName);
      res.body.data.student.should.have.property('lastName').eq(student.lastName);
      res.body.data.student.should.have.property('email').eq(student.email);
      res.body.data.student.should.have.property('phoneNumber').eq('+256783123456');
    });
  });
});
