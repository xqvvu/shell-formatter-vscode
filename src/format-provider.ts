import * as vscode from "vscode";
import { normalizeEolForDocument } from "@/eol";
import { buildShfmtArgs } from "@/shfmt-args";
import type { ShfmtManager } from "@/shfmt-manager";
import { runShfmt } from "@/shfmt-runner";

export class ShellFormatProvider
  implements vscode.DocumentFormattingEditProvider
{
  constructor(
    private readonly shfmtManager: ShfmtManager,
    private readonly diagnosticCollection: vscode.DiagnosticCollection,
    private readonly getSettings: () => {
      version: string;
      executablePathSetting: string | null;
      autoDownload: boolean;
      args: string[];
      logLevel: "info" | "debug";
    },
    private readonly log: (line: string) => void,
  ) {}

  async provideDocumentFormattingEdits(
    document: vscode.TextDocument,
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken,
  ): Promise<vscode.TextEdit[]> {
    this.diagnosticCollection.delete(document.uri);

    const settings = this.getSettings();
    const resolved = await this.shfmtManager.resolveShfmtExecutable({
      version: settings.version,
      executablePathSetting: settings.executablePathSetting,
      autoDownload: settings.autoDownload,
    });

    const args = buildShfmtArgs({
      baseArgs: settings.args,
      document,
      formatting: options,
    });

    if (settings.logLevel === "debug") {
      this.log(`shfmt source: ${resolved.source}`);
      this.log(`shfmt path: ${resolved.executablePath}`);
      this.log(`shfmt args: ${JSON.stringify(args)}`);
    }

    const input = document.getText();
    const result = await runShfmt({
      executablePath: resolved.executablePath,
      args,
      input,
      token,
    });

    if (token.isCancellationRequested) return [];

    if (result.exitCode === 0) {
      const formatted = normalizeEolForDocument(result.stdout, document.eol);
      const normalizedInput = normalizeEolForDocument(input, document.eol);
      if (formatted === normalizedInput) return [];

      return [vscode.TextEdit.replace(fullDocumentRange(document), formatted)];
    }

    const errText =
      (result.stderr || "").trim() ||
      `shfmt exited with code ${result.exitCode}`;
    this.log(`shfmt error: ${errText}`);

    const diag = parseShfmtStdinDiagnostic(errText);
    if (diag) {
      this.diagnosticCollection.set(document.uri, [diag]);
    }

    // Let VS Code surface the error to the user as needed.
    throw new Error(errText);
  }
}

function fullDocumentRange(document: vscode.TextDocument): vscode.Range {
  const start = new vscode.Position(0, 0);
  const lastLine = Math.max(0, document.lineCount - 1);
  const end = document.lineAt(lastLine).range.end;
  return new vscode.Range(start, end);
}

function parseShfmtStdinDiagnostic(stderr: string): vscode.Diagnostic | null {
  // Example: "<standard input>:3:5: unexpected EOF"
  const m = /^<standard input>:(\d+):(\d+):\s*(.*)$/.exec(stderr);
  if (!m) return null;

  const line1 = Number.parseInt(m[1] ?? "", 10);
  const col1 = Number.parseInt(m[2] ?? "", 10);
  if (!Number.isFinite(line1) || !Number.isFinite(col1)) return null;

  const line0 = Math.max(0, line1 - 1);
  const col0 = Math.max(0, col1 - 1);
  const pos = new vscode.Position(line0, col0);

  return new vscode.Diagnostic(
    new vscode.Range(pos, pos),
    m[3] ? m[3] : stderr,
    vscode.DiagnosticSeverity.Error,
  );
}
