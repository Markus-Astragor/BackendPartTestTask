const jwt = require('jsonwebtoken');
const { verifyToken } = require('../../api/orders/utils');

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

describe('verifyToken', () => {
  let mockReq;
  let mockRes;
  let nextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {
        token: 'fakeToken123'
      }
    };
    mockRes = {
      status: jest.fn(() => mockRes),
      send: jest.fn()
    };
    nextFunction = jest.fn();
  });

  it('should return 403 if no token is provided', () => {
    mockReq.headers = {};

    verifyToken(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.send).toHaveBeenCalledWith('User is not authorized');
  });

  it('should return 401 if the token has expired', () => {
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback({ name: 'TokenExpiredError' });
    });

    verifyToken(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.send).toHaveBeenCalledWith('Token has expired');
  });

  it('should return 500 if the token cannot be authenticated', () => {
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(new Error('Invalid token'));
    });

    verifyToken(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith('Failed to authenticate token');
  });

  it('should call next if the token is valid', () => {
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, { userId: '123' });
    });

    verifyToken(mockReq, mockRes, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockReq.user).toEqual({ userId: '123' });
  });
});
