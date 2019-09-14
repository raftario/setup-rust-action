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
const misc_1 = require("./misc");
function prepare(cargoPath) {
    return __awaiter(this, void 0, void 0, function* () {
        core.startGroup("Prepare setup");
        // Add cargo bin dir to path
        misc_1.addCargoBinPath(cargoPath);
        // Remove rustfmt and clippy if present
        const rustfmtBin1 = yield io.which("cargo-fmt", false);
        const rustfmtBin2 = yield io.which("rustfmt", false);
        if (rustfmtBin1.length > 0) {
            core.debug("Removing existing rustfmt binary");
            io.rmRF(rustfmtBin1);
        }
        if (rustfmtBin2.length > 0) {
            core.debug("Removing existing rustfmt binary");
            io.rmRF(rustfmtBin2);
        }
        const clippyBin = yield io.which("cargo-clippy", false);
        if (clippyBin.length > 0) {
            core.debug("Removing existing rustfmt clippy");
            io.rmRF(clippyBin);
        }
        core.endGroup();
    });
}
exports.default = prepare;
