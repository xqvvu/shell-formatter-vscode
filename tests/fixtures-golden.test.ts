import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runShfmt } from "@/shfmt-runner";
import { FIXTURE_MATRIX } from "~tests/fixtures/matrix";

const INPUT_DIR = path.resolve("tests/fixtures/input");
const EXPECTED_DIR = path.resolve("tests/fixtures/expected");

function findShfmtOnPath(): string | null {
  const rawPath = process.env.PATH ?? "";
  for (const p of rawPath.split(path.delimiter).filter(Boolean)) {
    const candidate = path.join(
      p,
      process.platform === "win32" ? "shfmt.exe" : "shfmt",
    );
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

const shfmtPath = findShfmtOnPath();
const runnableCases = FIXTURE_MATRIX.filter((m) => m.id !== "bats-custom-ln");

describe("fixture golden outputs", () => {
  if (!shfmtPath) {
    it("skips when shfmt is not installed", () => {
      expect(true).toBe(true);
    });
    return;
  }

  for (const c of runnableCases) {
    it(c.id, async () => {
      const input = fs.readFileSync(path.join(INPUT_DIR, c.inputFile), "utf8");
      const expected = fs.readFileSync(
        path.join(EXPECTED_DIR, c.expectedFile),
        "utf8",
      );

      const result = await runShfmt({
        executablePath: shfmtPath,
        args: c.expectedArgs,
        input,
      });

      expect(result.exitCode).toBe(0);
      expect(result.stderr).toBe("");
      expect(result.stdout).toBe(expected);
    });
  }
});
