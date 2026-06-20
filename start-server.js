const { spawn } = require('child_process');
const fs = require('fs');
const { execSync } = require('child_process');

function startServer() {
  // Kill any existing server
  try { execSync('pkill -f "next dev"'); } catch {}
  
  const child = spawn('npx', ['next', 'dev', '-p', '3000', '-H', '0.0.0.0'], {
    cwd: '/home/z/my-project',
    stdio: ['ignore', fs.openSync('/home/z/my-project/dev.log', 'w'), fs.openSync('/home/z/my-project/dev.log', 'a')],
    detached: true,
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=2048' }
  });

  fs.writeFileSync('/home/z/my-project/server.pid', child.pid.toString());
  child.unref();
  console.log('Server PID:', child.pid);
}

startServer();
