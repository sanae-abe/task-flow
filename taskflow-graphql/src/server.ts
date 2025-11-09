/**
 * TaskFlow GraphQL Server
 * Apollo Server 4.x with WebSocket support for Subscriptions
 */

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { createServer } from 'http';
import express from 'express';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import cors from 'cors';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { resolvers } from './resolvers/index.js';
import { createDataLoaders } from './utils/dataloader.js';
import { getRedisClient, closeRedisClient } from './utils/redis-client.js';
import { graphqlRateLimitMiddleware } from './middleware/rate-limit.js';
import {
  requestIdMiddleware,
  requestLoggerMiddleware,
  httpLoggingMiddleware,
} from './middleware/logging.js';
import { logger } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// GraphQL型定義
const typeDefs = readFileSync(
  join(__dirname, 'schema/schema.graphql'),
  'utf-8'
);

// GraphQLスキーマ作成
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Express app
const app = express();
const httpServer = createServer(app);

// WebSocket server for subscriptions
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

// WebSocket handlerセットアップ
const serverCleanup = useServer({ schema }, wsServer);

// Apollo Server instance
const server = new ApolloServer({
  schema,
  plugins: [
    // HTTP serverの適切なシャットダウン
    ApolloServerPluginDrainHttpServer({ httpServer }),
    // WebSocket serverの適切なシャットダウン
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
  // GraphQL Playground有効化（開発環境のみ）
  introspection: process.env.NODE_ENV !== 'production',
});

// Server起動関数
async function startServer() {
  // Initialize Redis client (Week 8)
  const redisClient = getRedisClient();
  if (redisClient) {
    logger.info('Initializing Redis connection...');
  }

  await server.start();

  // Rate limiting configuration
  const rateLimitEnabled = process.env.REDIS_ENABLED === 'true';
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);
  const windowSeconds = parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS || '60', 10);

  // Global middleware (Week 8: Logging)
  app.use(requestIdMiddleware);
  app.use(requestLoggerMiddleware);
  app.use(httpLoggingMiddleware);

  // CORS設定
  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: process.env.CORS_ORIGIN || [
        'http://localhost:5173', // Vite dev server
        'http://localhost:4173', // Vite preview
        'http://localhost:3000', // 将来的なNext.js等
      ],
      credentials: true,
    }),
    express.json({ limit: '10mb' }), // ファイル添付対応
    // Rate limiting middleware (Week 8)
    graphqlRateLimitMiddleware({
      skip: !rateLimitEnabled,
      maxRequests,
      windowSeconds,
    }),
    expressMiddleware(server, {
      context: async ({ req }) => ({
        headers: req.headers,
        loaders: createDataLoaders(),
      }),
    })
  );

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'TaskFlow GraphQL Server is running',
      version: '1.0.0',
      uptime: process.uptime(),
    });
  });

  // Root endpoint
  app.get('/', (_req, res) => {
    res.json({
      message: 'TaskFlow GraphQL API',
      graphql: '/graphql',
      health: '/health',
      websocket: 'ws://localhost:4000/graphql',
      docs: 'See docs/SCHEMA.md for API documentation',
    });
  });

  const PORT = process.env.PORT || 4000;

  // HTTP server起動
  await new Promise<void>(resolve => {
    httpServer.listen(PORT, resolve);
  });

  logger.info('🚀 TaskFlow GraphQL Server ready!');
  logger.info(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
  logger.info(`🔌 WebSocket endpoint: ws://localhost:${PORT}/graphql`);
  logger.info(`💚 Health check: http://localhost:${PORT}/health`);
  logger.info(`🎮 GraphQL Playground: http://localhost:${PORT}/graphql`);
}

// Server起動
startServer().catch(serverError => {
  logger.fatal({ error: serverError }, 'Failed to start server');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully (SIGINT)...');
  await server.stop();
  await closeRedisClient(); // Week 8: Close Redis connection
  httpServer.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully (SIGTERM)...');
  await server.stop();
  await closeRedisClient(); // Week 8: Close Redis connection
  httpServer.close();
  process.exit(0);
});
