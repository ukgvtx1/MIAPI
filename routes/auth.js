// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { sendError } = require('./_helpers');

router.post('/register', async (req, res) => {
    try {
        await authController.registrar(req, res);
    } catch (error) {
        sendError(res, error);
    }
});

router.post('/login', async (req, res) => {
    try {
        await authController.login(req, res);
    } catch (error) {
        sendError(res, error);
    }
});

module.exports = router;