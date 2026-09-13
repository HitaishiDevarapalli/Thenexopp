module.exports = {
  apps: [
    {
      name: 'thenexopp-api',
      script: 'server/server.js',
      cwd: '/opt/Thenexopp',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 8081,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8081,
      },
    },
    {
      name: 'thenexopp-backend',
      script: 'dist/main.js',
      cwd: '/opt/Thenexopp/thenexopp app/nexopp-app/backend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        AGENT_PORT: 3000,
        DATABASE_TYPE: 'sqlite',
        DATABASE_STORAGE: '/opt/Thenexopp/thenexopp app/nexopp-app/backend/thenexopp_agent_dev.sqlite',
        MSG91_AUTH_KEY: '557093Aca5G41bF6a7d8d93P1',
        MSG91_TEMPLATE_ID: '6a95648afdf721447f020ac2',
        OTP_SENDER_ID: 'THNXPP',
        ALLOW_TEST_OTP: 'true',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        AGENT_PORT: 3000,
        DATABASE_TYPE: 'sqlite',
        DATABASE_STORAGE: '/opt/Thenexopp/thenexopp app/nexopp-app/backend/thenexopp_agent_dev.sqlite',
        MSG91_AUTH_KEY: '557093Aca5G41bF6a7d8d93P1',
        MSG91_TEMPLATE_ID: '6a95648afdf721447f020ac2',
        OTP_SENDER_ID: 'THNXPP',
        ALLOW_TEST_OTP: 'true',
      },
    },
  ],
};


