const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const teamsSchema = new Schema(
  {
    TeamId: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    shortName: {
      type: String,
      required: true,
    },
    tla: {
      type: String,
      required: true,
    },
    crest: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
const TeamModel = mongoose.model("addedTeamModel", teamsSchema);

//need to add an eventID for the google calendar event id.
const matchSchema = new Schema(
  {
    MatchId: {
      type: Number,
      required: true,
    },
    EventId: {
      type: String,
      required: true,
    },
    homeTeamId: {
      type: Number,
      required: true,
    },
    awayTeamId: {
      type: Number,
      required: true,
    },
    competition: {
      type: String,
      required: true,
    },
    utcDate: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
const MatchModel = mongoose.model("addedMatchModel", matchSchema);

module.exports = { TeamModel, MatchModel };
// id: 86,
// name: 'Real Madrid CF',
// shortName: 'Real Madrid',
// tla: 'RMA',
// crest: 'https://crests.football-data.org/86.png'
