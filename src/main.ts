import * as core from "@actions/core";
import * as path from "path";
import { cache, restore } from "./cache";
import install from "./install";
import prepare from "./prepare";
import { ICustomInstalls } from "./types";
import verify from "./verify";

async function run() {
  // System info
  const windows: boolean = process.platform === "win32";

  // Useful paths
  const homePath: string = process.env.HOME || (windows ? "%USERPROFILE%" : "~");
  const cargoPath: string = process.env.CARGO_HOME || path.join(homePath, ".cargo");
  const rustupPath: string = process.env.RUSTUP_HOME || path.join(homePath, ".rustup");
  const repoName: string = ((process.env.GITHUB_REPOSITORY || "user/repo").split("/").pop()) || "repo";
  const workspacePath: string = process.env.GITHUB_WORKSPACE || path.join(homePath, "work", repoName, repoName);
  const targetPath: string = path.join(workspacePath, "target");

  // Inputs
  const rustChannel: string = core.getInput("rust-channel");
  const rustHost: string = core.getInput("rust-host");
  const rustTarget: string = core.getInput("rust-target");
  const installRustfmt: boolean = core.getInput("install-rustfmt") === "true";
  const installClippy: boolean = core.getInput("install-clippy") === "true";
  const installCross: boolean = core.getInput("install-cross") === "true";
  const customInstalls: ICustomInstalls = {
    rustfmt: installRustfmt,
    clippy: installClippy,
    cross: installCross,
  };
  const enableCache: boolean = core.getInput("cache") === "true";

  try {
    if (enableCache) {
      await restore(cargoPath, rustupPath, targetPath);
    }
    await prepare(cargoPath);
    await install(rustChannel, rustHost, rustTarget, customInstalls);
    await verify(customInstalls);
    if (enableCache) {
      await cache(cargoPath, rustupPath, targetPath);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
