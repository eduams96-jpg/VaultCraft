import { execFile } from "child_process";

/**
 * Protocolos de lojas/launchers que podem ser abertos a partir do campo "executável".
 * Qualquer outro esquema (file:, javascript:, ms-settings:, etc.) é recusado.
 */
const ALLOWED_LAUNCH_PROTOCOLS = new Set([
  "steam:",
  "com.epicgames.launcher:",
  "goggalaxy:",
  "uplay:",
  "origin:",
  "origin2:",
  "battlenet:",
  "http:",
  "https:",
]);

/** Devolve o URL normalizado se for um protocolo de launcher permitido; caso contrário null. */
export function parseLaunchUrl(value: string): string | null {
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) return null;
  try {
    const url = new URL(value);
    return ALLOWED_LAUNCH_PROTOCOLS.has(url.protocol.toLowerCase()) ? url.href : null;
  } catch {
    return null;
  }
}

/** True quando o valor tem forma de URL (esquema://...), permitido ou não. */
export function looksLikeUrl(value: string): boolean {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(value);
}

const PS_OPEN_SCRIPT = [
  "$ErrorActionPreference = 'Stop'",
  "$psi = New-Object System.Diagnostics.ProcessStartInfo",
  "$psi.FileName = $env:VAULTCRAFT_OPEN_TARGET",
  "$psi.UseShellExecute = $true",
  "if ($env:VAULTCRAFT_OPEN_CWD) { $psi.WorkingDirectory = $env:VAULTCRAFT_OPEN_CWD }",
  "[void][System.Diagnostics.Process]::Start($psi)",
].join("; ");

/**
 * Abre um ficheiro, pasta ou URL com a aplicação associada no Windows (ShellExecute).
 *
 * O alvo e a pasta de trabalho seguem por variáveis de ambiente, nunca pela linha de
 * comandos: assim caracteres como & | % ^ , [ ] nos caminhos não são interpretados por
 * nenhuma shell (o antigo `cmd /c start` partia-se — ou executava outra coisa — com `&`).
 */
export function shellOpen(target: string, cwd?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", PS_OPEN_SCRIPT],
      {
        windowsHide: true,
        timeout: 20_000,
        env: {
          ...process.env,
          VAULTCRAFT_OPEN_TARGET: target,
          VAULTCRAFT_OPEN_CWD: cwd || "",
        },
      },
      (err, _stdout, stderr) => {
        if (err) {
          reject(new Error(stderr?.trim() || err.message));
        } else {
          resolve();
        }
      }
    );
  });
}
