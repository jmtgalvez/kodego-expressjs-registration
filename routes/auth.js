const express = require('express');
const router = express.Router();
const regController = require('../controllers/authAccount');

router.post('/login', regController.login)

router.post('/register', regController.register)


module.exports = router;