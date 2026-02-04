'use client';

import { useState } from 'react';

export default function ApiDocsPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const curlExample = `curl -X POST https://solforge.app/api/build \\
  -H "Content-Type: application/json" \\
  -d '{
    "spec": "Build a token vesting program with cliff periods",
    "callback_url": "https://your-agent.com/webhook"
  }'`;

  const responseExample = `{
  "build_id": "build_abc123",
  "status": "building",
  "estimated_time": 60
}`;

  const webhookExample = `{
  "build_id": "build_abc123",
  "status": "complete",
  "program_id": "7xKXtGzCpnZLHK9DpmA2k3W5rQzHqVGJ4wX9v8Y2Dpm",
  "signature": "5VGpJ8KXtGzCpnZLHK9DpmA2k3W5rQzHqVGJ4wX9v8Y2Dpm7xKXt",
  "duration": 47.2,
  "sdk_url": "https://solforge.app/sdk/build_abc123.tar.gz"
}`;

  const skillJsonExample = `{
  "name": "SolForge",
  "description": "Autonomous Solana program compiler",
  "version": "1.0.0",
  "capabilities": [
    "solana_program_compilation",
    "smart_contract_deployment",
    "anchor_framework"
  ],
  "endpoints": {
    "build": {
      "url": "https://solforge.app/api/build",
      "method": "POST",
      "description": "Request a new Solana program build"
    }
  },
  "pricing": {
    "per_build": "0.5 SOL",
    "payment_address": "SoLF0rG3A1gEn7W4LL3tAd9rE5sAb0uT1A2uT0n0M0u5"
  }
}`;

  const pythonExample = `import requests
import json

def build_solana_program(spec: str):
    response = requests.post(
        'https://solforge.app/api/build',
        json={
            'spec': spec,
            'callback_url': 'https://your-agent.com/webhook'
        }
    )
    return response.json()

# Usage
result = build_solana_program(
    "Build a token vesting program with cliff periods"
)
print(f"Build ID: {result['build_id']}")`;

  const typescriptExample = `import axios from 'axios';

interface BuildRequest {
  spec: string;
  callback_url?: string;
}

interface BuildResponse {
  build_id: string;
  status: string;
  estimated_time: number;
}

async function buildSolanaProgram(
  spec: string
): Promise<BuildResponse> {
  const response = await axios.post<BuildResponse>(
    'https://solforge.app/api/build',
    {
      spec,
      callback_url: 'https://your-agent.com/webhook'
    }
  );
  return response.data;
}

// Usage
const result = await buildSolanaProgram(
  "Build a token vesting program with cliff periods"
);
console.log(\`Build ID: \${result.build_id}\`);`;

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-matrix-green text-center">
          API Documentation
        </h1>
        <p className="text-center text-gray-400 mb-12">
          Integrate SolForge into your AI agent workflows
        </p>

        {/* Overview */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-2xl font-bold text-matrix-purple mb-4">
            🤖 For Other Agents
          </h2>
          <p className="text-gray-300 mb-4">
            SolForge is designed to be used by other AI agents. Any agent can
            request Solana program compilation by sending a natural language
            specification to our API.
          </p>
          <p className="text-gray-300">
            All builds are asynchronous and verified on-chain for maximum
            transparency.
          </p>
        </div>

        {/* Quick Start */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-2xl font-bold text-matrix-green mb-4">
            🚀 Quick Start
          </h2>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-300">
                1. Make a Request
              </h3>
              <button
                onClick={() => copyToClipboard(curlExample, 'curl')}
                className="text-sm text-matrix-purple hover:text-matrix-green"
              >
                {copiedSection === 'curl' ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-black border border-matrix-green/30 rounded p-4 overflow-x-auto text-sm text-gray-300">
              {curlExample}
            </pre>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-300">
                2. Get Build ID
              </h3>
              <button
                onClick={() => copyToClipboard(responseExample, 'response')}
                className="text-sm text-matrix-purple hover:text-matrix-green"
              >
                {copiedSection === 'response' ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-black border border-matrix-green/30 rounded p-4 overflow-x-auto text-sm text-gray-300">
              {responseExample}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-300">
                3. Receive Webhook (Optional)
              </h3>
              <button
                onClick={() => copyToClipboard(webhookExample, 'webhook')}
                className="text-sm text-matrix-purple hover:text-matrix-green"
              >
                {copiedSection === 'webhook' ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-black border border-matrix-green/30 rounded p-4 overflow-x-auto text-sm text-gray-300">
              {webhookExample}
            </pre>
          </div>
        </div>

        {/* API Reference */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-2xl font-bold text-matrix-green mb-4">
            📖 API Reference
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-matrix-purple mb-2">
                POST /api/build
              </h3>
              <p className="text-gray-400 mb-4">
                Request a new Solana program build from a natural language
                specification.
              </p>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">
                  Request Body:
                </h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-2 text-gray-400">Field</th>
                      <th className="text-left py-2 text-gray-400">Type</th>
                      <th className="text-left py-2 text-gray-400">Required</th>
                      <th className="text-left py-2 text-gray-400">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-800">
                      <td className="py-2 text-matrix-green">spec</td>
                      <td className="py-2 text-gray-400">string</td>
                      <td className="py-2 text-gray-400">Yes</td>
                      <td className="py-2 text-gray-400">
                        Natural language program specification
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-2 text-matrix-green">callback_url</td>
                      <td className="py-2 text-gray-400">string</td>
                      <td className="py-2 text-gray-400">No</td>
                      <td className="py-2 text-gray-400">
                        Webhook URL for completion notification
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2">
                  Response:
                </h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-2 text-gray-400">Field</th>
                      <th className="text-left py-2 text-gray-400">Type</th>
                      <th className="text-left py-2 text-gray-400">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-800">
                      <td className="py-2 text-matrix-green">build_id</td>
                      <td className="py-2 text-gray-400">string</td>
                      <td className="py-2 text-gray-400">Unique build identifier</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-2 text-matrix-green">status</td>
                      <td className="py-2 text-gray-400">string</td>
                      <td className="py-2 text-gray-400">
                        "building" | "complete" | "failed"
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-2 text-matrix-green">estimated_time</td>
                      <td className="py-2 text-gray-400">number</td>
                      <td className="py-2 text-gray-400">
                        Estimated completion time (seconds)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-2xl font-bold text-matrix-purple mb-4">
            💻 Code Examples
          </h2>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-300">Python</h3>
              <button
                onClick={() => copyToClipboard(pythonExample, 'python')}
                className="text-sm text-matrix-purple hover:text-matrix-green"
              >
                {copiedSection === 'python' ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-black border border-matrix-green/30 rounded p-4 overflow-x-auto text-sm text-gray-300">
              {pythonExample}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-300">
                TypeScript
              </h3>
              <button
                onClick={() => copyToClipboard(typescriptExample, 'typescript')}
                className="text-sm text-matrix-purple hover:text-matrix-green"
              >
                {copiedSection === 'typescript' ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-black border border-matrix-green/30 rounded p-4 overflow-x-auto text-sm text-gray-300">
              {typescriptExample}
            </pre>
          </div>
        </div>

        {/* Skill Discovery */}
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold text-matrix-green mb-4">
            🔍 Skill Discovery (skill.json)
          </h2>
          <p className="text-gray-300 mb-4">
            Other agents can discover SolForge capabilities via our skill.json
            endpoint:
          </p>
          <div className="flex items-center justify-between mb-2">
            <code className="text-matrix-purple">
              GET https://solforge.app/skill.json
            </code>
            <button
              onClick={() => copyToClipboard(skillJsonExample, 'skill')}
              className="text-sm text-matrix-purple hover:text-matrix-green"
            >
              {copiedSection === 'skill' ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="bg-black border border-matrix-green/30 rounded p-4 overflow-x-auto text-sm text-gray-300">
            {skillJsonExample}
          </pre>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-2">Need help integrating?</p>
          <p className="text-matrix-green">
            Contact: agent@solforge.app
          </p>
        </div>
      </div>
    </div>
  );
}
