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


describe('DELETE /deleteOrder/:id', () => {
  it('should delete order successfully and return status 200', async () => {
    const orderForDeleteId = "66503667739a2491b653e33d";

    Orders.findByIdAndDelete = jest.fn().mockImplementation((id) => {
      return Promise.resolve(mockData.filter(order => order._id !== id));
    });

    const response = await request(app).delete(`/deleteOrder/${orderForDeleteId}`);
    expect(response.status).toBe(200);


  })

  it('should return an error with status 404 if order with requested id was not found', async () => {
    const orderForDeleteId = "66503667739a2491b653e33";

    Orders.findByIdAndDelete = jest.fn().mockImplementation((id) => {
      return Promise.resolve(mockData.find(order => order._id === id));
    });

    const response = await request(app).delete(`/deleteOrder/${orderForDeleteId}`);
    expect(response.status).toBe(404);
    expect(response.text).toContain(`Order with id ${orderForDeleteId} wasn't found`);

  })

  it('should handle unexpected errors', async () => {
    const orderForDeleteId = "66503667739a2491b653e33d";

    Orders.findByIdAndDelete = jest.fn().mockRejectedValue(new Error("Something went wrong while deleting"));

    const response = await request(app).delete(`/deleteOrder/${orderForDeleteId}`);
    expect(response.status).toBe(500);
    expect(response.text).toContain("Something went wrong while deleting");
  })
})