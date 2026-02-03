import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { executeBuild } from './builder';
import { BuildEvent } from './types';
import { getWorkspaceStats } from './workspace';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'SolForge Build Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Get workspace stats
app.get('/stats', (req: Request, res: Response) => {
  const stats = getWorkspaceStats();
  res.json(stats);
});

// Build endpoint
app.post('/build', async (req: Request, res: Response) => {
  const { spec } = req.body;

  if (!spec || typeof spec !== 'string') {
    return res.status(400).json({
      error: 'Missing or invalid "spec" in request body'
    });
  }

  console.log('\n=== NEW BUILD REQUEST ===');
  console.log('Spec:', spec);
  console.log('========================\n');

  // Set up SSE headers for streaming events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (event: BuildEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  try {
    const result = await executeBuild(spec, sendEvent);

    // Send final result
    res.write(`data: ${JSON.stringify({ type: 'result', ...result })}\n\n`);
    res.end();

    console.log('\n=== BUILD COMPLETE ===');
    console.log('Success:', result.success);
    if (result.programId) {
      console.log('Program ID:', result.programId);
      console.log('Program Name:', result.programName);
    }
    console.log('=====================\n');

  } catch (error: any) {
    console.error('Build error:', error);
    sendEvent({
      type: 'error',
      error: error.message || String(error)
    });
    res.end();
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   SolForge Build Engine v1.0.0        ║
║   Port: ${PORT}                           ║
║   Status: READY                       ║
╚═══════════════════════════════════════╝

Endpoints:
  GET  /health  - Health check
  GET  /stats   - Workspace statistics
  POST /build   - Build Anchor program from spec

Waiting for build requests...
  `);
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down SolForge Engine...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\nShutting down SolForge Engine...');
  process.exit(0);
});
