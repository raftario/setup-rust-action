import * as core from "@actions/core";
import * as path from "path";
import { cache, restore } from "./cache";
import install from "./install";
import prepare from "./prepare";

async function run() {
  // System info
  const windows: boolean = process.platform === "win32";

  // Useful paths
  const homePath: string = process.env.HOME || (windows ? "%USERPROFILE%" : "~");
  const cargoPath: string = process.env.CARGO_HOME || path.join(homePath, ".cargo");
  const rustupPath: string = process.env.RUSTUP_HOME || path.join(homePath, ".rustup");

  // Inputs
  const rustChannel: string = core.getInput("rust-channel");
  const rustHost: string = core.getInput("rust-host");
  const rustTarget: string = core.getInput("rust-target");
  const installCross: boolean = core.getInput("install-cross") === "true";
  const targetAliases: boolean = core.getInput("target-aliases") === "true";
  const allAliases: boolean = core.getInput("target-aliases") === "true";

  try {
    await restore(cargoPath, rustupPath, rustChannel, rustHost);
    await prepare(cargoPath, rustTarget, installCross, targetAliases, allAliases);
    await install(rustChannel, rustHost, rustTarget, installCross);
    await cache(cargoPath, rustupPath, rustChannel, rustHost);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
