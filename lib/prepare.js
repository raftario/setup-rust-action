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
const path = __importStar(require("path"));
const misc_1 = require("./misc");
function prepare(cargoPath, rustTarget, installCross, targetAliases, allAliases) {
    return __awaiter(this, void 0, void 0, function* () {
        core.startGroup("Prepare setup");
        const windows = process.platform === "win32";
        const cargoBinPath = path.join(cargoPath, "bin");
        // Add ~/.cargo/bin to path
        if (!(process.env.PATH || "").includes(cargoBinPath)) {
            core.addPath(cargoBinPath);
        }
        // Create aliases
        if (targetAliases || allAliases && !windows) {
            // Commands affected by target and --all
            const commands = [
                "cargo build",
                "cargo run",
                "cargo test",
                "cargo bench",
            ];
            if (installCross) {
                commands.concat([
                    "cross build",
                    "cross run",
                    "cross test",
                    "cross bench",
                ]);
            }
            // Create target aliases
            if (targetAliases && rustTarget.length > 0) {
                core.debug("Creating target aliases");
                // Commands affected by target
                const targetCommands = [
                    "rustc",
                ];
                commands.concat(targetCommands);
                misc_1.aForeach(commands, (command) => __awaiter(this, void 0, void 0, function* () {
                    yield misc_1.aExec(`alias ${command}='${command} --target ${rustTarget}'`);
                }));
                commands.filter((command) => !targetCommands.includes(command));
            }
            // Create --all aliases
            if (allAliases) {
                core.debug("Creating --all aliases");
                // Commands affected by --all
                const allCommands = [
                    "cargo check",
                    "cargo doc",
                ];
                if (installCross) {
                    allCommands.concat([
                        "cross check",
                        "cross doc",
                    ]);
                }
                commands.concat(allCommands);
                misc_1.aForeach(commands, (command) => __awaiter(this, void 0, void 0, function* () {
                    yield misc_1.aExec(`alias ${command}='${command} --all'`);
                }));
                commands.filter((command) => !allCommands.includes(command));
            }
        }
        core.endGroup();
    });
}
exports.default = prepare;
