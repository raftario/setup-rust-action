import * as core from "@actions/core";
import * as path from "path";
import { aExec, aForeach } from "./misc";

export default async function prepare(
  cargoPath: string,
  rustTarget: string,
  installCross: boolean,
  targetAliases: boolean,
  allAliases: boolean,
) {
  core.startGroup("Prepare setup");

  const windows: boolean = process.platform === "win32";
  const cargoBinPath: string = path.join(cargoPath, "bin");

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
