const express = require("express");
const router = express.Router();
const { savePersonalDetails } = require("../controllers/userPersonalDetails");

router.post("/save", savePersonalDetails);

module.exports = router;
