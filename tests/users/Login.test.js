const request = require('supertest');
const { app } = require('../../app');
const { Users } = require('../../models/Users.Schema.js');

jest.mock('../../models/Users.Schema');

const fakeUser = {
  _id: '664f24318a42be766fcbf2cd',
  username: 'markus',
  password: '$2b$10$4RRVq.tLUbNDbRBgF3QMpOnjlxoLJP8fdA1qe69AHK48EI8svffX6',
};

describe('POST /login', () => {
  beforeEach(() => {
    Users.findOne = jest.fn().mockResolvedValue(fakeUser);
    Users.mockClear();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });

  it('should login user successfully', async () => {
    const response = await request(app)
      .post('/login')
      .send(
        {
          username: "markus",
          password: "123456789",
        }
      );

    expect(response.status).toBe(200);
    expect(Users.findOne).toHaveBeenCalledWith({ username: 'markus' });
  })

  it('should return status 404 if there are wrong credentials such username or password', async () => {
    const response = await request(app)
      .post('/login')
      .send(
        {
          username: "markus",
          password: "1234567810",
        }
      );


    expect(response.status).toBe(404);
    expect(Users.findOne).toHaveBeenCalledWith({ username: 'markus' });
  })

  it('should handle unexpected errors', async () => {
    Users.findOne = jest.fn().mockResolvedValue(new Error('Internal Server Error:'));

    const response = await request(app)
      .post('/login')
      .send(
        {
          username: "markus",
          password: "123456789",
        }
      );


    expect(response.status).toBe(500);
    expect(Users.findOne).toHaveBeenCalledWith({ username: 'markus' });

  })

  it('should return status 404 when user does not exist', async () => {
    Users.findOne = jest.fn().mockResolvedValue(null);

    const response = await request(app)
      .post('/login')
      .send(
        {
          username: "markus",
          password: "123456789",
        }
      );


    expect(response.status).toBe(404);

  })
})
