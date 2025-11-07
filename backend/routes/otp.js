const express = require('express');
const router = express.Router();

const otp = require('../controllers/otp')

router.post('/verify-otp',otp.verifyOtp);
router.post('/resend-otp',otp.resendOtp);

module.exports = router;
