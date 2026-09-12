module.exports = {
  apps: [
    {
      name: 'thenexopp-backend',
      script: 'dist/main.js',
      cwd: '/opt/thenexopp-agent/backend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_TYPE: 'sqlite',
        DATABASE_STORAGE: '/opt/thenexopp-agent/backend/thenexopp_agent_dev.sqlite',
        JWT_SECRET: 'tnx_access_secret_super_secure_key_987654321_2026_prod',
        JWT_EXPIRATION: '7d',
        STORAGE_TYPE: 'local',
        UPLOADS_DIR: '/opt/thenexopp-agent/backend/uploads',
      },
    },
  ],
};
