import * as core from "@actions/core";
import * as io from "@actions/io";
import * as path from "path";
import { cache, restore } from "../src/cache";
import install from "../src/install";
import prepare from "../src/prepare";

describe("setup tests", () => {
  const windows: boolean = process.platform === "win32";

  // Custom paths
  const homePath: string = path.join(__dirname, "home");
  const cargoPath: string = path.join(homePath, ".cargo");
  const rustupPath: string = path.join(homePath, ".rustup");
  const cargoBinPath: string = path.join(cargoPath, "bin");

  beforeAll(async () => {
    // Remove temp dirs
    await io.rmRF(homePath);
    await io.mkdirP(homePath);

    // Set environment
    process.env.HOME = homePath;
    process.env.CARGO_HOME = cargoPath;
    process.env.RUSTUP_HOME = rustupPath;
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

  if (!windows) {
    it("Finishes the installation step with custom values", async () => {
      const macos: boolean = process.platform === "darwin";

      // Inputs
      const rustChannel: string = "nightly";
      const rustHost: string = macos ? "i686-apple-darwin" : "i686-unknown-linux-gnu";
      const rustTarget: string = macos ? "armv7-apple-ios" : "armv7-linux-androideabi";
      const installCross: boolean = true;

      await install(rustChannel, rustHost, rustTarget, installCross);
    }, 10 * 60 * 1000);
  }

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

  if (!windows) {
    it("Completes the full installation process with custom values", async () => {
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
  }
});
