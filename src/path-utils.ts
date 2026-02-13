import fs from "node:fs";
import path from "node:path";
import * as vscode from "vscode";

export function substituteVariables(inputPath: string): string {
  const workspaceFolder =
    vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "";

  return inputPath
    .replace(/\${workspaceRoot}/g, workspaceFolder)
    .replace(/\${workspaceFolder}/g, workspaceFolder);
}

export function findExecutableOnPath(toolName: string): string | null {
  const corrected = correctBinName(toolName);
  if (path.isAbsolute(corrected)) return corrected;

  const rawPath = process.env.PATH ?? "";
  const parts = rawPath.split(path.delimiter).filter(Boolean);
  for (const p of parts) {
    const candidate = path.join(p, corrected);
    if (isFile(candidate)) return candidate;
  }
  return null;
}

function correctBinName(binName: string): string {
  if (process.platform === "win32" && path.extname(binName) !== ".exe") {
    return `${binName}.exe`;
  }
  return binName;
}

function isFile(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}
