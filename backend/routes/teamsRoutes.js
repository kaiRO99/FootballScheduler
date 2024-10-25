const express = require("express");
const { addTeam, getTeams, rmTeam } = require("../controllers/teamsController");
const router = express.Router();

//* routes for /api

//get all teams in database 
router.get("/", getTeams);

//add a team to database and add matches to Google calendar
router.post("/", addTeam);

//remove team from database and remove matches from calendar
router.delete("/:id", rmTeam);

//TODO update matches

module.exports = router;
