// import { useEffect, useState } from "react";
import "./Home.css";

import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListProvider, UpdateList } from "../ListContext.js";
//components
import AddedTeam from "../components/AddedTeam";
import AddTeamForm from "../components/AddTeamForm";

/**
 * main page, requires authentication 
 */

const Home = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    //check authentication
    const authenticate = async () => {
      const isAuthenticated = await checkAuth();
      setAuthenticated(isAuthenticated);
      if (!isAuthenticated) {
        navigate("/");
      }
    };
    authenticate();
  }, [navigate]);

  if (!authenticated) {
    return <div>authenticating...</div>;
  }

  /**
   * * checkAuth
   * calls /auth/checkauth
   * checks authentication status, backend will redirect if not authenticated 
   */
  const checkAuth = async () => {
    try {
      const response = await axios.get("auth/checkauth", {
        withCredentials: true,
      });
      return response.data.authenticated;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  };

  return (
    <div>
      <ListProvider>
        <div className="content">
          <AddedTeam />
          <AddTeamForm />
        </div>
      </ListProvider>
    </div>
  );
};

export default Home;
