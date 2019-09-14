import * as core from "@actions/core";
import * as exec from "@actions/exec";
import { ExecOptions } from "@actions/exec/lib/interfaces";
import * as path from "path";

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

export function addCargoBinPath(cargoPath: string) {
  const cargoBinPath: string = path.join(cargoPath, "bin");
  const envPath: string = process.env.PATH || "";
  if (!envPath.includes(cargoBinPath)) {
    core.debug("Adding .cargo/bin to PATH");
    core.addPath(cargoBinPath);
  }
}
