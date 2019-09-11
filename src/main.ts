import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as io from "@actions/io";
import * as tc from "@actions/tool-cache";

import { ExecOptions } from "@actions/exec/lib/interfaces";

import * as path from "path";

// tslint:disable:no-var-requires
const pj = require("../package.json");

async function execSuccess(commandLine: string, args?: string[] | undefined, options?: ExecOptions | undefined) {
  const ec: number = await exec.exec(commandLine, args, options);
  if (ec === 0) {
    return ec;
  } else {
    throw new Error("Command exited with non zero error code " + ec);
  }
}

async function restore() {
  core.startGroup("Restore cache");

  const moveOptions: io.MoveOptions = {
    force: true,
  };

  // Restore cargo and rustup
  try {
    core.debug("Restoring cargo");
    const cachedCargoPath: string = tc.find("cargo", pj.version + "-" + rustToolchain);
    await io.mv(cachedCargoPath, cargoPath, moveOptions);
  } catch (error) {
    core.error(error.message);
  }
  try {
    core.debug("Restoring rustup");
    const cachedRustupPath: string = tc.find("rustup", pj.version + "-" + rustToolchain);
    await io.mv(cachedRustupPath, rustupPath, moveOptions);
  } catch (error) {
    core.error(error.message);
  }

  core.endGroup();
}

async function prepare() {
  core.startGroup("Prepare setup");

  // Add ~/.cargo/bin to path
  if (!(process.env.PATH || "").includes(cargoBinPath)) {
    core.addPath(cargoBinPath);
  }

  core.endGroup();
}

async function install() {
  core.startGroup("Install and/or update Rust toolchain");

  try {
    // Check for rustup (enters catch arm on failure)
    core.debug("Checking for rustup installation");
    await io.which("rustup", true);
    core.debug("rustup is installed");

    // Update rustup itself
    core.debug("Updating rustup");
    await execSuccess("rustup self update");

    // Set default toolchain based on inputs
    core.debug("Setting default toolchain: " + rustToolchain);
    await execSuccess("rustup default", [rustToolchain]);

    // Update the toolchain
    await execSuccess("rustup update");
  } catch (error) {
    core.debug("rustup is not installed");

    // Download OS-specific installer
    core.debug("Downloading rustup");
    const installerPath: string = windows
      ? await tc.downloadTool("https://win.rustup.rs/")
      : await tc.downloadTool("https://sh.rustup.rs/");

    // Set installation args based on inputs
    const installerArgs: string[] = ["-y"];
    if (rustChannel.length > 0) {
      installerArgs.push("--default-toolchain " + rustChannel);
    }
    if (rustHost.length > 0) {
      installerArgs.push("--default-host " + rustHost);
    }

    // Run the installer
    core.debug("Installing rustup");
    if (windows) {
      await execSuccess(installerPath, installerArgs);
    } else {
      await execSuccess("sh " + installerPath + " --", installerArgs);
    }

    // Verifies the installation was successful
    core.debug("Veryfing rustup installation");
    await io.which("rustup", true);
  }

  // Install target
  core.debug("Installing target: " + rustTarget);
  if (rustTarget.length > 0) {
    await execSuccess("rustup target add" [rustTarget]);
  }

  core.endGroup();
}

async function cache() {
  core.startGroup("Cache");

  // Cache .cargo and .rustup
  try {
    core.debug("Caching cargo");
    await tc.cacheDir(cargoPath, "cargo", pj.version + "-" + rustToolchain);
  } catch (error) {
    core.error(error.message);
  }
  try {
    core.debug("Caching rustup");
    await tc.cacheDir(rustupPath, "rustup", pj.version + "-" + rustToolchain);
  } catch (error) {
    core.error(error.message);
  }

  core.endGroup();
}

async function run() {
  try {
    await restore();
    await prepare();
    await install();
    await cache();
  } catch (error) {
    core.setFailed(error.message);
  }
}

// System info
const windows: boolean = process.platform === "win32";

// Useful paths
const homePath: string = process.env.HOME || windows ? "%USERPROFILE%" : "~";
const cargoPath: string = path.join(homePath, ".cargo");
const cargoBinPath: string = path.join(cargoPath, "bin");
const rustupPath: string = path.join(homePath, ".rustup");

// Inputs
const rustChannel: string = core.getInput("rust-channel");
const rustHost: string = core.getInput("rust-host");
const rustTarget: string = core.getInput("rust-target");
const rustToolchain: string = rustChannel.length > 0
  ? rustChannel + (rustHost.length > 0 ? "-" + rustHost : "")
  : "stable";

run();
