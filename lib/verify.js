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
function prepare(customInstalls) {
    return __awaiter(this, void 0, void 0, function* () {
        core.startGroup("Verify setup");
        const versionArgs = ["--version"];
        // Verify rustc
        core.debug("Veryfing rustc installation");
        const rustcBin = yield io.which("rustc", true);
        yield misc_1.aExec(rustcBin, versionArgs);
        // Verify cargo
        core.debug("Veryfing cargo installation");
        const cargoBin = yield io.which("cargo", true);
        yield misc_1.aExec(cargoBin, versionArgs);
        // Verify rustup
        core.debug("Veryfing rustup installation");
        const rustupBin = yield io.which("rustup", true);
        yield misc_1.aExec(rustupBin, versionArgs);
        // Verify rustfmt
        if (customInstalls.rustfmt) {
            core.debug("Veryfing rustfmt installation");
            yield misc_1.aExec(cargoBin, ["fmt", ...versionArgs]);
        }
        // Verify clippy
        if (customInstalls.rustfmt) {
            core.debug("Veryfing clippy installation");
            yield misc_1.aExec(cargoBin, ["clippy", ...versionArgs]);
        }
        // Verify cross
        if (customInstalls.cross) {
            core.debug("Veryfing cross installation");
            yield io.which("cross", true);
        }
        core.endGroup();
    });
}
exports.default = prepare;
