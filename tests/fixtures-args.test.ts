import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildShfmtArgs } from "@/shfmt-args";
import { FIXTURE_MATRIX } from "~tests/fixtures/matrix";

const INPUT_DIR = path.resolve("tests/fixtures/input");
const EXPECTED_DIR = path.resolve("tests/fixtures/expected");

describe("fixture matrix completeness", () => {
  it("has matching input and expected files", () => {
    for (const m of FIXTURE_MATRIX) {
      const inputPath = path.join(INPUT_DIR, m.inputFile);
      const expectedPath = path.join(EXPECTED_DIR, m.expectedFile);

      expect(fs.existsSync(inputPath), `${m.id} input missing`).toBe(true);
      expect(fs.existsSync(expectedPath), `${m.id} expected missing`).toBe(
        true,
      );
      expect(fs.readFileSync(inputPath, "utf8").length).toBeGreaterThan(0);
      expect(fs.readFileSync(expectedPath, "utf8").length).toBeGreaterThan(0);
    }
  });
});

describe("buildShfmtArgs fixture matrix", () => {
  for (const m of FIXTURE_MATRIX) {
    it(m.id, () => {
      const actual = buildShfmtArgs({
        baseArgs: m.baseArgs,
        document: {
          languageId: m.languageId,
          fileName: m.fileName,
        },
        formatting: m.formatting,
      });

      expect(actual).toEqual(m.expectedArgs);
    });
  }
});
