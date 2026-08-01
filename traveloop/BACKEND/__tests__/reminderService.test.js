jest.mock('../src/config/env', () => ({
  env: {
    EMAIL_USER: '',
    EMAIL_PASS: '',
    CLIENT_URL: 'http://localhost:5173',
  },
}));

jest.mock('../src/models/Trip');
jest.mock('../src/models/User');
jest.mock('../src/services/emailService');

const { env } = require('../src/config/env');
const Trip = require('../src/models/Trip');
const User = require('../src/models/User');
const { sendTemplatedEmail } = require('../src/services/emailService');
const { findTripsDueForReminder, runReminderPass, isEmailConfigured } = require('../src/services/reminderService');

const daysFromNow = (days) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const leanChain = (value) => ({ lean: jest.fn().mockResolvedValue(value) });

describe('Reminder Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    env.EMAIL_USER = '';
    env.EMAIL_PASS = '';
  });

  test('isEmailConfigured reflects env config', () => {
    expect(isEmailConfigured()).toBe(false);
    env.EMAIL_USER = 'test@traveloop.com';
    env.EMAIL_PASS = 'test-pass';
    expect(isEmailConfigured()).toBe(true);
  });

  test('findTripsDueForReminder returns trips starting on the target day', async () => {
    const trip = { _id: 't1', user: 'u1', title: 'Bali Trip', startDate: daysFromNow(3) };
    Trip.find.mockReturnValue(leanChain([trip]));

    const result = await findTripsDueForReminder(3);
    expect(Trip.find).toHaveBeenCalled();
    expect(result).toEqual([trip]);
  });

  test('runReminderPass skips when email is not configured', async () => {
    const sent = await runReminderPass();
    expect(sent).toBe(0);
    expect(Trip.find).not.toHaveBeenCalled();
  });

  test('runReminderPass sends email and marks trip as reminded', async () => {
    env.EMAIL_USER = 'test@traveloop.com';
    env.EMAIL_PASS = 'test-pass';

    const trip = { _id: 't1', user: 'u1', title: 'Bali Trip', startDate: daysFromNow(1), destination: 'Bali', status: 'upcoming' };
    const user = { _id: 'u1', name: 'Henish Patel', email: 'henish@example.com' };

    Trip.find.mockReturnValue(leanChain([trip]));
    User.find.mockReturnValue(leanChain([user]));
    sendTemplatedEmail.mockResolvedValue({ success: true, messageId: 'm1' });
    Trip.updateOne.mockResolvedValue({});

    const sent = await runReminderPass();
    expect(sent).toBe(3); // 3 offsets (14/3/1 days) each match the mocked trip
    expect(sendTemplatedEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'henish@example.com' }));
    expect(Trip.updateOne).toHaveBeenCalledWith(
      { _id: 't1' },
      { $set: { lastReminderDate: expect.any(Date) } }
    );
  });
});
