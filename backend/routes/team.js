const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth')
const checkAllowedDomain = require('../middleware/checkDomain')


const team = require('../controllers/teamsController');
const mmanagermembers = require('../controllers/getmanagerteam');
const searchteam = require('../controllers/searchteammembers');
const getUser = require('../controllers/userController');
const deleteuser = require('../controllers/userController');
const updatepassword = require('../controllers/updatepassword');
//adding new member to team

//team and team members simple flow
// router.post('/add-member-to-department', team.addMemberToTeam); // add team members

router.post('/add-member-to-department',checkAllowedDomain(), team.addMemberToTeam); // add team members
router.post('/simpleAddMemberToTeam', team.simpleAddMemberToTeam); // add team members

router.post('/create-department', team.createTeam); // create teams

router.post('/getAllDepartments', team.getAllTeams); // get all teams 

router.delete('/department/:id', team.deleteTeam); // delete team  

router.get('/:departmentId/members', team.getTeamMembers); // get team members 

router.get("/hod/:hodId/employees", authMiddleware, team.getEmployeesByHOD);


// router.get('/get-hods', authMiddleware, team.getAllHODs)
router.get('/get-hods',  team.getAllHODs)

//tracking down the history section
router.get('/user-team-members', mmanagermembers.getUserTeamMembers);

router.get('/search-team-members', searchteam.searchTeamMembers);

router.get('/member/:id', getUser.getUserById);

router.delete('/member/:id', deleteuser.deleteUserById);

router.put('/member/:id/password', updatepassword.updateMemberPassword);


module.exports = router;
