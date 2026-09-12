module.exports = {
  apps: [
    {
      name: 'thenexopp-api',
      script: 'server/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 8081,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8081,
      },
      watch: false,
      max_memory_restart: '1G',
      error_file: 'logs/pm2-website-error.log',
      out_file: 'logs/pm2-website-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      name: 'thenexopp-backend',
      script: 'thenexopp app/nexopp-app/backend/dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      watch: false,
      max_memory_restart: '1G',
      error_file: 'logs/pm2-agent-error.log',
      out_file: 'logs/pm2-agent-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
