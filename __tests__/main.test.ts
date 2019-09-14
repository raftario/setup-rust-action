import * as io from "@actions/io";
import * as path from "path";
import { cache, restore } from "../src/cache";
import install from "../src/install";
import prepare from "../src/prepare";
import { ICustomInstalls } from "../src/types";
import verify from "../src/verify";

describe("setup tests", () => {
  const windows: boolean = process.platform === "win32";
  const macos: boolean = process.platform === "darwin";

  // Useful paths
  const homePath: string = process.env.HOME || (windows ? "%USERPROFILE%" : "~");
  const cargoPath: string = process.env.CARGO_HOME || path.join(homePath, ".cargo");
  const rustupPath: string = process.env.RUSTUP_HOME || path.join(homePath, ".rustup");

  beforeAll(async () => {
    // Remove installation dirs
    await io.rmRF(cargoPath);
    await io.rmRF(rustupPath);
  });

  afterAll(async () => {
    // Remove installation dirs
    await io.rmRF(cargoPath);
    await io.rmRF(rustupPath);
  });

  it("Completes the setup process with defaults", async () => {
    // Inputs
    const rustChannel: string = "";
    const rustHost: string = "";
    const rustTarget: string = "";
    const installRustfmt: boolean = false;
    const installClippy: boolean = false;
    const installCross: boolean = false;
    const customInstalls: ICustomInstalls = {
      rustfmt: installRustfmt,
      clippy: installClippy,
      cross: installCross,
    };

    await restore(cargoPath, rustupPath, rustChannel, rustHost);
    await prepare(cargoPath);
    await install(rustChannel, rustHost, rustTarget, customInstalls);
    await verify(customInstalls);
    await cache(cargoPath, rustupPath, rustChannel, rustHost);
  }, 10 * 60 * 1000);

  it("Completes the setup process with a custom host and channel and rustfmt and clippy", async () => {
    // Inputs
    const rustChannel: string = "nightly";
    const rustHost: string = windows
      ? "i686-pc-windows-msvc"
      : (macos ? "i686-apple-darwin" : "i686-unknown-linux-gnu");
    const rustTarget: string = "";
    const installRustfmt: boolean = true;
    const installClippy: boolean = true;
    const installCross: boolean = false;
    const customInstalls: ICustomInstalls = {
      rustfmt: installRustfmt,
      clippy: installClippy,
      cross: installCross,
    };

    await restore(cargoPath, rustupPath, rustChannel, rustHost);
    await prepare(cargoPath);
    await install(rustChannel, rustHost, rustTarget, customInstalls);
    await verify(customInstalls);
    await cache(cargoPath, rustupPath, rustChannel, rustHost);
  }, 10 * 60 * 1000);

  if (!windows) {
    it("Completes the setup process with a custom target and cross", async () => {
      // Inputs
      const rustChannel: string = "";
      const rustHost: string = "";
      const rustTarget: string = macos ? "armv7-apple-ios" : "armv7-linux-androideabi";
      const installRustfmt: boolean = false;
      const installClippy: boolean = false;
      const installCross: boolean = true;
      const customInstalls: ICustomInstalls = {
        rustfmt: installRustfmt,
        clippy: installClippy,
        cross: installCross,
      };

      await restore(cargoPath, rustupPath, rustChannel, rustHost);
      await prepare(cargoPath);
      await install(rustChannel, rustHost, rustTarget, customInstalls);
      await verify(customInstalls);
      await cache(cargoPath, rustupPath, rustChannel, rustHost);
    }, 10 * 60 * 1000);
  }
});
