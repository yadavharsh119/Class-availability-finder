'use strict';

const express = require('express');

function apiRouter() {
  const router = express.Router();

  router.get('/classrooms', (req, res) => {
    res.json({ classrooms: req.store.list() });
  });

  return router;
}

module.exports = apiRouter;
