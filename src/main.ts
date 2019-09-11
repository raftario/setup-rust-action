import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as io from "@actions/io";
import * as tc from "@actions/tool-cache";

import { ExecOptions } from "@actions/exec/lib/interfaces";

import * as path from "path";

const pjPath = path.join(__dirname, "..", "package.json");
// tslint:disable:no-var-requires
const pj = require(pjPath);

async function aExec(commandLine: string, args?: string[], options?: ExecOptions) {
  const ec: number = await exec.exec(commandLine, args, options);
  if (ec === 0) {
    return ec;
  } else {
    throw new Error("Command exited with non zero error code: " + ec);
  }
}

async function aForeach<T>(array: T[], callback: (element: T) => Promise<void>) {
  for (const element of array) {
    await callback(element);
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
    const cachedCargoPath: string = tc.find("cargo", `${pj.version}-${rustToolchain}`);
    await io.mv(cachedCargoPath, cargoPath, moveOptions);
  } catch (error) {
    core.error(error.message);
  }
  try {
    core.debug("Restoring rustup");
    const cachedRustupPath: string = tc.find("rustup", `${pj.version}-${rustToolchain}`);
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

  // Create aliases
  if (targetAliases || allAliases && !windows) {
    // Commands affected by target and --all
    const commands: string[] = [
      "cargo build",
      "cargo run",
      "cargo test",
      "cargo bench",
    ];
    if (installCross) {
      commands.concat([
        "cross build",
        "cross run",
        "cross test",
        "cross bench",
      ]);
    }

    // Create target aliases
    if (targetAliases && rustTarget.length > 0) {
      core.debug("Creating target aliases");

      // Commands affected by target
      const targetCommands: string[] = [
        "rustc",
      ];
      commands.concat(targetCommands);

      aForeach(commands, async (command) => {
        await aExec(`alias ${command}='${command} --target ${rustTarget}'`);
      });

      commands.filter((command) => !targetCommands.includes(command));
    }

    // Create --all aliases
    if (allAliases) {
      core.debug("Creating --all aliases");

      // Commands affected by --all
      const allCommands: string[] = [
        "cargo check",
        "cargo doc",
      ];
      if (installCross) {
        allCommands.concat([
          "cross check",
          "cross doc",
        ]);
      }
      commands.concat(allCommands);

      aForeach(commands, async (command) => {
        await aExec(`alias ${command}='${command} --all'`);
      });

      commands.filter((command) => !allCommands.includes(command));
    }
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
    await aExec("rustup self update");

    // Set default toolchain based on inputs
    core.debug("Setting default toolchain: " + rustToolchain);
    await aExec("rustup default", [rustToolchain]);

    // Update the toolchain
    await aExec("rustup update");
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
      await aExec(installerPath, installerArgs);
    } else {
      await aExec(`sh ${installerPath} --`, installerArgs);
    }

    // Verifies the installation was successful
    core.debug("Veryfing rustup installation");
    await io.which("rustup", true);
  }

  // Install target
  if (rustTarget.length > 0) {
    core.debug("Installing target: " + rustTarget);
    await aExec("rustup target add", [rustTarget]);
  }

  // Install cross
  if (installCross) {
    core.debug("Installing cross");
    await aExec("cargo install", ["cross"]);
  }

  core.endGroup();
}

async function cache() {
  core.startGroup("Cache");

  // Cache .cargo and .rustup
  try {
    core.debug("Caching cargo");
    await tc.cacheDir(cargoPath, "cargo", `${pj.version}-${rustToolchain}`);
  } catch (error) {
    core.error(error.message);
  }
  try {
    core.debug("Caching rustup");
    await tc.cacheDir(rustupPath, "rustup", `${pj.version}-${rustToolchain}`);
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
const installCross: boolean = core.getInput("install-cross") === "true";
const targetAliases: boolean = core.getInput("target-aliases") === "true";
const allAliases: boolean = core.getInput("target-aliases") === "true";

const rustToolchain: string = rustChannel.length > 0
  ? rustChannel + (rustHost.length > 0 ? "-" + rustHost : "")
  : "stable";

run();
