const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('../server');
const { Todo } = require('../models/todo');
const { User } = require('../models/user');
const { todos, users, populateTodos, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('Server', () => {
  describe('POST /todos', () => {
    it('should create a new todo', (done) => {
      const text = 'test text';
      request(app)
        .post('/todos')
        .send({ text })
        .expect(200)
        .expect((res) => {
          expect(res.body.text).toBe(text);
        })
        .end((err) => {
          if (err) {
            return done(err);
          }

          Todo.find({ text }).then((todos) => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          }).catch((err) => {
            done(err);
          });
        });
    });

    it('should not create todo with invalid body data', (done) => {
      request(app)
        .post('/todos')
        .send({})
        .expect(400)
        .end((err) => {
          if (err) {
            done(err);
          }

          Todo.find().then((todos) => {
            expect(todos.length).toBe(2);
            done();
          }).catch((err) => {
            done(err);
          });
        });
    });
  });

  describe('GET /todos', () => {
    it('should get all todos', (done) => {
      request(app)
        .get('/todos')
        .expect(200)
        .expect((res) => {
          expect(res.body.todos.length).toBe(2);
        })
        .end(done);
    });
  });

  describe('GET /todo/:id', () => {
    it('should return todo document', (done) => {
      request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done);
    });

    it('should return a 404 if todo not found', (done) => {
      const id = new ObjectID();
      request(app)
        .get(`/todos/${id.toHexString()}`)
        .expect(404)
        .end(done);
    });

    it('should return 404 for non-object ids', (done) => {
      const id = '123';
      request(app)
        .get(`/todos/${id}`)
        .expect(404)
        .end(done);
    });
  });

  describe('DELETE /todo/:id', () => {
    it('should remove todo document', (done) => {
      request(app)
        .delete(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done);
    });

    it('should return a 404 if todo not found', (done) => {
      const id = new ObjectID();
      request(app)
        .delete(`/todos/${id.toHexString()}`)
        .expect(404)
        .end(done);
    });

    it('should return 404 for non-object ids', (done) => {
      const id = '123';
      request(app)
        .delete(`/todos/${id}`)
        .expect(404)
        .end(done);
    });
  });

  describe('PATCH /todos/:id', () => {
    it('should update todo', (done) => {
      request(app)
        .patch(`/todos/${todos[0]._id.toHexString()}`)
        .send({ completed: true })
        .expect(200)
        .expect((res) => {
          expect(res.body.todo.completed).toBeTruthy();
          expect(res.body.todo.completedAt).not.toBeNull();
        })
        .end(done);
    });

    it('should clear completedAt when completed is set to false', (done) => {
      request(app)
        .patch(`/todos/${todos[1]._id.toHexString()}`)
        .send({ completed: false })
        .expect(200)
        .expect((res) => {
          expect(res.body.todo.completed).toBeFalsy();
          expect(res.body.todo.completedAt).toBeNull();
        })
        .end(done);
    });
  });

  describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
      request(app)
        .get('/users/me')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(users[0]._id.toHexString());
          expect(res.body.email).toBe(users[0].email);
        })
        .end(done);
    });

    it('should return a 401 if not authenticated', (done) => {
      request(app)
        .get('/users/me')
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({})
        })
        .end(done);
    });
  });

  describe('POST /users', () => {
    it('should create a user', (done) => {
      const email = 'test@example.com';
      const password = '123mnb!';
      request(app)
        .post('/users')
        .send({ email, password })
        .expect(200)
        .expect((res) => {
          expect(res.headers['x-auth']).toBeDefined();
          expect(res.body._id).toBeDefined();
          expect(res.body.email).toBe(email);
        })
        .end((err) => {
          if (err) {
            return done(err);
          }

          User.findOne({ email }).then((user) => {
            expect(user).not.toBeNull();
            expect(user.password).not.toBe(password);
            done();
          });
        });
    });
  });
});