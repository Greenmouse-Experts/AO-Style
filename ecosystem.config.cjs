module.exports = {
  apps: [
    {
      name: `web-beta`,
      script: 'npm',
      args: 'run preview',
      env: {
        PM2_SERVE_PATH: './dist',
        PM2_SERVE_PORT: 5173,
        PM2_SERVE_SPA: 'true',
        NODE_ENV: 'production',
      },
    },
  ],
};
