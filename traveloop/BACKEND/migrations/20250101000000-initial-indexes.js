module.exports = {
  async up(db) {
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('trips').createIndex({ user: 1, startDate: -1 });
    await db.collection('trips').createIndex({ shareId: 1 });
    await db.collection('destinations').createIndex({ name: 'text', country: 'text' });
    await db.collection('notifications').createIndex({ user: 1, read: 1 });
  },

  async down(db) {
    await db.collection('users').dropIndex('email_1');
    await db.collection('trips').dropIndex('user_1_startDate_-1');
    await db.collection('trips').dropIndex('shareId_1');
    await db.collection('destinations').dropIndex('name_text_country_text');
    await db.collection('notifications').dropIndex('user_1_read_1');
  },
};