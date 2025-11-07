const express = require('express');
const router = express.Router();

const user = require('../controllers/userController');

// User
router.post('/user-stats', user.getStats);
router.get('/hr-users', user.getHrUsers);
router.get('/get-all-employees', user.getAllEmployees);
// router.post('/get-user-role', user.getUserRole); // west
router.get('/search-users', user.searchUsers);
router.get('/get-profile',user.getUserById);
router.get('/managers',user.getManagers);
router.delete('/deleteuser/:id',user.deleteUserById);

router.patch('/status', user.updateUserStatus);



module.exports = router;
