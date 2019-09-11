import * as exec from "@actions/exec";
import { ExecOptions } from "@actions/exec/lib/interfaces";

export async function aExec(commandLine: string, args?: string[], options?: ExecOptions) {
    const ec: number = await exec.exec(commandLine, args, options);
    if (ec === 0) {
      return ec;
    } else {
      throw new Error("Command exited with non zero error code: " + ec);
    }
  }

export async function aForeach<T>(array: T[], callback: (element: T) => Promise<void>) {
  for (const element of array) {
    await callback(element);
  }
}

export function parseRustToolchain(rustChannel: string, rustHost: string): string {
  return rustChannel.length > 0
    ? rustChannel + (rustHost.length > 0 ? "-" + rustHost : "")
    : "stable";
}
