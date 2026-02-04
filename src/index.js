import express from 'express';
import { matchRouter } from './routes/matches.js';
import http from 'http';
import { attachWebSocketServer } from './ws/server.js';
import { securityMiddleware } from './arcjet.js';
import { commentaryRouter } from './routes/commentary.js';

const PORT = 8000;
const HOST = '0.0.0.0';

const app = express();
const server = http.createServer(app);

// JSON middleware
app.use(express.json());

// Root GET route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Sportz API!' });
});

app.use(securityMiddleware());

app.use('/matches', matchRouter);
app.use('/matches/:id/commentary', commentaryRouter);

const { broadcastMatchCreated, broadcastCommentary } = attachWebSocketServer(server);

app.locals.broadcastMatchCreated = broadcastMatchCreated;
app.locals.broadcastCommentary   = broadcastCommentary;

// Start server
server.listen(PORT, HOST, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Server is running on ${url}`);
  console.log(`Websocket server is running on ${url.replace('http', 'ws')}/ws`)
});
