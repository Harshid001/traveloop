const { env } = require('./src/config/env');

const config = {
  mongodb: {
    url: env.MONGO_URI,
    databaseName: 'traveloop',
    options: {},
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js',
  useFileHash: false,
  moduleSystem: 'commonjs',
};

module.exports = config;