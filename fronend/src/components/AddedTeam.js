import { useEffect, useState } from "react";
import { UpdateList } from "../ListContext.js";

import "./AddedTeams.css";
import TeamItem from "./TeamItem.js";

/**
 * * component that lists the teams that are added to the database
 *  TODO: add an update button that calls /api/teams/update , refreshes when done
 */

const AddedTeam = ({ team }) => {
  const [teams, setTeams] = useState(null);
  const { refresh } = UpdateList();
  useEffect(() => {
    const fetchTeams = async () => {
      const response = await fetch("/api/teams", {
        credentials: 'include',
      });
      //an array of team objects
      const json = await response.json();

      if (response.ok) {
        setTeams(json);
      }
    };
    fetchTeams();
  }, [refresh]);

  return (
    <div>
      <div className="teams">
        {teams &&
          teams.map((team) => <TeamItem key={team.TeamId} team={team} />)}
      </div>
    </div>
  );
};

export default AddedTeam;
