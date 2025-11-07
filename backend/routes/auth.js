const express = require('express');
const router = express.Router();

const checkAllowedDomain = require('../middleware/checkDomain.js')

const authController = require('../controllers/authController');
// const microsoftsignup=require('../controllers/microsoftsignup');
const forgetpass = require('../controllers/forgetpassword');



router.post('/login', authController.login);
router.post('/change-password', authController.changePassword);

// microsoft signup invitation for SUB_ADMIN, MANAGER
router.post('/add-member', checkAllowedDomain(), authController.addMember);
router.post('/simple-add-member', authController.simpleAddMember);

// microsoft verify signup & login
router.post('/verify-microsoft', authController.verifyMicrosoftAccount);
router.post('/verify-ms-login', authController.verifyMicrosoftLogin);



// router.post('/login-ms', microsoftsignup.microsoftLogin);

router.post('/reset-password', forgetpass.resetPassword);

router.post('/signup-initiate', authController.initiateSignup);
router.post('/signup-verify', authController.completeSignup);
// router.get('/verify-password-token/:token',signingup.verifyPasswordChangeToken);


router.post('/request-password-reset', forgetpass.requestPasswordReset);
router.post('/verify-password-reset-otp', forgetpass.verifyPasswordResetOTP);

//delete
// router.delete('/deleteuser/:id',deleteuser.deleteUserById);


module.exports = router;
