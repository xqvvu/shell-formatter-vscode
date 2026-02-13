export interface FixtureCase {
  id: string;
  inputFile: string;
  expectedFile: string;
  languageId: string;
  fileName: string;
  baseArgs: string[];
  formatting: {
    insertSpaces: boolean;
    tabSize: number;
  };
  expectedArgs: string[];
}

export const FIXTURE_MATRIX: FixtureCase[] = [
  {
    id: "shellscript",
    inputFile: "get-acme.sh",
    expectedFile: "get-acme.sh",
    languageId: "shellscript",
    fileName: "get-acme.sh",
    baseArgs: [],
    formatting: { insertSpaces: true, tabSize: 2 },
    expectedArgs: ["-i=2"],
  },
  {
    id: "dockerfile",
    inputFile: "Dockerfile",
    expectedFile: "Dockerfile",
    languageId: "dockerfile",
    fileName: "Dockerfile",
    baseArgs: ["-mn"],
    formatting: { insertSpaces: false, tabSize: 2 },
    expectedArgs: ["-mn"],
  },
  {
    id: "dotenv",
    inputFile: ".env.example",
    expectedFile: ".env.example",
    languageId: "dotenv",
    fileName: ".env.example",
    baseArgs: [],
    formatting: { insertSpaces: true, tabSize: 4 },
    expectedArgs: ["-i=4"],
  },
  {
    id: "hosts",
    inputFile: "hosts",
    expectedFile: "hosts",
    languageId: "hosts",
    fileName: "hosts",
    baseArgs: ["-i=8"],
    formatting: { insertSpaces: true, tabSize: 2 },
    expectedArgs: ["-i=8"],
  },
  {
    id: "properties",
    inputFile: "application.properties",
    expectedFile: "application.properties",
    languageId: "properties",
    fileName: "application.properties",
    baseArgs: [],
    formatting: { insertSpaces: true, tabSize: 2 },
    expectedArgs: ["-i=2"],
  },
  {
    id: "jvmoptions",
    inputFile: "idea.vmoptions",
    expectedFile: "idea.vmoptions",
    languageId: "jvmoptions",
    fileName: "idea.vmoptions",
    baseArgs: [],
    formatting: { insertSpaces: true, tabSize: 2 },
    expectedArgs: ["-i=2"],
  },
  {
    id: "azcli",
    inputFile: "azure.azcli",
    expectedFile: "azure.azcli",
    languageId: "azcli",
    fileName: "azure.azcli",
    baseArgs: ["-ci"],
    formatting: { insertSpaces: false, tabSize: 2 },
    expectedArgs: ["-ci"],
  },
  {
    id: "bats",
    inputFile: "bats.bats",
    expectedFile: "bats.bats",
    languageId: "bats",
    fileName: "bats.bats",
    baseArgs: [],
    formatting: { insertSpaces: true, tabSize: 2 },
    expectedArgs: ["--ln=bats", "-i=2"],
  },
  {
    id: "bats-custom-ln",
    inputFile: "bats.bats",
    expectedFile: "bats.bats",
    languageId: "bats",
    fileName: "bats.bats",
    baseArgs: ["--ln=bats", "-i=4"],
    formatting: { insertSpaces: true, tabSize: 2 },
    expectedArgs: ["--ln=bats", "-i=4"],
  },
];
