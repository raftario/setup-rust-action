import * as core from "@actions/core";
import * as io from "@actions/io";
import { aExec } from "./misc";
import { ICustomInstalls } from "./types";

export default async function prepare(customInstalls: ICustomInstalls) {
  core.startGroup("Verify setup");

  const versionArgs: string[] = ["--version"];

  // Verify rustc
  core.debug("Veryfing rustc installation");
  const rustcBin: string = await io.which("rustc", true);
  await aExec(rustcBin, versionArgs);

  // Verify cargo
  core.debug("Veryfing cargo installation");
  const cargoBin: string = await io.which("cargo", true);
  await aExec(cargoBin, versionArgs);

  // Verify rustup
  core.debug("Veryfing rustup installation");
  const rustupBin: string = await io.which("rustup", true);
  await aExec(rustupBin, versionArgs);

  // Verify rustfmt
  if (customInstalls.rustfmt) {
    core.debug("Veryfing rustfmt installation");
    await aExec(cargoBin, ["fmt", ...versionArgs]);
  }

  // Verify clippy
  if (customInstalls.rustfmt) {
    core.debug("Veryfing clippy installation");
    await aExec(cargoBin, ["clippy", ...versionArgs]);
  }

  // Verify cross
  if (customInstalls.cross) {
    core.debug("Veryfing cross installation");
    await io.which("cross", true);
  }

  core.endGroup();
}
