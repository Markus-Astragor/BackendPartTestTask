const request = require('supertest');
const { app } = require('../../app');
const { Orders } = require('../../models/Orders.Schema');
const { mockData } = require('./mockData');

jest.mock('../../models/Orders.Schema');
jest.mock('../../api/orders/utils', () => ({
  verifyToken: (req, res, next) => {
    req.user = { userId: '123' };
    next();
  }
}));

describe('GET /getOrders/:id', () => {
  it('should return order by id provided by user', async () => {
    const idToFind = "66503667739a2491b653e33d";
    Orders.findById = jest.fn().mockImplementation((id) => {
      return Promise.resolve(mockData.find(order => order._id === id));
    });

    const response = await request(app).get(`/getOrders/${idToFind}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockData[0]);
  })

  it('should return status 404 and a message if order by provided id was not found', async () => {
    const idToFind = "66503667739a2491b653e33";
    Orders.findById = jest.fn().mockImplementation((id) => {
      return Promise.resolve(mockData.find(order => order._id === id));
    });

    const response = await request(app).get(`/getOrders/${idToFind}`);
    expect(response.status).toBe(404);
    expect(response.text).toContain(`The order with id ${idToFind} doesn't exist`);
  })

  it('should handle unexpected errors', async () => {
    const idToFind = "66503667739a2491b653e33d";
    Orders.findById = jest.fn().mockRejectedValue(new Error('Something went wrong while fetching order'));

    const response = await request(app).get(`/getOrders/${idToFind}`);
    expect(response.status).toBe(500);
    expect(response.text).toContain("Something went wrong while fetching order");

  })
})