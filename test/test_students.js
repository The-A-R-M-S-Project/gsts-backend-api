process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');

const Student = require('../models/students');
const Staff = require('../models/staff');
const Program = require('../models/programs');
const server = require('../server');
const generators = require('./generators');

chai.should(); // no need to repeat this line in other tests
chai.use(chaiHttp);
const client = chai.request.agent(server);

describe.only('Students', () => {
  beforeEach(done => {
    Student.deleteMany({}, () => {});
    Program.deleteMany({}, () => {});
    Staff.deleteMany({}, () => {});
    done();
  });

  afterEach(done => {
    Student.deleteMany({}, () => {});
    Program.deleteMany({}, () => {});
    Staff.deleteMany({}, () => {});
    done();
  });

  describe('/GET /api/program/:id/student', () => {
    it('Should GET all the students in a particular program', async () => {
      const program = await Program.create({ name: 'Master of Architecture' });
      const student = await Student.create(generators.newStudent);
      student.program = program._id;

      await program.save();
      await student.save({ validateBeforeSave: false });

      const requestPromise = new Promise((resolve, reject) => {
        client.get(`/api/program/${program._id}/student`).then(res => {
          resolve(res);
        });
      });
      const res = await requestPromise;
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.not.be.eql(0);
      res.body.should.have.property('status');
      res.body.should.have.property('studentSize');
      res.body.should.have.property('data');
      res.body.data.students.should.be.an('array');
      res.body.data.students[0].should.have.property('_id');
      res.body.data.students[0].should.have.property('firstName').eq('John');
      res.body.data.students[0].should.have.property('lastName').eq('Doe');
      res.body.data.students[0].should.have.property('email').eq('test@cedat.mak.ac.ug');
      res.body.data.students[0].should.have.property('phoneNumber').eq('+256772123456');
      res.body.data.students[0].should.have.property('program').eq(`${program._id}`);
    });
  });

  describe('/GET /api/student/:id', () => {
    it('should GET a particular student when user with role dean/principal is logged in', async () => {
      const student = await Student.create(generators.newStudent);
      await Staff.create(generators.newDean);
      const { email, password } = generators.newDean;

      const loginPromise = new Promise((resolve, reject) => {
        client
          .post(`/api/staff/login`)
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

      const requestPromise = new Promise((resolve, reject) => {
        client
          .get(`/api/student/${student._id}/`)
          .set('Authorization', `Bearer ${token}`)
          .then(res => {
            resolve(res);
          });
      });
      const res = await requestPromise;
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('_id').eq(`${student._id}`);
      res.body.should.have.property('role').eq(`${student.role}`);
      res.body.should.have.property('firstName').eq(student.firstName);
      res.body.should.have.property('lastName').eq(student.lastName);
      res.body.should.have.property('email').eq(student.email);
      res.body.should.have.property('phoneNumber').eq(student.phoneNumber);
    });

    it('should fail to GET a particular student when student is logged in', async () => {
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

      const requestPromise = new Promise((resolve, reject) => {
        client
          .get(`/api/student/${student._id}/`)
          .set('Authorization', `Bearer ${token}`)
          .then(res => {
            resolve(res);
          });
      });
      const res = await requestPromise;
      res.should.have.status(403);
      res.body.should.be.a('object');
      res.body.should.have
        .property('message')
        .eq('You do not have permission to perform this action');
      res.body.should.have.property('status').eq('fail');
    });
  });

  describe('/POST /api/student/', () => {
    it('should successfully add a student to the database if user role is principal/dean', async () => {
      await Staff.create(generators.newDean);
      const { email, password } = generators.newDean;

      const loginPromise = new Promise((resolve, reject) => {
        client
          .post('/api/staff/login')
          .send({ email, password })
          .then(res => {
            resolve(res);
          });
      });

      const loginResponse = await loginPromise;
      const { token } = loginResponse.body;

      const requestPromise = new Promise((resolve, reject) => {
        client
          .post('/api/student')
          .set('Authorization', `Bearer ${token}`)
          .send(generators.newStudent)
          .then(res => {
            resolve(res);
          });
      });
      const res = await requestPromise;
      res.body.should.be.an('object');
      res.body.should.have.a.property('student');
      res.body.student.should.have.a.property('role').eql('student');
      res.body.student.should.have.a.property('firstName').eql('John');
      res.body.student.should.have.a.property('lastName').eql('Doe');
      res.body.student.should.have.a.property('email').eql('test@cedat.mak.ac.ug');
      res.body.student.should.have.a.property('phoneNumber').eql('+256772123456');
    });
  });

  describe('/POST /api/student/login', () => {
    it('should successfully login with correct credentials', async () => {
      const student = await Student.create(generators.newStudent);
      const { email, password } = generators.newStudent;

      const requestPromise = new Promise((resolve, reject) => {
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
      const res = await requestPromise;
      res.should.have.status(200);
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

      const requestPromise = new Promise((resolve, reject) => {
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
      const res = await requestPromise;
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

      const requestPromise = new Promise((resolve, reject) => {
        client
          .patch(`/api/student/updateMe/`)
          .set('Authorization', `Bearer ${token}`)
          .send({ phoneNumber: '+256783123456' })
          .then(res => {
            resolve(res);
          });
      });

      const res = await requestPromise;
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
