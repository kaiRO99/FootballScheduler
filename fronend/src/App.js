import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";

//components
import Home from "./pages/Home.js";
import Login from "./pages/Login.js";


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <div className="pages">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
