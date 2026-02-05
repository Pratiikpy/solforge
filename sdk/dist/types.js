"use strict";
/**
 * SolForge SDK Types
 * @module @solforge/sdk
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolForgeError = void 0;
class SolForgeError extends Error {
    constructor(message, code, statusCode, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'SolForgeError';
    }
}
exports.SolForgeError = SolForgeError;
//# sourceMappingURL=types.js.map