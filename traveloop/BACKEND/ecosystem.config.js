module.exports = {
  apps: [
    {
      name: 'traveloop-api',
      script: 'server.js',
      cwd: __dirname,
      instances: process.env.INSTANCES || 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 5000,
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 4000,
      },
      max_memory_restart: '512M',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      kill_timeout: 10000,
      listen_timeout: 15000,
      shutdown_with_message: true,
      max_restarts: 10,
      restart_delay: 5000,
      watch: false,
      ignore_watch: ['node_modules', 'logs', '__tests__', '.git'],
    },
  ],
};