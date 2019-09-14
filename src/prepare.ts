import * as core from "@actions/core";
import * as io from "@actions/io";
import * as path from "path";

export default async function prepare(cargoPath: string) {
  core.startGroup("Prepare setup");

  const cargoBinPath: string = path.join(cargoPath, "bin");

  // Add cargo bin dir to path
  const envPath: string = process.env.PATH || "";
  if (!envPath.includes(cargoBinPath)) {
    core.debug("Adding .cargo/bin to PATH");
    core.addPath(cargoBinPath);
  }

  // Remove rustfmt and clippy if present
  const rustfmtBin1: string = await io.which("cargo-fmt", false);
  const rustfmtBin2: string = await io.which("rustfmt", false);
  if (rustfmtBin1.length > 0) {
    core.debug("Removing existing rustfmt binary");
    io.rmRF(rustfmtBin1);
  }
  if (rustfmtBin2.length > 0) {
    core.debug("Removing existing rustfmt binary");
    io.rmRF(rustfmtBin2);
  }
  const clippyBin: string = await io.which("cargo-clippy", false);
  if (clippyBin.length > 0) {
    core.debug("Removing existing rustfmt clippy");
    io.rmRF(clippyBin);
  }

  core.endGroup();
}
