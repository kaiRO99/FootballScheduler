require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const oAuth2Client = require("./config/googleConfig");
const teamsRoutes = require("./routes/teamsRoutes");
const mongoose = require("mongoose");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const session = require("express-session");
const passport = require("passport");
const axios = require("axios");


// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from this origin
    methods: "GET,POST,PUT,DELETE", // Specify allowed methods
    credentials: true, // Allow credentials (cookies)
  })
);

//middleware
app.use(express.json());
app.use((req, res, next) => {
  next();
});
app.use(express.urlencoded({ extended: true }));

//connect to mongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("connected to mongodb and listening on port");
    });
  })
  .catch((err) => {
    console.log(err);
  });

/**
 * * getTeamOptions
 * Gets the options for the second dropdown menu
 */
const getTeamOptions = async (req, res) => {
  const BASE_URL = `https://api.football-data.org/v4/competitions/`;
  const selectedValue = req.params.value;
  try {
    // Make the API call based on the selected value
    const apiUrl = BASE_URL + `${selectedValue}` + "/teams";
    const response = await axios.get(apiUrl, {
      headers: {
        "X-Auth-Token": process.env.API_KEY_FD,
      },
    });

    res.json(response.data.teams);
  } catch (error) {
    console.error("Error fetching data from external API:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};

/**
 * * getSchedule
 * Gets the match schedule for a given team
 */
const getSchedule = async (req, res) => {
  const selectedValue = req.params;
  const BASE_URL = `https://api.football-data.org/v4/teams/`;
  try {
    // Make the API call based on the selected value
    const apiUrl =
      BASE_URL + `${selectedValue.id}` + "/matches?status=SCHEDULED";
    const response = await axios.get(apiUrl, {
      headers: {
        "X-Auth-Token": process.env.API_KEY_FD,
      },
    });
    res.json(response.data.matches);
  } catch (error) {
    console.error("Error fetching data from external API:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};

// * routes
//post, get and delete from MongoDB list of added teams
app.use("/api/teams", teamsRoutes);
//gets the options for the second dropdown.
app.use("/api/teamoptions/:value", getTeamOptions);
//gets the schedule for a team
app.use("/api/teamschedule/:id", getSchedule);
//handles google authorization and adding events.
app.use("/auth", authRoutes);

