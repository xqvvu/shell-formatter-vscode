export interface ShfmtArgDocumentLike {
  languageId: string;
  fileName: string;
}

export interface ShfmtArgFormattingOptionsLike {
  insertSpaces: boolean;
  tabSize: number;
}

export function buildShfmtArgs(options: {
  baseArgs: string[];
  document: ShfmtArgDocumentLike;
  formatting: ShfmtArgFormattingOptionsLike;
}): string[] {
  const ctx = options;
  const args = [...ctx.baseArgs];

  // bats files need an explicit dialect.
  if (
    ctx.document.languageId === "bats" ||
    ctx.document.fileName.endsWith(".bats")
  ) {
    if (!args.some((a) => a.startsWith("--ln=") || a.startsWith("-ln="))) {
      args.push("--ln=bats");
    }
  }

  // Respect editor indentation if the user didn't explicitly set shfmt's indent.
  if (ctx.formatting.insertSpaces && !hasIndentFlag(args)) {
    args.push(`-i=${ctx.formatting.tabSize}`);
  }

  return args.filter((x) => typeof x === "string" && x.length > 0);
}

function hasIndentFlag(args: string[]): boolean {
  return args.some(
    (a) => a === "-i" || a.startsWith("-i=") || a.startsWith("-i"),
  );
}
