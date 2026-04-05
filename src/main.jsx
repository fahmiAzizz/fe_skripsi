import { StrictMode } from "react";
import { useState } from "react";
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
import EvaluationWeight from "./components/evaluation/evaluation.jsx";
import "./index.css";
import { AuthProvider, useAuth } from "./contexts/authContext.jsx";

function MainContent() {
  const { isAuthenticated, userData, login, logout } = useAuth();
  const [activePage, setActivePage] = useState("app");

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={login} />;
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar setActivePage={setActivePage} onLogout={logout} user={userData} />
      <div style={{ flex: 1, overflow: "auto" }}>
        {activePage === "app" && <App user={userData} />}
        {activePage === "employee" && <EmployeeList user={userData} />}
        {activePage === "sale" && <DailySaleItem user={userData} />}
        {activePage === "spk-monthly" && <SPKMonthly user={userData} />}
        {activePage === "spk-annual" && <SPKAnnual user={userData} />}
        {activePage === "role" && <Role user={userData} />}
        {activePage === "item" && <Item user={userData} />}
        {activePage === "evaluation" && <EvaluationWeight user={userData} />}
      </div>
    </div>
  );
}

function Main() {
  return (
    <StrictMode>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")).render(<Main />);
