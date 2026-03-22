/**
 * Start or create the local PostgreSQL container used for development.
 *
 * Why this script exists:
 * - Some local environments export DOCKER_API_VERSION with a value newer than the Docker engine.
 * - When that happens, direct docker commands fail with API version mismatch errors.
 * - We intentionally remove DOCKER_API_VERSION for child docker commands so negotiation can succeed.
 */
import { spawnSync } from 'node:child_process';

type CommandResult = {
  ok: boolean;
  stdout: string;
  stderr: string;
  status: number | null;
};

const CONTAINER_NAME = 'vibehealth-db';
const IMAGE_NAME = 'postgres:16-alpine';
const FALLBACK_API_VERSIONS = ['1.52', '1.51', '1.50', '1.49', '1.48', '1.47', '1.44', '1.41'];

let negotiatedApiVersion: string | undefined;

function cleanDockerEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env.DOCKER_API_VERSION;
  return env;
}

function runDockerRaw(args: string[], apiVersion?: string): CommandResult {
  const env = cleanDockerEnv();
  if (apiVersion) {
    env.DOCKER_API_VERSION = apiVersion;
  }

  const res = spawnSync('docker', args, {
    env,
    encoding: 'utf8'
  });

  return {
    ok: res.status === 0,
    stdout: res.stdout?.trim() ?? '',
    stderr: res.stderr?.trim() ?? '',
    status: res.status
  };
}

function runDocker(args: string[]): CommandResult {
  return runDockerRaw(args, negotiatedApiVersion);
}

function fail(message: string): never {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function ensureDockerAvailable(): void {
  let check = runDockerRaw(['version', '--format', '{{.Server.APIVersion}}']);

  const combinedOutput = [check.stderr, check.stdout].filter(Boolean).join('\n');
  const isApiMismatch = combinedOutput.toLowerCase().includes('supports the requested api version');

  if (!check.ok && isApiMismatch) {
    for (const apiVersion of FALLBACK_API_VERSIONS) {
      const retry = runDockerRaw(['version', '--format', '{{.Server.APIVersion}}'], apiVersion);
      if (retry.ok) {
        negotiatedApiVersion = apiVersion;
        check = retry;
        console.log(`ℹ️ Docker API fallback applied: v${apiVersion}`);
        break;
      }
    }
  }

  if (!check.ok) {
    const details = [check.stderr, check.stdout].filter(Boolean).join('\n');
    fail(
      [
        'Docker daemon is not reachable.',
        'Please start Docker Desktop and try again.',
        details || 'No additional error output from Docker.'
      ].join('\n')
    );
  }

  if (process.env.DOCKER_API_VERSION) {
    console.log(
      `ℹ️ Ignoring DOCKER_API_VERSION=${process.env.DOCKER_API_VERSION} for docker commands to avoid API mismatch.`
    );
  }
}

function containerExists(name: string): boolean {
  const inspect = runDocker(['container', 'inspect', name]);
  return inspect.ok;
}

function isContainerRunning(name: string): boolean {
  const status = runDocker(['inspect', '--format', '{{.State.Running}}', name]);
  return status.ok && status.stdout.toLowerCase() === 'true';
}

function startExistingContainer(name: string): void {
  const start = runDocker(['start', name]);
  if (!start.ok) {
    const details = [start.stderr, start.stdout].filter(Boolean).join('\n');
    fail(`Failed to start existing container "${name}".\n${details}`);
  }

  console.log(`✅ Started existing container "${name}".`);
}

function createContainer(name: string): void {
  const create = runDocker([
    'run',
    '--name',
    name,
    '-e',
    'POSTGRES_USER=vibehealth',
    '-e',
    'POSTGRES_PASSWORD=vibehealth_dev',
    '-e',
    'POSTGRES_DB=vibehealth',
    '-p',
    '5432:5432',
    '-d',
    IMAGE_NAME
  ]);

  if (!create.ok) {
    const details = [create.stderr, create.stdout].filter(Boolean).join('\n');
    fail(
      [
        `Failed to create container "${name}" using image "${IMAGE_NAME}".`,
        details
      ].join('\n')
    );
  }

  console.log(`✅ Created and started container "${name}".`);
}

function main(): void {
  ensureDockerAvailable();

  if (!containerExists(CONTAINER_NAME)) {
    createContainer(CONTAINER_NAME);
    return;
  }

  if (isContainerRunning(CONTAINER_NAME)) {
    console.log(`✅ Container "${CONTAINER_NAME}" is already running.`);
    return;
  }

  startExistingContainer(CONTAINER_NAME);
}

main();
