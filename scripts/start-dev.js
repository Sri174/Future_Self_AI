const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Genkit server...');
const genkitProcess = spawn('npm', ['run', 'genkit:dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname, '..')
});

// Wait for Genkit to start, then start Next.js
setTimeout(() => {
  console.log('Starting Next.js...');
  const nextProcess = spawn('npm', ['run', 'next:dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.resolve(__dirname, '..')
  });

  // Handle cleanup
  process.on('SIGINT', () => {
    console.log('Shutting down...');
    genkitProcess.kill();
    nextProcess.kill();
    process.exit();
  });
}, 5000);