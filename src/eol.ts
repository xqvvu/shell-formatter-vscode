import * as vscode from "vscode";

export function normalizeEolForDocument(
  text: string,
  eol: vscode.EndOfLine,
): string {
  if (eol === vscode.EndOfLine.CRLF) {
    // Convert LF and CRLF to CRLF.
    return text.replace(/\r?\n/g, "\r\n");
  }
  // Convert CRLF to LF.
  return text.replace(/\r\n/g, "\n");
}
