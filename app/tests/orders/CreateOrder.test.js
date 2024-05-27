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

describe('POST /createOrder', () => {
  beforeEach(() => {
    Orders.mockClear();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });

  it('should create an order successfully', async () => {
    Orders.prototype.save = jest.fn().mockResolvedValue(true);

    const response = await request(app)
      .post('/createOrder')
      .send({
        price: 100,
        additionalMessage: 'Urgent delivery',
        itemsList: [{
          itemId: "2",
          name: "jeans",
          description: "the best jeans i have ever seen they are blue colour",
          quantity: 1
        }]
      });

    expect(response.status).toBe(200);
    expect(response.text).toContain('Order was created successfully');
    expect(Orders.prototype.save).toHaveBeenCalled();
  });

  it('should return 404 if you put price below zero', async () => {
    const { OrderValidationSchema } = require('../../validationSchemas/OrderValidationSchema');
    jest.spyOn(OrderValidationSchema, 'validate').mockReturnValue({
      error: {
        details: [{ message: { error: "\"price\" must be a positive number" } }]
      }
    });

    const response = await request(app)
      .post('/createOrder')
      .send({
        price: -1000,
        additionalMessage: "",
        itemsList: [{
          itemId: "2",
          name: "jeans",
          description: "the best jeans i have ever seen they are blue colour",
          quantity: 1
        }]
      });

    expect(response.status).toBe(404);
  });

  it('should handle unexpected errors', async () => {
    Orders.prototype.save = jest.fn().mockRejectedValue(new Error('An error occurred while creating the order'));

    const response = await request(app)
      .post('/createOrder')
      .send({
        price: 1200,
        additionalMessage: "",
        itemsList: [{
          itemId: "2",
          name: "jeans",
          description: "the best jeans i have ever seen they are blue colour",
          quantity: 1
        }]
      });

    console.log('response', response.status);
    expect(response.status).toBe(500);
    expect(response.text).toContain('An error occurred while creating the order');
  });
});
