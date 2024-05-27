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

const mockDataForUpdate = mockData.slice();

describe('PUT /updateOrder/:id', () => {
  beforeEach(() => {
    Orders.mockClear();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });
  it('should update order successfully', async () => {
    const orderForUpdateId = "66503667739a2491b653e33d";
    const foundObj = mockDataForUpdate.find(obj => obj._id === orderForUpdateId);
    const oldPrice = foundObj.price;
    let newPrice = oldPrice;

    Orders.findByIdAndUpdate = jest.fn().mockImplementation((id, orderObj) => {
      return Promise.resolve(() => {
        const foundOrderIndex = mockDataForUpdate.findIndex(order => order._id === id);
        mockDataForUpdate[foundOrderIndex] = orderObj;
        newPrice = orderObj.price;
      })
    });


    const response = await request(app)
      .put(`/updateOrder/${orderForUpdateId}`)
      .send({
        price: 1500,
        additionalMessage: 'updatedInfo',
        itemsList: [{
          itemId: "2",
          name: "jeans",
          description: "the best jeans i have ever seen they are blue colour",
          quantity: 1
        }]
      });

    expect(response.status).toBe(200);
    expect(response.text).toContain(`Order with id ${orderForUpdateId} was updated successfully`);
    expect(newPrice !== oldPrice);
  })

  it('should throw an error if new order does not satisfy validation', async () => {
    const orderForUpdateId = "66503667739a2491b653e33d";

    const { OrderValidationSchema } = require('../../validationSchemas/OrderValidationSchema');
    jest.spyOn(OrderValidationSchema, 'validate').mockReturnValue({
      error: {
        details: [{ message: { error: "\"price\" must be a positive number" } }]
      }
    });

    const response = await request(app)
      .put(`/updateOrder/${orderForUpdateId}`)
      .send({
        price: -1500,
        additionalMessage: 'updatedInfo',
        itemsList: [{
          itemId: "2",
          name: "jeans",
          description: "the best jeans i have ever seen they are blue colour",
          quantity: 1
        }]
      });

    expect(response.status).toBe(404);
    expect(response.text).toContain("price")
  })

  it('should handle unexpected errors', async () => {
    const orderForUpdateId = "66503667739a2491b653e33d";
    Orders.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Something went wrong while updating order'));

    const response = await request(app)
      .put(`/updateOrder/${orderForUpdateId}`)
      .send({
        price: 1500,
        additionalMessage: 'updatedInfo',
        itemsList: [{
          itemId: "2",
          name: "jeans",
          description: "the best jeans i have ever seen they are blue colour",
          quantity: 1
        }]
      });

    expect(response.status).toBe(500);
    expect(response.text).toContain("Something went wrong while updating order");
  })

  it('should return status 404 and a message if order by provided id was not found', async () => {
    const orderForUpdateId = "66503667739a2491b653e33";

    Orders.findByIdAndUpdate = jest.fn().mockImplementation((id) => {
      return Promise.resolve(mockDataForUpdate.find(order => order._id === id));
    });

    const response = await request(app)
      .put(`/updateOrder/${orderForUpdateId}`)
      .send({
        price: 1500,
        additionalMessage: 'updatedInfo',
        itemsList: [{
          itemId: "2",
          name: "jeans",
          description: "the best jeans i have ever seen they are blue colour",
          quantity: 1
        }]
      });

    expect(response.status).toBe(404);
    expect(response.text).toContain("not found");

  })

})