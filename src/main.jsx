import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import Sidebar from "./components/sidebar.jsx";
import LoginForm from "./components/login.jsx";
import App from "./App.jsx";
import Role from "./components/role/role.jsx";
import Item from "./components/item/item.jsx";
import DailySaleItem from "./components/dailysale/dailysale.jsx";
import SPKMonthly from "./components/spk/spkMonthly.jsx";
import SPKAnnual from "./components/spk/spkAnnual.jsx";
import EmployeeList from "./components/employee/employee.jsx";
import "./index.css";

function Main() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState("app");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    const token = localStorage.getItem("auth_token");

    if (!storedUser && !token) {
      setUserData(JSON.parse(storedUser));
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLoginSuccess = (user, token) => {
    setUserData(user);
    setIsAuthenticated(true);
    localStorage.setItem("userData", JSON.stringify(user));
    localStorage.setItem("auth_token", token);
  };

  const handleLogout = () => {
    setUserData(null);
    setIsAuthenticated(false);
    localStorage.removeItem("userData");
    localStorage.removeItem("auth_token");
  };

  return (
    <StrictMode>
      {isAuthenticated ? (
        <div style={{ display: "flex", height: "100vh" }}>
          <Sidebar setActivePage={setActivePage} onLogout={handleLogout} user={userData} />
          <div style={{ flex: 1, overflow: "auto" }}>
            {activePage === "app" && <App user={userData} />}
            {activePage === "employee" && <EmployeeList user={userData} />}
            {activePage === "sale" && <DailySaleItem user={userData} />}
            {activePage === "spk-monthly" && <SPKMonthly user={userData} />}
            {activePage === "spk-annual" && <SPKAnnual user={userData} />}
            {activePage === "role" && <Role user={userData} />}
            {activePage === "item" && <Item user={userData} />}
          </div>
        </div>
      ) : (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      )}
    </StrictMode>
  );
}

createRoot(document.getElementById("root")).render(<Main />);
