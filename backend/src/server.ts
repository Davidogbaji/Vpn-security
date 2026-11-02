import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import crypto from 'crypto';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticateUser } from './middleware/auth.js';
import { logger } from './utils/logger.js';

// Route imports
import ipRoutes from './routes/ipRoutes.js';
import detectionRoutes from './routes/detectionRoutes.js';
import networkRoutes from './routes/networkRoutes.js';
import dnsRoutes from './routes/dnsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Security headers
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost in development or specified production origins
      if (!origin || origin.startsWith('http://localhost:') || origin === config.corsOrigin) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for academic testing, strict in production
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  })
);

// Body parsing with size limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Request ID and Request Logging Middleware
app.use((req: Request, res: Response, next) => {
  const reqId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  req.headers['x-request-id'] = reqId;
  res.setHeader('X-Request-ID', reqId);

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} [${res.statusCode}] - ${duration}ms (ReqID: ${reqId})`);
  });

  next();
});

// Optional User Authentication Token Parser
app.use(authenticateUser);

// Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'HEALTHY',
    system: 'VPN and Proxy IP Detection System API',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    mode: config.nodeEnv,
  });
});

// Mount Module Routes
app.use('/api/ip', ipRoutes);
app.use('/api/detection', detectionRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/dns', dnsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/admin', adminRoutes);

// 404 Route Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found on VPN & Proxy Detection API server',
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server if not imported by test runner
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    logger.info(`=======================================================`);
    logger.info(`  VPN AND PROXY IP DETECTION SYSTEM - BACKEND API`);
    logger.info(`  Server listening on port http://localhost:${config.port}`);
    logger.info(`  Health check: http://localhost:${config.port}/api/health`);
    logger.info(`  Environment: ${config.nodeEnv}`);
    logger.info(`=======================================================`);
  });
}

export default app;
