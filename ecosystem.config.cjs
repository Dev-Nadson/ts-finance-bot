module.exports = {
  apps: [
    {
      name: "finance-bot",
      script: "src/bot/server.ts",
      interpreter: "node",
      interpreter_args:
        "--no-network-family-autoselection --dns-result-order=ipv4first --import tsx",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
      },
      autorestart: true,
      max_restarts: 10,
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "300M",
      time: true, // prefix logs with timestamps
    },
  ],
};
