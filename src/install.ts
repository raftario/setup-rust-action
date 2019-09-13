import * as core from "@actions/core";
import * as io from "@actions/io";
import * as tc from "@actions/tool-cache";
import { aExec, parseRustToolchain } from "./misc";

export default async function install(
  rustChannel: string,
  rustHost: string,
  rustTarget: string,
  installCross: boolean,
) {
  core.startGroup("Install and/or update Rust toolchain");

  const windows: boolean = process.platform === "win32";
  const rustToolchain: string = parseRustToolchain(rustChannel, rustHost);

  let rustupBin: string = "";

  try {
    // Check for rustup (enters catch arm on failure)
    core.debug("Checking for rustup installation");
    rustupBin = await io.which("rustup", true);
    core.debug("rustup is installed");

    // Update rustup itself
    core.debug("Updating rustup");
    await aExec(rustupBin, ["self", "update"]);

    // Set default toolchain based on inputs
    core.debug("Setting default toolchain: " + rustToolchain);
    await aExec(rustupBin, ["default", rustToolchain]);

    // Update the toolchain
    await aExec(rustupBin, ["update"]);
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
      installerArgs.push("--default-toolchain");
      installerArgs.push(rustChannel);
    }
    if (rustHost.length > 0) {
      installerArgs.push("--default-host");
      installerArgs.push(rustHost);
    }

    // Run the installer
    core.debug("Installing rustup");
    if (!windows) {
      await aExec("chmod", ["+x", installerPath]);
    }
    await aExec(installerPath, installerArgs);
  }

  // Get rustup binary path
  if (rustupBin.length < 0) {
    rustupBin = await io.which("rustup", true);
  }

  // Install target
  if (rustTarget.length > 0) {
    core.debug("Installing target: " + rustTarget);
    await aExec(rustupBin, ["target", "add", rustTarget]);
  }

  // Install cross
  if (installCross) {
    core.debug("Installing cross");
    const cargoBin: string = await io.which("cargo", true);
    await aExec(cargoBin, ["install", "cross"]);
  }

  core.endGroup();
}
