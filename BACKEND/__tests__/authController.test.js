const User = require('../src/models/User');

jest.mock('../src/models/User');
jest.mock('../src/utils/generateToken', () => jest.fn(() => 'mock-token-123'));
jest.mock('../src/utils/setTokenCookie', () => ({
  setTokenCookie: jest.fn(),
  clearTokenCookie: jest.fn(),
}));
jest.mock('../src/services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
}));

const { registerUser, loginUser } = require('../src/controllers/authController');
const generateToken = require('../src/utils/generateToken');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
};

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('registerUser creates user and returns token', async () => {
    const req = { body: { name: 'Test', email: 'test@test.com', password: 'Pass123!' } };
    const res = mockRes();

    User.findOne.mockResolvedValue(null);
    const mockUser = {
      _id: 'user1',
      name: 'Test',
      email: 'test@test.com',
      profileComplete: false,
      emailVerified: false,
      generateEmailVerificationToken: jest.fn().mockReturnValue('verify-token'),
      save: jest.fn().mockResolvedValue(true),
    };
    User.create.mockResolvedValue(mockUser);

    await registerUser(req, res);

    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ email: 'test@test.com' }));
    expect(generateToken).toHaveBeenCalledWith('user1');
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('registerUser returns 400 when user already exists', async () => {
    const req = { body: { name: 'Test', email: 'exists@test.com', password: 'Pass123!' } };
    const res = mockRes();

    User.findOne.mockResolvedValue({ _id: 'existing', email: 'exists@test.com' });

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'User already exists' }));
  });

  test('loginUser returns 401 for invalid credentials', async () => {
    const req = { body: { email: 'bad@test.com', password: 'wrong' } };
    const res = mockRes();

    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('loginUser returns 423 when account is locked', async () => {
    const req = { body: { email: 'locked@test.com', password: 'Pass123!' } };
    const res = mockRes();

    const lockedUser = {
      isLocked: jest.fn().mockReturnValue(true),
      lockedUntil: new Date(Date.now() + 5 * 60000),
    };
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(lockedUser) });

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(423);
  });

  test('loginUser returns token on success', async () => {
    const req = { body: { email: 'good@test.com', password: 'Pass123!' } };
    const res = mockRes();

    const validUser = {
      _id: 'user1',
      name: 'Good',
      email: 'good@test.com',
      avatar: null,
      phone: null,
      preferredCurrency: 'USD',
      preferredLanguage: 'en',
      travelStyle: null,
      profileComplete: false,
      emailVerified: false,
      isLocked: jest.fn().mockReturnValue(false),
      matchPassword: jest.fn().mockResolvedValue(true),
      resetLoginAttempts: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(validUser) });

    await loginUser(req, res);

    expect(generateToken).toHaveBeenCalledWith('user1');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});