import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const workspaceRoots = ['apps', 'packages'];
const requiredScripts = {
  app: ['typecheck'],
  package: ['typecheck'],
};

function getWorkspaceKind(directory) {
  return directory.startsWith('apps/') ? 'app' : 'package';
}

async function listWorkspaceManifestPaths() {
  const manifests = [];

  for (const workspaceRoot of workspaceRoots) {
    const workspaceRootPath = path.join(rootDir, workspaceRoot);
    const entries = await readdir(workspaceRootPath, {
      withFileTypes: true,
    }).catch(() => []);

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const manifestPath = path.join(
        workspaceRootPath,
        entry.name,
        'package.json',
      );

      try {
        await readFile(manifestPath, 'utf8');
        manifests.push(path.relative(rootDir, manifestPath));
      } catch {
        // Some reserved workspace locations are intentionally placeholders until later issues.
      }
    }
  }

  return manifests.sort();
}

async function main() {
  const manifestPaths = await listWorkspaceManifestPaths();

  if (manifestPaths.length === 0) {
    throw new Error('No workspace package manifests were found.');
  }

  const failures = [];

  for (const manifestPath of manifestPaths) {
    const workspaceDir = path.dirname(manifestPath);
    const workspaceKind = getWorkspaceKind(workspaceDir);
    const manifest = JSON.parse(
      await readFile(path.join(rootDir, manifestPath), 'utf8'),
    );

    if (
      typeof manifest.name !== 'string' ||
      !manifest.name.startsWith('@ctb/')
    ) {
      failures.push(`${manifestPath}: workspace name must start with "@ctb/".`);
    }

    if (manifest.private !== true) {
      failures.push(
        `${manifestPath}: workspace must be private during Milestone 1 bootstrap.`,
      );
    }

    if (manifest.type !== 'module') {
      failures.push(`${manifestPath}: workspace must use "type": "module".`);
    }

    for (const scriptName of requiredScripts[workspaceKind]) {
      if (
        !manifest.scripts ||
        typeof manifest.scripts[scriptName] !== 'string'
      ) {
        failures.push(
          `${manifestPath}: missing required "${scriptName}" script.`,
        );
      }
    }

    if (
      workspaceKind === 'app' &&
      (!manifest.scripts || typeof manifest.scripts.start !== 'string')
    ) {
      failures.push(
        `${manifestPath}: app workspaces must expose a "start" script.`,
      );
    }
  }

  if (failures.length > 0) {
    throw new Error(failures.join('\n'));
  }

  console.log(
    `Validated package conventions for ${manifestPaths.length} workspace manifests.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
