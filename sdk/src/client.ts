/**
 * SolForge Client
 * @module @solforge/sdk
 */

import {
  SolForgeConfig,
  BuildOptions,
  BuildRequest,
  BuildStatus,
  BuildEvent,
  ListOptions,
  BuildRecord,
  VerificationResult,
  ProgramInfo,
  SolForgeError,
} from './types';
import {
  DEFAULT_ENDPOINT,
  DEFAULT_TIMEOUT,
  DEFAULT_BUILD_BUDGET,
  DEFAULT_NETWORK,
  SSE_CONFIG,
} from './constants';

export class SolForgeClient {
  private endpoint: string;
  private apiKey?: string;
  private timeout: number;

  constructor(config?: Partial<SolForgeConfig>) {
    this.endpoint = config?.endpoint || DEFAULT_ENDPOINT;
    this.apiKey = config?.apiKey;
    this.timeout = config?.timeout || DEFAULT_TIMEOUT;
  }

  /**
   * Request a new build
   * @param spec Natural language specification of the Solana program to build
   * @param options Build options (budget, network, etc.)
   * @returns Build request details
   */
  async requestBuild(spec: string, options?: BuildOptions): Promise<BuildRequest> {
    if (!spec || spec.trim().length === 0) {
      throw new SolForgeError('Build specification cannot be empty', 'INVALID_SPEC');
    }

    const body = {
      spec: spec.trim(),
      budget: options?.budget || DEFAULT_BUILD_BUDGET,
      network: options?.network || DEFAULT_NETWORK,
      webhookUrl: options?.webhookUrl,
      metadata: options?.metadata,
    };

    const response = await this.fetch('/build', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return response as BuildRequest;
  }

  /**
   * Get build status
   * @param buildId Build ID
   * @returns Current build status
   */
  async getBuildStatus(buildId: string): Promise<BuildStatus> {
    const response = await this.fetch(`/builds/${buildId}`);
    return response as BuildStatus;
  }

  /**
   * Stream build events (Server-Sent Events)
   * @param buildId Build ID
   * @yields Build events as they occur
   */
  async *streamBuild(buildId: string): AsyncGenerator<BuildEvent> {
    const url = `${this.endpoint}/builds/${buildId}/stream`;
    const headers = this.getHeaders();

    let retries = 0;
    let lastEventId: string | undefined;

    while (retries < SSE_CONFIG.maxRetries) {
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
          throw new SolForgeError('No response body', 'NO_BODY');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                const event: BuildEvent = {
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
              } catch (e) {
                console.warn('Failed to parse SSE data:', line);
              }
            }
          }
        }

        return; // Stream ended normally
      } catch (error) {
        retries++;
        if (retries >= SSE_CONFIG.maxRetries) {
          throw error;
        }
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, SSE_CONFIG.reconnectDelay));
      }
    }
  }

  /**
   * Get build history
   * @param options List options (limit, offset, filter, sort)
   * @returns List of build records
   */
  async listBuilds(options?: ListOptions): Promise<BuildRecord[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.offset) params.set('offset', options.offset.toString());
    if (options?.status) params.set('status', options.status);
    if (options?.order) params.set('order', options.order);

    const url = `/builds${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.fetch(url);
    return response as BuildRecord[];
  }

  /**
   * Verify on-chain build proof
   * @param buildId Build ID
   * @param stepNumber Step number to verify (0-7)
   * @returns Verification result with on-chain proof
   */
  async verifyBuildProof(buildId: string, stepNumber: number): Promise<VerificationResult> {
    if (stepNumber < 0 || stepNumber > 7) {
      throw new SolForgeError('Step number must be between 0 and 7', 'INVALID_STEP');
    }

    const response = await this.fetch(`/builds/${buildId}/proof/${stepNumber}`);
    return response as VerificationResult;
  }

  /**
   * Get deployed program information
   * @param buildId Build ID
   * @returns Program information including IDL and deployment details
   */
  async getDeployedProgram(buildId: string): Promise<ProgramInfo> {
    const response = await this.fetch(`/builds/${buildId}/program`);
    return response as ProgramInfo;
  }

  /**
   * Internal fetch wrapper with error handling
   */
  private async fetch(path: string, init?: RequestInit): Promise<any> {
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
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof SolForgeError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new SolForgeError('Request timeout', 'TIMEOUT');
        }
        throw new SolForgeError(error.message, 'NETWORK_ERROR');
      }

      throw new SolForgeError('Unknown error', 'UNKNOWN');
    }
  }

  /**
   * Get request headers
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
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
  private async handleErrorResponse(response: Response): Promise<SolForgeError> {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    return new SolForgeError(
      errorData.message || 'Request failed',
      errorData.code || 'API_ERROR',
      response.status,
      errorData.details
    );
  }
}
