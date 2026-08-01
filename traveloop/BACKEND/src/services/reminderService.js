/**
 * @fileoverview Trip reminder service.
 * Sends email reminders for upcoming trips at configurable offsets before the start date.
 * Runs on a lightweight interval scheduler (no external cron dependency).
 */

const Trip = require('../models/Trip');
const User = require('../models/User');
const { sendTemplatedEmail } = require('./emailService');
const { env } = require('../config/env');

const DEFAULT_OFFSET_DAYS = [14, 3, 1];
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // every 6 hours

let scheduler = null;
let lastRun = null;

const isEmailConfigured = () => Boolean(env.EMAIL_USER && env.EMAIL_PASS);

/**
 * Find trips starting exactly `offsetDays` from today (normalized to UTC dates)
 * for users who have not been emailed yet (lastReminderDate tracked on trip).
 */
const findTripsDueForReminder = async (offsetDays) => {
  const today = new Date();
  const targetStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + offsetDays));
  const dayAfter = new Date(targetStart);
  dayAfter.setUTCDate(dayAfter.getUTCDate() + 1);

  return Trip.find({
    status: { $in: ['planning', 'upcoming', 'active'] },
    startDate: { $gte: targetStart, $lt: dayAfter },
    // Don't re-notify within the same window
    $or: [
      { lastReminderDate: { $exists: false } },
      { lastReminderDate: null },
    ],
  }).lean();
};

/**
 * Send reminders for a given offset day.
 */
const sendRemindersForOffset = async (offsetDays) => {
  const trips = await findTripsDueForReminder(offsetDays);
  if (trips.length === 0) return 0;

  const userIds = [...new Set(trips.map((t) => String(t.user)))];
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const userMap = new Map(users.map((u) => [String(u._id), u]));

  let sent = 0;
  for (const trip of trips) {
    const user = userMap.get(String(trip.user));
    if (!user || !user.email) continue;

    const start = new Date(trip.startDate);
    const end = trip.endDate ? new Date(trip.endDate) : null;
    const dateFmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const tripDates = end ? `${dateFmt(start)} — ${dateFmt(end)}` : dateFmt(start);
    const appUrl = env.CLIENT_URL || 'http://localhost:5173';

    const result = await sendTemplatedEmail({
      to: user.email,
      subject: `✈️ ${trip.title} starts in ${offsetDays} day${offsetDays === 1 ? '' : 's'}`,
      template: 'trip-reminder',
      data: {
        name: user.name?.split(' ')[0] || 'Traveler',
        tripTitle: trip.title,
        tripDates,
        tripDestination: trip.destination || trip.destinations?.join(', ') || '',
        tripStatus: trip.status || 'planning',
        tripUrl: `${appUrl}/trip/${trip._id}`,
        unsubscribeUrl: `${appUrl}/settings`,
      },
    });

    if (result.success) {
      await Trip.updateOne({ _id: trip._id }, { $set: { lastReminderDate: new Date() } });
      sent += 1;
    }
  }
  return sent;
};

/**
 * Run one reminder pass across all configured offsets.
 */
const runReminderPass = async () => {
  if (!isEmailConfigured()) {
    console.warn('Reminder service: EMAIL_USER/EMAIL_PASS not set — skipping reminder pass');
    return 0;
  }

  let total = 0;
  for (const offset of DEFAULT_OFFSET_DAYS) {
    try {
      total += await sendRemindersForOffset(offset);
    } catch (err) {
      console.error(`Reminder service: pass for offset ${offset}d failed:`, err.message);
    }
  }
  lastRun = new Date();
  if (total > 0) console.log(`Reminder service: sent ${total} reminder email(s)`);
  return total;
};

/**
 * Start the scheduled reminder loop. Idempotent.
 */
const startReminderScheduler = () => {
  if (scheduler) return scheduler;
  scheduler = setInterval(() => {
    runReminderPass().catch((err) => console.error('Reminder service: scheduler error:', err.message));
  }, CHECK_INTERVAL_MS);
  // Kick off first pass shortly after startup (avoid racing DB connection)
  setTimeout(() => {
    runReminderPass().catch(() => {});
  }, 30 * 1000);
  return scheduler;
};

const stopReminderScheduler = () => {
  if (scheduler) {
    clearInterval(scheduler);
    scheduler = null;
  }
};

module.exports = {
  runReminderPass,
  startReminderScheduler,
  stopReminderScheduler,
  findTripsDueForReminder,
  isEmailConfigured,
  getLastRun: () => lastRun,
};
