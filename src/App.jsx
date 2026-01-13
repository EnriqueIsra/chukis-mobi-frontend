import { useState } from "react";
import { LoginPage } from "./auth/LoginPage";
import { ChukisApp } from "./ChukisApp";

export const App = () => {

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <>
      {
        user
          ? <ChukisApp user={user} onLogout={handleLogout} />
          : <LoginPage onLogin={handleLogin} />
      }
    </>
  );
};
