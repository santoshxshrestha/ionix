import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";

const EXEC_TIMEOUT_MS = 5000;

const BLOCKED_PATTERNS: RegExp[] = [
  /\b(open|xdg-open|start)\b/i,
  /\b(nano|vim|vi|less|more|top|htop|watch)\b/i,
  /\bssh\b/i,
  /\b(python|node)\b\s*$/i,
];

export async function POST(request: NextRequest) {
  try {
    const { command } = (await request.json()) as { command?: string };

    if (!command || typeof command !== "string") {
      return new NextResponse("Missing command", { status: 400 });
    }

    const trimmed = command.trim();
    if (!trimmed) {
      return new NextResponse("Missing command", { status: 400 });
    }

    if (isBlockedCommand(trimmed)) {
      return new NextResponse(
        `Can't run this command: blocked or interactive ("${trimmed}")`,
        { status: 400 }
      );
    }

    const output = await runCommand(trimmed);
    return new NextResponse(output, { status: 200 });
  } catch {
    return new NextResponse("Error processing the message", {
      status: 400,
    });
  }
}

function isBlockedCommand(command: string) {
  return BLOCKED_PATTERNS.some((re) => re.test(command));
}

async function runCommand(command: string) {
  return new Promise<string>((resolve, reject) => {
    const child = exec(
      command,
      { timeout: EXEC_TIMEOUT_MS, windowsHide: true },
      (error, stdout, stderr) => {
        if (error) {
          if ((error as { killed?: boolean; signal?: string }).killed) {
            reject(
              `Can't run this: command exceeded ${EXEC_TIMEOUT_MS}ms time limit`
            );
            return;
          }
          reject(`Error: ${error.message}`);
          return;
        }

        if (stderr && stderr.trim().length > 0) {
          reject(`Stderr: ${stderr}`);
          return;
        }

        resolve(stdout);
      }
    );

    child.on("error", (err) => reject(`Error: ${err.message}`));
  });
}
