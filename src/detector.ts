import * as os from "os";
import { execSync } from "child_process";

export interface LanguageServerInfo {
  pid: number;
  csrf: string;
  ports: number[];
}

export function detectLanguageServer(): LanguageServerInfo | null {
  const platform = os.platform();
  let pidsWithCsrf: { pid: number; csrf: string }[] = [];

  try {
    if (platform === "linux" || platform === "darwin") {
      const pgrepOut = execSync("pgrep -f language_server", {
        encoding: "utf-8",
        timeout: 4000,
      }).trim();
      const pids = pgrepOut
        .split("\n")
        .map((p) => parseInt(p.trim(), 10))
        .filter((n) => !isNaN(n));

      for (const pid of pids) {
        try {
          const cmd = execSync(`ps -p ${pid} -o args=`, {
            encoding: "utf-8",
            timeout: 3000,
          }).trim();
          const match = cmd.match(/--csrf_token\s+([a-f0-9\-]+)/);
          if (match && match[1]) {
            pidsWithCsrf.push({ pid, csrf: match[1] });
          }
        } catch {
          // Process might have finished or no permission
        }
      }
    } else if (platform === "win32") {
      const psScript = `powershell -Command "Get-CimInstance Win32_Process | Where-Object { $_.Name -like 'language_server*' } | Select-Object ProcessId, CommandLine | ConvertTo-Json"`;
      const out = execSync(psScript, { encoding: "utf-8", timeout: 8000 }).trim();
      if (out) {
        let processes = JSON.parse(out);
        if (!Array.isArray(processes)) {
          processes = [processes];
        }
        for (const p of processes) {
          const cmd = p.CommandLine || "";
          const match = cmd.match(/--csrf_token\s+([a-f0-9\-]+)/);
          if (match && match[1]) {
            pidsWithCsrf.push({ pid: p.ProcessId, csrf: match[1] });
          }
        }
      }
    }
  } catch (err) {
    console.warn("Error detecting language server processes:", err);
  }

  if (pidsWithCsrf.length === 0) {
    return null;
  }

  // Find ports for the discovered PIDs
  const primary = pidsWithCsrf[0];
  const ports = findListenPorts(primary.pid);

  return {
    pid: primary.pid,
    csrf: primary.csrf,
    ports,
  };
}

function findListenPorts(pid: number): number[] {
  const ports: number[] = [];
  const platform = os.platform();

  try {
    if (platform === "linux" || platform === "darwin") {
      const lsofOut = execSync(`lsof -p ${pid} -i -P -n 2>/dev/null || true`, {
        encoding: "utf-8",
        timeout: 4000,
      });
      for (const line of lsofOut.split("\n")) {
        if (line.includes("LISTEN")) {
          const m = line.match(/:(\d+)\s+\(LISTEN\)/);
          if (m && m[1]) {
            ports.push(parseInt(m[1], 10));
          }
        }
      }
    } else if (platform === "win32") {
      const netstat = execSync("netstat -ano", {
        encoding: "utf-8",
        timeout: 6000,
      });
      const pidStr = String(pid);
      for (const line of netstat.split("\n")) {
        if (line.includes("LISTENING") && line.endsWith(pidStr)) {
          const m = line.match(/127\.0\.0\.1:(\d+)/);
          if (m && m[1]) {
            ports.push(parseInt(m[1], 10));
          }
        }
      }
    }
  } catch (err) {
    console.warn(`Error finding ports for PID ${pid}:`, err);
  }

  return Array.from(new Set(ports));
}
