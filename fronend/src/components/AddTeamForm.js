import axios from "axios";
import { useEffect, useState } from "react";
import { UpdateList } from "../ListContext.js";
import "./AddTeamForm.css";

/**
 * form to add a team to track
 */

const AddTeamForm = () => {
  const [league, setLeague] = useState("");
  const [teamOptions, setTeamOptions] = useState([]);
  const [team, setTeam] = useState(null);
  const { triggerRefresh } = UpdateList();

  //called when the first dropdown chnges
  useEffect(() => {
    if (league) {
      fetchOptions(league);
    } else {
      setTeamOptions([]);
    }
  }, [league]);

  //called when the second dropdown chnges
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (team) {
      const teamInfo = {
        TeamId: team.id,
        name: team.name,
        shortName: team.shortName,
        tla: team.tla,
        crest: team.crest,
      };
      try {
        await addTeam(teamInfo);
        setLeague("");
        setTeamOptions([]);
        setTeam(null);
      } catch (error) {
        console.error("Error during handleSubmit:", error);
      }
    } else {
      console.error("No team selected.");
    }
  };

  /**
   * * fetchOptions
   * fetch the options for the second deopdown based on the first dropdown
   */
  const fetchOptions = async (selectedLeague) => {
    try {
      const response = await fetch(`/api/teamoptions/${selectedLeague}`);
      const json = await response.json();
      setTeamOptions(json);
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * * addTeam
   * function to add team to list in database
   * calls /api/teams
   * @params teamInfo id, crest url, name, short name, tla
   */
  const addTeam = async (teamInfo) => {
    try {
      const response = await axios.post("/api/teams", teamInfo, {
        withCredentials: true,
      });
      alert("Team added");
      console.log("Team added successfully:", response.data);
      triggerRefresh();
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Handle error if team already exists
        alert("Team with this TeamId already exists.");
      } else {
        // Handle other errors
        console.error("Error adding team:", error);
        alert("There was an error adding the team.");
      }
      throw error;
    }
  };

  //TODO when a button is pressed, make all buttons not useable until it is done.
  return (
    <div>
      <form className="addTeam" onSubmit={handleSubmit}>
        <label>
          Select league:
          <select
            value={league || ""}
            onChange={(e) => setLeague(e.target.value)}
          >
            <option value="">--choose a league--</option>
            <option value="PL">Premier League</option>
            <option value="PD">La Liga</option>
            <option value="CL">Champions League </option>
          </select>
        </label>
        <br />
        <label>
          Select team:
          <select
            value={team ? team.TeamId : ""}
            onChange={(e) => {
              const selectedId = e.target.value; // Get the selected team's id
              const selectedTeam = teamOptions.find(
                (option) => option.id.toString() === selectedId
              );
              setTeam(selectedTeam || null); // Set the selected team object
            }}
            disabled={setTeamOptions.length === 0}
          >
            <option value="">--choose a team--</option>
            {teamOptions.map((option, index) => (
              <option key={index} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
        {/*button*/}
        <br />
        <button type="submit" disabled={!league || !team}>
          Add
        </button>
      </form>
    </div>
  );
};

export default AddTeamForm;
