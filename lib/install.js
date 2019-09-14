"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const io = __importStar(require("@actions/io"));
const tc = __importStar(require("@actions/tool-cache"));
const misc_1 = require("./misc");
function parseRustToolchain(rustChannel, rustHost) {
    return rustChannel.length > 0
        ? rustChannel + (rustHost.length > 0 ? "-" + rustHost : "")
        : "stable";
}
function install(rustChannel, rustHost, rustTarget, customInstalls, cargoPath) {
    return __awaiter(this, void 0, void 0, function* () {
        core.startGroup("Install and/or update Rust toolchain");
        const windows = process.platform === "win32";
        const rustToolchain = parseRustToolchain(rustChannel, rustHost);
        let rustupBin = "";
        try {
            // Check for rustup (enters catch arm on failure)
            core.debug("Checking for rustup installation");
            rustupBin = yield io.which("rustup", true);
            core.debug("rustup is installed");
            // Update rustup itself
            core.debug("Updating rustup");
            yield misc_1.aExec(rustupBin, ["self", "update"]);
            // Set default toolchain based on inputs
            core.debug("Setting default toolchain: " + rustToolchain);
            yield misc_1.aExec(rustupBin, ["default", rustToolchain]);
            // Update the toolchain
            yield misc_1.aExec(rustupBin, ["update"]);
        }
        catch (error) {
            core.debug("rustup is not installed");
            // Download OS-specific installer
            core.debug("Downloading rustup");
            const installerPath = windows
                ? yield tc.downloadTool("https://win.rustup.rs/")
                : yield tc.downloadTool("https://sh.rustup.rs/");
            // Set installation args based on inputs
            const installerArgs = ["-y"];
            if (rustChannel.length > 0) {
                installerArgs.push("--default-toolchain");
                installerArgs.push(rustChannel);
            }
            if (rustHost.length > 0) {
                installerArgs.push("--default-host");
                installerArgs.push(rustHost);
            }
            // Run the installer
            core.debug("Installing rustup");
            if (!windows) {
                yield misc_1.aExec("chmod", ["+x", installerPath]);
            }
            yield misc_1.aExec(installerPath, installerArgs);
            // Add cargo bin dir to path
            misc_1.addCargoBinPath(cargoPath);
        }
        // Get rustup binary path
        if (rustupBin.length < 0) {
            rustupBin = yield io.which("rustup", true);
        }
        // Install target
        if (rustTarget.length > 0) {
            core.debug("Installing target: " + rustTarget);
            yield misc_1.aExec(rustupBin, ["target", "add", rustTarget]);
        }
        // Install rustfmt
        if (customInstalls.rustfmt) {
            core.debug("Installing rustfmt");
            yield misc_1.aExec(rustupBin, ["component", "add", "rustfmt"]);
        }
        // Install clippy
        if (customInstalls.clippy) {
            core.debug("Installing clippy");
            yield misc_1.aExec(rustupBin, ["component", "add", "clippy"]);
        }
        // Install cross
        if (customInstalls.cross) {
            core.debug("Installing cross");
            const cargoBin = yield io.which("cargo", true);
            yield misc_1.aExec(cargoBin, ["install", "cross"]);
        }
        core.endGroup();
    });
}
exports.default = install;
