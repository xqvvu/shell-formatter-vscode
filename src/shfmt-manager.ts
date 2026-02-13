import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import type * as vscode from "vscode";
import { findExecutableOnPath, substituteVariables } from "@/path-utils";
import { installShfmtManagedBinary } from "@/shfmt-installer";

export type ShfmtSource = "user" | "path" | "managed";

export interface ResolvedShfmt {
  source: ShfmtSource;
  executablePath: string;
  version: string;
}

export class ShfmtManager {
  private installPromisesByVersion = new Map<string, Promise<void>>();

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly log: (line: string) => void,
  ) {}

  getManagedExecutablePath(version: string): string {
    const ext = process.platform === "win32" ? ".exe" : "";
    return path.join(
      this.context.globalStorageUri.fsPath,
      "shfmt",
      version,
      `shfmt${ext}`,
    );
  }

  async resolveShfmtExecutable(options: {
    version: string;
    executablePathSetting: string | null;
    autoDownload: boolean;
  }): Promise<ResolvedShfmt> {
    const { version, executablePathSetting, autoDownload } = options;

    if (executablePathSetting) {
      const resolved = substituteVariables(executablePathSetting);
      if (!(await isExecutable(resolved))) {
        throw new Error(
          `Configured "shellFormatter.executablePath" is not executable or does not exist: ${resolved}`,
        );
      }
      return { source: "user", executablePath: resolved, version };
    }

    const onPath = findExecutableOnPath("shfmt");
    if (onPath && (await isExecutable(onPath))) {
      return { source: "path", executablePath: onPath, version };
    }

    const managedPath = this.getManagedExecutablePath(version);
    const exists = await isExecutable(managedPath);
    if (!exists) {
      if (!autoDownload) {
        throw new Error(
          `shfmt is not available. Enable "shellFormatter.autoDownload" or configure "shellFormatter.executablePath".`,
        );
      }
      await this.ensureManagedBinaryInstalled(version);
    }

    return { source: "managed", executablePath: managedPath, version };
  }

  async prewarmIfNeeded(options: {
    version: string;
    executablePathSetting: string | null;
    autoDownload: boolean;
  }): Promise<void> {
    const { version, executablePathSetting, autoDownload } = options;
    if (!autoDownload) return;
    if (executablePathSetting) return;
    if (findExecutableOnPath("shfmt")) return;

    try {
      await this.ensureManagedBinaryInstalled(version);
    } catch (err: unknown) {
      // Don't block activation. We'll surface the error when formatting is invoked.
      this.log(`Prewarm shfmt failed: ${getErrorMessage(err)}`);
    }
  }

  async ensureManagedBinaryInstalled(version: string): Promise<void> {
    const existing = this.installPromisesByVersion.get(version);
    if (existing) return existing;

    const p = (async () => {
      const managedPath = this.getManagedExecutablePath(version);
      await ensureDirectory(path.dirname(managedPath));

      // If the file exists but isn't accessible/executable, re-install.
      const ok = await isExecutable(managedPath);
      if (ok) return;

      await installShfmtManagedBinary(version, managedPath, this.log);
    })();

    this.installPromisesByVersion.set(version, p);
    try {
      await p;
    } finally {
      // Allow retry on failure.
      this.installPromisesByVersion.delete(version);
    }
  }
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

async function ensureDirectory(dirPath: string): Promise<void> {
  await fsp.mkdir(dirPath, { recursive: true });
}

async function isExecutable(filePath: string): Promise<boolean> {
  try {
    // On Windows X_OK doesn't convey much; existence is enough.
    if (process.platform === "win32") {
      await fsp.access(filePath, fs.constants.F_OK);
    } else {
      await fsp.access(filePath, fs.constants.X_OK);
    }
    return true;
  } catch {
    return false;
  }
}
