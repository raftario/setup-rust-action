import * as core from "@actions/core";
import * as io from "@actions/io";
import * as tc from "@actions/tool-cache";
import * as path from "path";

const pjPath = path.join(__dirname, "..", "package.json");
// tslint:disable:no-var-requires
const pj = require(pjPath);

export async function restore(cargoPath: string, rustupPath: string, targetPath: string) {
  core.startGroup("Restore cache");

  const copyOptions: io.CopyOptions = {
    force: true,
  };

  // Restore cargo and rustup
  try {
    core.debug("Restoring cargo");
    const cachedCargoPath: string = tc.find("cargo", pj.version);
    if (cachedCargoPath.length > 0) {
      await io.cp(cachedCargoPath, cargoPath, copyOptions);
    }
  } catch (error) {
    core.error(error.message);
  }
  try {
    core.debug("Restoring rustup");
    const cachedRustupPath: string = tc.find("rustup", pj.version);
    if (cachedRustupPath.length > 0) {
      await io.cp(cachedRustupPath, rustupPath, copyOptions);
    }
  } catch (error) {
    core.error(error.message);
  }

  // Restore target
  try {
    core.debug("Restoring build artifacts");
    const cachedTargetPath: string = tc.find("target", pj.version);
    if (cachedTargetPath.length > 0) {
      await io.cp(cachedTargetPath, targetPath, copyOptions);
    }
  } catch (error) {
    core.error(error.message);
  }

  core.endGroup();
}

export async function cache(cargoPath: string, rustupPath: string, targetPath: string) {
  core.startGroup("Cache");

  // Cache .cargo and .rustup
  try {
    core.debug("Caching cargo");
    await tc.cacheDir(cargoPath, "cargo", pj.version);
  } catch (error) {
    core.error(error.message);
  }
  try {
    core.debug("Caching rustup");
    await tc.cacheDir(rustupPath, "rustup", pj.version);
  } catch (error) {
    core.error(error.message);
  }

  // Cache target
  try {
    core.debug("Caching build artifacts");
    await tc.cacheDir(targetPath, "target", pj.version);
  } catch (error) {
    core.error(error.message);
  }

  // Restore cache
  await restore(cargoPath, rustupPath, targetPath);

  core.endGroup();
}
