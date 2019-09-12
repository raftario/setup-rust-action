import * as core from "@actions/core";
import { parseCargoBinPath } from "./misc";

export default async function prepare(cargoPath: string) {
  core.startGroup("Prepare setup");

  const cargoBinPath: string = parseCargoBinPath(cargoPath);

  // Add ~/.cargo/bin to path
  if (!(process.env.PATH || "").includes(cargoBinPath)) {
    core.addPath(cargoBinPath);
  }

  core.endGroup();
}
