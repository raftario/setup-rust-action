import * as core from "@actions/core";
import * as io from "@actions/io";
import * as path from "path";
import { cache, restore } from "../src/cache";
import install from "../src/install";
import prepare from "../src/prepare";

describe("setup tests", () => {
  // Custom paths
  const homePath: string = path.join(__dirname, "home");
  process.env.HOME = homePath;
  const cargoPath: string = path.join(homePath, ".cargo");
  process.env.CARGO_HOME = cargoPath;
  const rustupPath: string = path.join(homePath, ".rustup");
  process.env.RUSTUP_HOME = rustupPath;
  const cargoBinPath: string = path.join(cargoPath, "bin");

  beforeAll(async () => {
    await io.rmRF(homePath);
    await io.mkdirP(homePath);
    core.addPath(cargoBinPath);
  });

  afterAll(async () => {
    await io.rmRF(homePath);
  });

  it("Finishes the preparation step", async () => {
    await prepare(cargoPath);
  });

  it("Finishes the installation step with defaults", async () => {
    // Inputs
    const rustChannel: string = "";
    const rustHost: string = "";
    const rustTarget: string = "";
    const installCross: boolean = false;

    await install(rustChannel, rustHost, rustTarget, installCross);
  }, 10 * 60 * 1000);

  it("Finishes the installation step with custom values", async () => {
    if (process.platform === "win32") {
      return;
    }
    const macos: boolean = process.platform === "darwin";

    // Inputs
    const rustChannel: string = "nightly";
    const rustHost: string = macos ? "i686-apple-darwin" : "i686-unknown-linux-gnu";
    const rustTarget: string = macos ? "armv7-apple-ios" : "armv7-linux-androideabi";
    const installCross: boolean = true;

    await install(rustChannel, rustHost, rustTarget, installCross);
  }, 10 * 60 * 1000);

  it("Completes the full installation process with defaults", async () => {
    // Inputs
    const rustChannel: string = "";
    const rustHost: string = "";
    const rustTarget: string = "";
    const installCross: boolean = false;

    await restore(cargoPath, rustupPath, rustChannel, rustHost);
    await prepare(cargoPath);
    await install(rustChannel, rustHost, rustTarget, installCross);
    await cache(cargoPath, rustupPath, rustChannel, rustHost);
  }, 10 * 60 * 1000);

  it("Completes the full installation process with custom values", async () => {
    if (process.platform === "win32") {
      return;
    }
    const macos: boolean = process.platform === "darwin";

    // Inputs
    const rustChannel: string = "nightly";
    const rustHost: string = macos ? "i686-apple-darwin" : "i686-unknown-linux-gnu";
    const rustTarget: string = macos ? "armv7-apple-ios" : "armv7-linux-androideabi";
    const installCross: boolean = true;

    await restore(cargoPath, rustupPath, rustChannel, rustHost);
    await prepare(cargoPath);
    await install(rustChannel, rustHost, rustTarget, installCross);
    await cache(cargoPath, rustupPath, rustChannel, rustHost);
  }, 10 * 60 * 1000);
});
