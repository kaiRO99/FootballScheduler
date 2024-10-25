import axios from "axios";
import { UpdateList } from "../ListContext.js";
import "./TeamItem.css";

/**
 * * compoent of the items making up the list of teams in the database
 * includes name, badge, delete button
 */
const TeamItem = ({ team }) => {
  const { triggerRefresh } = UpdateList();
 
  //called when dee=lete buttin for a team is pressed 
  const handleClick = async () => {
    delTeam(team.TeamId);
  };

  /**
   * * delTeam
   * calls api/teams/:id
   * deletes a team from database and removes matches from the calendar 
   */
  const delTeam = async (TeamId) => {
    try {
      const response = await axios.delete(`/api/teams/${TeamId}`, {
        withCredentials: true,
      });
      console.log("Team deleted successfully:", response.data);
      triggerRefresh();
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  };

  return (
    <div className="teamInfo">
      <h3>{team.name}</h3>
      <img src={team.crest} alt={team.tla} height="40" />
      <button onClick={handleClick}>delete</button>

      <div className="logo"></div>
    </div>
  );
};

export default TeamItem;
