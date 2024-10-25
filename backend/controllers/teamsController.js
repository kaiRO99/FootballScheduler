const { TeamModel, MatchModel } = require("../models/models");
const { google } = require("googleapis");
const oAuth2Client = require("../config/googleConfig");
const express = require("express");
const axios = require("axios");
const { oauth2 } = require("googleapis/build/src/apis/oauth2");
const app = express();

app.use(express.json());

/**
 * * getTeams
 * endpoint for get /api/teams/
 * returns all teams in database
 */
const getTeams = async (req, res) => {
  const teams = await TeamModel.find({}).sort({ createdAt: -1 });
  res.status(200).json(teams);
};

/**
 * * addTeam
 * endpoint for post /api/teams/
 * adds team to database, add all matches to the database and adds
 * the matches to the Google calendar as an event.
 */
const addTeam = async (req, res) => {
  const { TeamId, name, shortName, tla, crest } = req.body;

  if (!TeamId || !name || !shortName || !tla || !crest) {
    return res.status(400).json({ error: "All fields are required." });
  }
  //add to db
  try {
    //check for duplicates
    const inList = await TeamModel.findOne({ TeamId });
    if (inList) {
      return res
        .status(400)
        .json({ error: "Team with this TeamId already exists" });
    }

    //no duplicates, adding it to database
    const newTeam = await TeamModel.create({
      TeamId,
      name,
      shortName,
      tla,
      crest,
    });
    //get schedule from football-data.org using the team id
    const schedule = await axios.get(
      `http://localhost:8000/api/teamschedule/${TeamId}`
    );

    //for each scheduled match, check for duplicates with match id. if none, add to db
    for (let match of schedule.data) {
      const inDB = await matchInDB(match.id);
      if (inDB) {
        continue;
      }
      //add to db and calendar
      await addMatch(match);
    }
    res.status(200).json(newTeam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * *rmTeam
 * endpoint for delete /api/teams/:id
 * Deletes a team (id) from the database, removes all non-competing matches from database.
 * If a match is removed from the databse, the corresponding event is also removed from the Google calendar
 * @param id the id of the team to be removed
 */
const rmTeam = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedTeam = await TeamModel.findOneAndDelete({
      TeamId: Number(id),
    });
    await rmMatches(id);
    if (!deletedTeam) {
      return res.status(400).json({ error: "No such team" });
    }
    await rmMatches(id);
    res.status(200).json(deletedTeam);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting team", error: error.message });
  }
};

/**
 * * matchInDB
 * checks if match already exists in db
 * @params id the match id to search
 */
const matchInDB = async (id) => {
  const inDB = await MatchModel.findOne({ MatchId: id });
  if (inDB) {
    return true;
  } else {
    return false;
  }
};

/**
 * * addEvent
 * adds a google calendar event to a specified calendar
 * @param gameInfo object with date, summary and descriptong for event
 */
const addEvent = async (gameInfo) => {
  try {
    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
    const response = await calendar.events.insert({
      calendarId: process.env.CALENDAR_ID,
      resource: gameInfo,
    });
    return response.data;
  } catch (error) {
    console.error("error adding event to calendar", error.message);
    throw new Error(error.message);
  }
};

/**
 * *addMatch
 * Creates the content for a google calendar event, then takes the event id and adds it to the mongo db
 * @param match match data (time, date, teams, etc.)
 */
const addMatch = async (match) => {
  try {
    //information for the calendar event
    const gameInfoCalendar = {
      summary: `${match.homeTeam.tla} vs ${match.awayTeam.tla}, ${match.competition.name}`,
      description: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      start: { dateTime: match.utcDate, timeZone: "Europe/London" },
      end: {
        dateTime: new Date(
          new Date(match.utcDate).getTime() + 2 * 60 * 60 * 1000
        ).toISOString(),
        timeZone: "Europe/London",
      },
    };

    //add to calendar
    const addedEvent = await addEvent(gameInfoCalendar);
    const gameInfoDB = {
      MatchId: match.id,
      EventId: addedEvent.id,
      homeTeamId: match.homeTeam.id,
      awayTeamId: match.awayTeam.id,
      competition: match.competition.name,
      utcDate: match.utcDate,
    };
    //add to db
    await MatchModel.create(gameInfoDB);
  } catch (error) {
    console.error("error adding matches to db and/or calendar", error.message);
    throw new Error(error.message);
  }
};

/**
 * *rmMatches
 * removes matches from the database and the Google calendar
 * includes some duplication handling
 * @param id the id of the team to be removed
 */
const rmMatches = async (id) => {
  //authentication handling, nor sure if needed
  if (oAuth2Client.credentials.expiry_date <= Date.now()) {
    const tokens = await oAuth2Client.refreshAccessToken(); // Get new tokens
    oAuth2Client.setCredentials(tokens.credentials); // Set the new tokens
  }
  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
  try {
    //find all matches with the selected team as either home or away
    const allMatches = await MatchModel.find({
      $or: [{ homeTeamId: id }, { awayTeamId: id }],
    });

    const deletedMatches = [];
    for (let match of allMatches) {
      /**
       * find the opponent, check the database of added teams,
       * only removes the match if the opponent is not in it
       */
      const otherTeam =
        match.homeTeamId === Number(id) ? match.awayTeamId : match.homeTeamId;
      const inList = await TeamModel.findOne({ TeamId: otherTeam });
      if (!inList) {
        const deletedMatch = await MatchModel.findOneAndDelete({
          MatchId: match.MatchId,
        });
        const calendarResponse = await calendar.events.delete({
          calendarId: process.env.CALENDAR_ID,
          eventId: match.EventId,
        });
        deletedMatches.push(calendarResponse);
      }
    }
    //probably not needed, used for error handling
    return deletedMatches;
  } catch (error) {
    console.error(
      "error deleting matches to db and/or calendar",
      error.message
    );
    throw new Error(error.message);
  }
};

/**
 * TODO update
 * get the schedule for a team, then compare each match to the database:
 * 1. if not in, add to db and calendar (a new match is scheduled)
 * 2. if it is in but a parameter is different, update the paramater (a match is updated)
 * 3. if the number of matches is different from the number of remaining matches,
 *    find and remove the exra match from the database and calendar (a match is cancelled)
 * 4.
 */

//TODO write fulctions for addnig teams, getting schedule, deleting
module.exports = {
  addTeam,
  getTeams,
  rmTeam,
};
