"use strict";
/**
 * SolForge SDK Types
 * @module @solforge/sdk
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolForgeError = void 0;
/** SolForge error */
class SolForgeError extends Error {
    constructor(message, code, logs) {
        super(message);
        this.code = code;
        this.logs = logs;
        this.name = 'SolForgeError';
    }
}
exports.SolForgeError = SolForgeError;
//# sourceMappingURL=types.js.map