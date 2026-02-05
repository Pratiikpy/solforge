"use strict";
/**
 * SolForge Client
 * @module @solforge/sdk
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolForgeClient = void 0;
const types_1 = require("./types");
const constants_1 = require("./constants");
class SolForgeClient {
    constructor(config) {
        this.endpoint = config?.endpoint || constants_1.DEFAULT_ENDPOINT;
        this.apiKey = config?.apiKey;
        this.timeout = config?.timeout || constants_1.DEFAULT_TIMEOUT;
    }
    /**
     * Request a new build
     * @param spec Natural language specification of the Solana program to build
     * @param options Build options (budget, network, etc.)
     * @returns Build request details
     */
    async requestBuild(spec, options) {
        if (!spec || spec.trim().length === 0) {
            throw new types_1.SolForgeError('Build specification cannot be empty', 'INVALID_SPEC');
        }
        const body = {
            spec: spec.trim(),
            budget: options?.budget || constants_1.DEFAULT_BUILD_BUDGET,
            network: options?.network || constants_1.DEFAULT_NETWORK,
            webhookUrl: options?.webhookUrl,
            metadata: options?.metadata,
        };
        const response = await this.fetch('/build', {
            method: 'POST',
            body: JSON.stringify(body),
        });
        return response;
    }
    /**
     * Get build status
     * @param buildId Build ID
     * @returns Current build status
     */
    async getBuildStatus(buildId) {
        const response = await this.fetch(`/builds/${buildId}`);
        return response;
    }
    /**
     * Stream build events (Server-Sent Events)
     * @param buildId Build ID
     * @yields Build events as they occur
     */
    async *streamBuild(buildId) {
        const url = `${this.endpoint}/builds/${buildId}/stream`;
        const headers = this.getHeaders();
        let retries = 0;
        let lastEventId;
        while (retries < constants_1.SSE_CONFIG.maxRetries) {
            try {
                const response = await fetch(url, {
                    headers: {
                        ...headers,
                        Accept: 'text/event-stream',
                        ...(lastEventId && { 'Last-Event-ID': lastEventId }),
                    },
                });
                if (!response.ok) {
                    throw await this.handleErrorResponse(response);
                }
                if (!response.body) {
                    throw new types_1.SolForgeError('No response body', 'NO_BODY');
                }
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';
                while (true) {
                    const { done, value } = await reader.read();
                    if (done)
                        break;
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                const event = {
                                    type: data.type,
                                    timestamp: data.timestamp || new Date().toISOString(),
                                    data: data.data,
                                };
                                if (data.id) {
                                    lastEventId = data.id;
                                }
                                yield event;
                                // Stop streaming if build is complete or failed
                                if (event.type === 'complete' || event.type === 'error') {
                                    return;
                                }
                            }
                            catch (e) {
                                console.warn('Failed to parse SSE data:', line);
                            }
                        }
                    }
                }
                return; // Stream ended normally
            }
            catch (error) {
                retries++;
                if (retries >= constants_1.SSE_CONFIG.maxRetries) {
                    throw error;
                }
                // Wait before retrying
                await new Promise((resolve) => setTimeout(resolve, constants_1.SSE_CONFIG.reconnectDelay));
            }
        }
    }
    /**
     * Get build history
     * @param options List options (limit, offset, filter, sort)
     * @returns List of build records
     */
    async listBuilds(options) {
        const params = new URLSearchParams();
        if (options?.limit)
            params.set('limit', options.limit.toString());
        if (options?.offset)
            params.set('offset', options.offset.toString());
        if (options?.status)
            params.set('status', options.status);
        if (options?.order)
            params.set('order', options.order);
        const url = `/builds${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await this.fetch(url);
        return response;
    }
    /**
     * Verify on-chain build proof
     * @param buildId Build ID
     * @param stepNumber Step number to verify (0-7)
     * @returns Verification result with on-chain proof
     */
    async verifyBuildProof(buildId, stepNumber) {
        if (stepNumber < 0 || stepNumber > 7) {
            throw new types_1.SolForgeError('Step number must be between 0 and 7', 'INVALID_STEP');
        }
        const response = await this.fetch(`/builds/${buildId}/proof/${stepNumber}`);
        return response;
    }
    /**
     * Get deployed program information
     * @param buildId Build ID
     * @returns Program information including IDL and deployment details
     */
    async getDeployedProgram(buildId) {
        const response = await this.fetch(`/builds/${buildId}/program`);
        return response;
    }
    /**
     * Internal fetch wrapper with error handling
     */
    async fetch(path, init) {
        const url = `${this.endpoint}${path}`;
        const headers = this.getHeaders();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        try {
            const response = await fetch(url, {
                ...init,
                headers: {
                    ...headers,
                    ...init?.headers,
                },
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw await this.handleErrorResponse(response);
            }
            return await response.json();
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof types_1.SolForgeError) {
                throw error;
            }
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new types_1.SolForgeError('Request timeout', 'TIMEOUT');
                }
                throw new types_1.SolForgeError(error.message, 'NETWORK_ERROR');
            }
            throw new types_1.SolForgeError('Unknown error', 'UNKNOWN');
        }
    }
    /**
     * Get request headers
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }
        return headers;
    }
    /**
     * Handle error responses
     */
    async handleErrorResponse(response) {
        let errorData;
        try {
            errorData = await response.json();
        }
        catch {
            errorData = { message: response.statusText };
        }
        return new types_1.SolForgeError(errorData.message || 'Request failed', errorData.code || 'API_ERROR', response.status, errorData.details);
    }
}
exports.SolForgeClient = SolForgeClient;
//# sourceMappingURL=client.js.map