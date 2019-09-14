import * as core from "@actions/core";
import * as io from "@actions/io";
import { aExec } from "./misc";

export default async function prepare(cargoPath: string, installCross: boolean) {
  core.startGroup("Prepare setup");

  const versionArgs: string[] = ["--version"];

  // Check for tools
  core.debug("Veryfing rustc installation");
  const rustcBin: string = await io.which("rustc", true);
  await aExec(rustcBin, versionArgs);

  core.debug("Veryfing cargo installation");
  const cargoBin: string = await io.which("cargo", true);
  await aExec(cargoBin, versionArgs);

  core.debug("Veryfing rustup installation");
  const rustupBin: string = await io.which("rustup", true);
  await aExec(rustupBin, versionArgs);

  if (installCross) {
    core.debug("Veryfing cross installation");
    const crossBin: string = await io.which("cross", true);
    await aExec(crossBin, versionArgs);
  }

  core.endGroup();
}
