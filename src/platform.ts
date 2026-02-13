export type ShfmtPlatform =
  | "darwin"
  | "linux"
  | "freebsd"
  | "netbsd"
  | "openbsd"
  | "windows";

export type ShfmtArch = "amd64" | "arm64" | "arm" | "386";

export function getShfmtPlatform(): ShfmtPlatform {
  switch (process.platform) {
    case "darwin":
      return "darwin";
    case "linux":
      return "linux";
    case "freebsd":
      return "freebsd";
    case "netbsd":
      return "netbsd";
    case "openbsd":
      return "openbsd";
    case "win32":
      return "windows";
    default:
      throw new Error(
        `Unsupported platform "${process.platform}". Configure "shellFormatter.executablePath" to use a custom shfmt.`,
      );
  }
}

export function getShfmtArch(): ShfmtArch {
  switch (process.arch) {
    case "x64":
      return "amd64";
    case "arm64":
      return "arm64";
    case "arm":
      return "arm";
    case "ia32":
      return "386";
    default:
      throw new Error(
        `Unsupported architecture "${process.arch}". Configure "shellFormatter.executablePath" to use a custom shfmt.`,
      );
  }
}

export function getShfmtExecutableExt(): string {
  return process.platform === "win32" ? ".exe" : "";
}
