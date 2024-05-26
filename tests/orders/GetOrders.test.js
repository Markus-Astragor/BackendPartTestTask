const request = require('supertest');
const { app } = require('../../app');
const { Orders } = require('../../models/Orders.Schema');

jest.mock('../../models/Orders.Schema');
jest.mock('../../api/orders/utils', () => ({
  verifyToken: (req, res, next) => {
    req.user = { userId: '123' };
    next();
  }
}));

describe('GET /getOrders', () => {
  beforeEach(() => {
    Orders.mockClear();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });
  it('should handle errors', async () => {
    Orders.find = jest.fn().mockRejectedValue(new Error('Something went wrong while fetching orders'));

    const response = await request(app).get('/getOrders')
    expect(response.status).toBe(500);
    expect(response.text).toContain('Something went wrong while fetching orders');
  })

  it('should fetch orders successfully', async () => {
    Orders.find = jest.fn().mockResolvedValue([{
      _id: "66503667739a2491b653e33d",
      customerId: "664f24318a42be766fcbf2cd",
      price: 1000,
      additionalMessage: "",
      itemsList: [
        {
          itemId: "2",
          name: "jeans",
          description: "the best jeans i have ever seen they are blue colour",
          quantity: 1,
          _id: "66503667739a2491b653e33e"
        }
      ],
      orderDate: "2024-05-24T06:40:39.953Z",
    }]);

    const response = await request(app).get('/getOrders')
    expect(response.status).toBe(200);
  })
  it('should fetch orders successfully', async () => {
    Orders.find = jest.fn().mockResolvedValue([]);

    const response = await request(app).get('/getOrders')
    expect(response.status).toBe(200);
    expect(response.text).toContain('There are not any orders yet')
  })
})