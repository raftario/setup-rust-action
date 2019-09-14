import * as core from "@actions/core";
import * as path from "path";

export default async function prepare(cargoPath: string) {
  core.startGroup("Prepare setup");

  const cargoBinPath: string = path.join(cargoPath, "bin");

  // Add cargo bin dir to path
  const envPath: string = process.env.PATH || "";
  if (!envPath.includes(cargoBinPath)) {
    core.addPath(cargoBinPath);
  }

  core.endGroup();
}
