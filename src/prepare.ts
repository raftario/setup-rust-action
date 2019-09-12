import * as core from "@actions/core";
import * as path from "path";
import { aExec, aForeach } from "./misc";

export default async function prepare(cargoPath: string) {
  core.startGroup("Prepare setup");

  const cargoBinPath: string = path.join(cargoPath, "bin");

  // Add ~/.cargo/bin to path
  if (!(process.env.PATH || "").includes(cargoBinPath)) {
    core.addPath(cargoBinPath);
  }

  core.endGroup();
}
