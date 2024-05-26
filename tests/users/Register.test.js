const request = require('supertest');
const { app } = require('../../app');
const { Users } = require('../../models/Users.Schema.js');

jest.mock('../../models/Users.Schema');

const userToken = {
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjUwNTU4NDQxMzQ2NGQzODEzNDJmY2IiLCJpYXQiOjE3MTY1NDA4MDQsImV4cCI6MTcxNjYyNzIwNH0.qItxHxk3fCseNIFXOTVJwb1ZAsjlzymFlUzhO6NSR2c"
}

describe('POST /register', () => {
  beforeEach(() => {
    Users.prototype.save = jest.fn().mockResolvedValue(userToken);
    Users.mockClear();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });
  it('should register user successfully', async () => {
    const response = await request(app)
      .post('/register')
      .send(
        {
          username: "mark",
          password: "12345678910",
        }
      );

    expect(response.status).toBe(200);

  })

  it('should return status 404 if username do not satisfy requirments', async () => {

    const { RegisterValidationSchema } = require('../../validationSchemas/RegisterValidationSchema.js');
    jest.spyOn(RegisterValidationSchema, 'validate').mockReturnValue({
      error: {
        details: [{ message: { error: "\"username\" length must be at least 2 characters long" } }]
      }
    });


    const response = await request(app)
      .post('/register')
      .send({
        username: "m",
        password: "12345678910"
      });

    expect(response.status).toBe(400);
    expect(response.text).toContain('username');

  })

  it('should return status 404 if password do not satisfy requirments', async () => {
    const { RegisterValidationSchema } = require('../../validationSchemas/RegisterValidationSchema.js');
    jest.spyOn(RegisterValidationSchema, 'validate').mockReturnValue({
      error: {
        details: [{ message: { error: "\"password\" length must be at least 8 characters long" } }]
      }
    });


    const response = await request(app)
      .post('/register')
      .send({
        username: "markk",
        password: "12345"
      });

    expect(response.status).toBe(400);
    expect(response.text).toContain('password');
  })

  it('should handle unexpected errors', async () => {
    Users.prototype.save = jest.fn().mockRejectedValue(new Error('An error occurred while registering the user'));

    const response = await request(app)
      .post('/register')
      .send(
        {
          username: "mark",
          password: "12345678910",
        }
      );

    expect(response.status).toBe(500);

  })

  it('should return error if you register user with already existing', async () => {
    Users.findOne = jest.fn().mockResolvedValue({
      _id: '66505584413464d381342fcb',
      username: 'mark',
    });

    const response = await request(app)
      .post('/register')
      .send({
        username: "mark",
        password: "12345678910",
      });

    expect(response.status).toBe(403);
    expect(response.text).toContain('Account with this username already exists');
  })
})