import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as http from "http";
import { LanguageServerInfo } from "./detector";

export interface RestoreResult {
  total: number;
  restored: number;
  failed: number;
}

export function getConversationsDirectories(): string[] {
  const home = os.homedir();
  const dirs = [
    path.join(home, ".gemini", "antigravity-ide", "conversations"),
    path.join(home, ".gemini", "antigravity", "conversations"),
  ];
  return dirs.filter((d) => fs.existsSync(d));
}

export function listConversationIds(): string[] {
  const dirs = getConversationsDirectories();
  const ids = new Set<string>();

  for (const dir of dirs) {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (file.endsWith(".db") || file.endsWith(".pb")) {
          const id = file.replace(/\.(db|pb)$/, "");
          if (id) {
            ids.add(id);
          }
        }
      }
    } catch (err) {
      console.warn(`Could not read dir ${dir}:`, err);
    }
  }

  return Array.from(ids);
}

export async function awakenConversation(
  server: LanguageServerInfo,
  cascadeId: string
): Promise<boolean> {
  const payload = JSON.stringify({
    cascadeId,
    startIndex: 0,
    endIndex: 2,
  });

  for (const port of server.ports) {
    const success = await new Promise<boolean>((resolve) => {
      const req = http.request(
        {
          hostname: "127.0.0.1",
          port,
          path: "/exa.language_server_pb.LanguageServerService/GetCascadeTrajectorySteps",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Connect-Protocol-Version": "1",
            "X-Codeium-Csrf-Token": server.csrf,
            "Content-Length": Buffer.byteLength(payload),
          },
          timeout: 2000,
        },
        (res) => {
          if (res.statusCode === 200) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      );

      req.on("error", () => resolve(false));
      req.on("timeout", () => {
        req.destroy();
        resolve(false);
      });

      req.write(payload);
      req.end();
    });

    if (success) {
      return true;
    }
  }

  return false;
}
