'use strict';

const express = require('express');
const authRouter = express.Router();

const { users } = require('../models/index');
const basicAuth = require('./middleware/basic.js');
const bearerAuth = require('./middleware/bearer.js');
const permissions = require('./middleware/acl.js');

authRouter.post('/signup', async (req, res, next) => {
  try {
    let userRecord = await users.create(req.body);
    if (!userRecord) {
      throw new Error('Failed to create user');
    }
    const output = {
      user: userRecord,
      token: userRecord.token
    };
    res.status(201).json(output);
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
});

// Error handling middleware
authRouter.use((error, req, res, next) => {
  res.status(500).json({ error: error.message });
});

authRouter.post('/signin', basicAuth, (req, res, next) => {
  // const user = {
  //   user: req.user,
  //   token: req.user.token
  // };
  res.status(200).json(req.user);
});

authRouter.get('/users', bearerAuth, permissions('delete'), async (req, res, next) => {
  try {
    const userRecords = await users.findAll({});
    const list = userRecords.map(user => user.username);
    res.status(200).json(list);
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
});

authRouter.get('/secret', bearerAuth, async (req, res, next) => {
  res.status(200).send('Welcome to the secret area');
});

// Error handling middleware
authRouter.use((error, req, res, next) => {
  res.status(500).json({ error: error.message });
});

module.exports = authRouter;
