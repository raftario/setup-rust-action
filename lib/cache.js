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
const path = __importStar(require("path"));
const pjPath = path.join(__dirname, "..", "package.json");
// tslint:disable:no-var-requires
const pj = require(pjPath);
function restore(cargoPath, rustupPath) {
    return __awaiter(this, void 0, void 0, function* () {
        core.startGroup("Restore cache");
        const copyOptions = {
            force: true,
            recursive: true,
        };
        // Restore cargo and rustup
        try {
            core.debug("Restoring cargo");
            const cachedCargoPath = tc.find("cargo", pj.version);
            if (cachedCargoPath.length > 0) {
                yield io.cp(cachedCargoPath, cargoPath, copyOptions);
            }
        }
        catch (error) {
            core.error(error.message);
        }
        try {
            core.debug("Restoring rustup");
            const cachedRustupPath = tc.find("rustup", pj.version);
            if (cachedRustupPath.length > 0) {
                yield io.cp(cachedRustupPath, rustupPath, copyOptions);
            }
        }
        catch (error) {
            core.error(error.message);
        }
        core.endGroup();
    });
}
exports.restore = restore;
function cache(cargoPath, rustupPath) {
    return __awaiter(this, void 0, void 0, function* () {
        core.startGroup("Cache");
        // Cache .cargo and .rustup
        try {
            core.debug("Caching cargo");
            yield tc.cacheDir(cargoPath, "cargo", pj.version);
        }
        catch (error) {
            core.error(error.message);
        }
        try {
            core.debug("Caching rustup");
            yield tc.cacheDir(rustupPath, "rustup", pj.version);
        }
        catch (error) {
            core.error(error.message);
        }
        // Restore cache
        yield restore(cargoPath, rustupPath);
        core.endGroup();
    });
}
exports.cache = cache;
