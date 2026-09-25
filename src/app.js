'use strict';

const path = require('path');
const express = require('express');

const { createStore } = require('./store/classrooms');
const pagesRouter = require('./routes/pages');
const apiRouter = require('./routes/api');
const { commitId } = require('./config');

function createApp() {
  const app = express();
  const store = createStore();

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use((req, _res, next) => {
    req.store = store;
    req.commitId = commitId();
    next();
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(pagesRouter());
  app.use('/api', apiRouter());

  // JSON 404 for unknown /api routes
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Central error handler
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };
