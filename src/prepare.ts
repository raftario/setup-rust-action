import * as core from "@actions/core";
import { parseCargoBinPath } from "./misc";

export default async function prepare(cargoPath: string) {
  core.startGroup("Prepare setup");

  const cargoBinPath: string = parseCargoBinPath(cargoPath);

  // Add cargo bin dir to path
  const path: string = process.env.PATH || "";
  if (!path.includes(cargoBinPath)) {
    core.addPath(cargoBinPath);
    if (!path.endsWith(";")) {
      process.env.PATH += ";";
    }
    process.env.PATH += cargoBinPath;
  }

  core.endGroup();
}
