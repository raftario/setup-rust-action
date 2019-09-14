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
const exec = __importStar(require("@actions/exec"));
const path = __importStar(require("path"));
function aExec(commandLine, args, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const ec = yield exec.exec(commandLine, args, options);
        if (ec === 0) {
            return ec;
        }
        else {
            throw new Error("Command exited with non zero error code: " + ec);
        }
    });
}
exports.aExec = aExec;
function aForeach(array, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const element of array) {
            yield callback(element);
        }
    });
}
exports.aForeach = aForeach;
function addCargoBinPath(cargoPath) {
    const cargoBinPath = path.join(cargoPath, "bin");
    const envPath = process.env.PATH || "";
    if (!envPath.includes(cargoBinPath)) {
        core.debug("Adding .cargo/bin to PATH");
        core.addPath(cargoBinPath);
    }
}
exports.addCargoBinPath = addCargoBinPath;
