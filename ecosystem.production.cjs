module.exports = {
  apps: [
    {
      name: 'thenexopp-api',
      script: 'server/server.js',
      cwd: '/opt/Thenexopp',
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
      error_file: '/opt/Thenexopp/logs/pm2-website-error.log',
      out_file: '/opt/Thenexopp/logs/pm2-website-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      name: 'thenexopp-backend',
      script: 'dist/main.js',
      cwd: '/opt/Thenexopp/thenexopp app/nexopp-app/backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_TYPE: 'sqlite',
        DATABASE_STORAGE: '/opt/Thenexopp/thenexopp app/nexopp-app/backend/thenexopp_agent_dev.sqlite',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_TYPE: 'sqlite',
        DATABASE_STORAGE: '/opt/Thenexopp/thenexopp app/nexopp-app/backend/thenexopp_agent_dev.sqlite',
      },
      watch: false,
      max_memory_restart: '1G',
      error_file: '/opt/Thenexopp/logs/pm2-agent-error.log',
      out_file: '/opt/Thenexopp/logs/pm2-agent-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};

