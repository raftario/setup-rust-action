import * as core from "@actions/core";
import * as io from "@actions/io";
import { parseCargoBinPath } from "./misc";

export default async function prepare(cargoPath: string, installCross: boolean) {
  core.startGroup("Prepare setup");

  const cargoBinPath: string = parseCargoBinPath(cargoPath);

  // Add ~/.cargo/bin to path
  if (!(process.env.PATH || "").includes(cargoBinPath)) {
    core.addPath(cargoBinPath);
  }

  // Check for tools
  core.debug("Veryfing rustc installation");
  await io.which("rustc", true);
  core.debug("Veryfing cargo installation");
  await io.which("cargo", true);
  core.debug("Veryfing rustup installation");
  await io.which("rustup", true);
  if (installCross) {
    core.debug("Veryfing cross installation");
    await io.which("cross", true);
  }

  core.endGroup();
}
