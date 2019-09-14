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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const path = __importStar(require("path"));
const cache_1 = require("./cache");
const install_1 = __importDefault(require("./install"));
const prepare_1 = __importDefault(require("./prepare"));
const verify_1 = __importDefault(require("./verify"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        // System info
        const windows = process.platform === "win32";
        // Useful paths
        const homePath = process.env.HOME || (windows ? "%USERPROFILE%" : "~");
        const cargoPath = process.env.CARGO_HOME || path.join(homePath, ".cargo");
        const rustupPath = process.env.RUSTUP_HOME || path.join(homePath, ".rustup");
        // Inputs
        const rustChannel = core.getInput("rust-channel");
        const rustHost = core.getInput("rust-host");
        const rustTarget = core.getInput("rust-target");
        const installRustfmt = core.getInput("install-rustfmt") === "true";
        const installClippy = core.getInput("install-clippy") === "true";
        const installCross = core.getInput("install-cross") === "true";
        const customInstalls = {
            rustfmt: installRustfmt,
            clippy: installClippy,
            cross: installCross,
        };
        const enableCache = core.getInput("cache") === "true";
        try {
            if (enableCache) {
                yield cache_1.restore(cargoPath, rustupPath);
            }
            yield prepare_1.default(cargoPath);
            yield install_1.default(rustChannel, rustHost, rustTarget, customInstalls, cargoPath);
            if (enableCache) {
                yield cache_1.cache(cargoPath, rustupPath);
            }
            yield verify_1.default(customInstalls);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
