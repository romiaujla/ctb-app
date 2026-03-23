import { spawn } from 'node:child_process';

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? process.cwd(),
      env: { ...process.env, ...options.env },
      stdio: 'inherit',
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(`${command} ${args.join(' ')} exited with code ${code}`),
      );
    });
  });
}

async function main() {
  const withIntegration = process.argv.includes('--with-integration');

  await runCommand('pnpm', ['install', '--frozen-lockfile']);
  await runCommand('pnpm', ['db:generate']);
  await runCommand('pnpm', ['test']);

  if (withIntegration) {
    await runCommand('pnpm', ['test:integration']);
  }

  console.log(
    withIntegration
      ? 'Local bootstrap completed with baseline and integration tests.'
      : 'Local bootstrap completed with baseline tests. Re-run with --with-integration to exercise the containerized runtime harness.',
  );
}

void main();
