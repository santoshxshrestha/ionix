import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";

export async function POST(request: NextRequest) {
  try {
    const { command } = await request.json();
    const output = await runComand(command);
    return new NextResponse(output, { status: 200 });
  } catch {
    return new NextResponse("Error processing the message", {
      status: 400,
    });
  }
}

async function runComand(command: string) {
  return new Promise<string>((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
      } else if (stderr) {
        reject(`Stderr: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
}
