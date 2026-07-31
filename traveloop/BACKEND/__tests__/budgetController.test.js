const Budget = require('../src/models/Budget');

jest.mock('../src/models/Budget');

const {
  getBudget,
  createOrUpdateBudget,
  addExpense,
  deleteExpense,
} = require('../src/controllers/budgetController');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Budget Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getBudget returns 404 when no budget found', async () => {
    const req = { user: { _id: 'user1' }, params: { tripId: 'trip1' } };
    const res = mockRes();
    Budget.findOne.mockResolvedValue(null);

    await getBudget(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('getBudget returns budget when found', async () => {
    const req = { user: { _id: 'user1' }, params: { tripId: 'trip1' } };
    const res = mockRes();
    Budget.findOne.mockResolvedValue({ _id: 'b1', totalBudget: 5000 });

    await getBudget(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: expect.any(Object) }));
  });

  test('createOrUpdateBudget creates new budget when none exists', async () => {
    const req = { user: { _id: 'user1' }, params: { tripId: 'trip1' }, body: { totalBudget: 3000, currency: 'EUR' } };
    const res = mockRes();
    Budget.findOne.mockResolvedValue(null);
    Budget.create.mockResolvedValue({ _id: 'new', totalBudget: 3000 });

    await createOrUpdateBudget(req, res);

    expect(Budget.create).toHaveBeenCalledWith(expect.objectContaining({ totalBudget: 3000, currency: 'EUR' }));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('createOrUpdateBudget updates existing budget', async () => {
    const req = { user: { _id: 'user1' }, params: { tripId: 'trip1' }, body: { totalBudget: 4000 } };
    const res = mockRes();
    const existing = { totalBudget: 1000, currency: 'USD', save: jest.fn().mockResolvedValue(true) };
    Budget.findOne.mockResolvedValue(existing);

    await createOrUpdateBudget(req, res);

    expect(existing.totalBudget).toBe(4000);
    expect(existing.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('addExpense returns 404 when budget not found', async () => {
    const req = { user: { _id: 'user1' }, params: { id: 'b1' }, body: { amount: 50, category: 'food' } };
    const res = mockRes();
    Budget.findOneAndUpdate.mockResolvedValue(null);

    await addExpense(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('addExpense pushes to expenses array', async () => {
    const req = { user: { _id: 'user1' }, params: { id: 'b1' }, body: { amount: 50, category: 'food' } };
    const res = mockRes();
    Budget.findOneAndUpdate.mockResolvedValue({ _id: 'b1', expenses: [{ amount: 50 }] });

    await addExpense(req, res);

    expect(Budget.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'b1', user: 'user1' },
      { $push: { expenses: req.body } },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('deleteExpense returns 404 when budget not found', async () => {
    const req = { user: { _id: 'user1' }, params: { id: 'b1', expenseId: 'e1' } };
    const res = mockRes();
    Budget.findOneAndUpdate.mockResolvedValue(null);

    await deleteExpense(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('deleteExpense pulls expense from array', async () => {
    const req = { user: { _id: 'user1' }, params: { id: 'b1', expenseId: 'e1' } };
    const res = mockRes();
    Budget.findOneAndUpdate.mockResolvedValue({ _id: 'b1', expenses: [] });

    await deleteExpense(req, res);

    expect(Budget.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'b1', user: 'user1' },
      { $pull: { expenses: { _id: 'e1' } } },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});