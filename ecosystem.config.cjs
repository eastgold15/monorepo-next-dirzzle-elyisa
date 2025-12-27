"use strict";
/**
 * PM2 生态系统配置文件
 *
 * 使用方式：
 * - 启动所有应用: pm2 start ecosystem.config.js
 * - 只启动 b2badmin: pm2 start ecosystem.config.js --only b2badmin
 * - 只启动 web: pm2 start ecosystem.config.js --only web
 * - 重启所有: pm2 restart ecosystem.config.js
 * - 停止所有: pm2 stop ecosystem.config.js
 * - 删除所有: pm2 delete ecosystem.config.js
 * - 查看日志: pm2 logs
 * - 监控: pm2 monit
 *
 * 保存当前进程列表: pm2 save
 * 开机自启: pm2 startup
 */

// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "b2badmin",
      script: "node_modules/.bin/next",
      cwd: "./apps/b2badmin",
      args: "start",
      instances: 1,
      exec_mode: "fork", // 更安全
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 9001, // 统一使用生产端口
      },
      error_file: "./logs/b2badmin-error.log",
      out_file: "./logs/b2badmin-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      interpreter: "bun", // Bun 运行时
    },
    {
      name: "web",
      script: "node_modules/.bin/next",
      cwd: "./apps/web",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 9003,
      },
      error_file: "./logs/web-error.log",
      out_file: "./logs/web-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      interpreter: "bun",
    },
  ],
};
