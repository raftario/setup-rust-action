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
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        // System info
        const windows = process.platform === "win32";
        // Useful paths
        const homePath = process.env.HOME || windows ? "%USERPROFILE%" : "~";
        const cargoPath = path.join(homePath, ".cargo");
        const rustupPath = path.join(homePath, ".rustup");
        // Inputs
        const rustChannel = core.getInput("rust-channel");
        const rustHost = core.getInput("rust-host");
        const rustTarget = core.getInput("rust-target");
        const installCross = core.getInput("install-cross") === "true";
        const targetAliases = core.getInput("target-aliases") === "true";
        const allAliases = core.getInput("target-aliases") === "true";
        try {
            yield cache_1.restore(cargoPath, rustupPath, rustChannel, rustHost);
            yield prepare_1.default(cargoPath, rustTarget, installCross, targetAliases, allAliases);
            yield install_1.default(rustChannel, rustHost, rustTarget, installCross);
            yield cache_1.cache(cargoPath, rustupPath, rustChannel, rustHost);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
