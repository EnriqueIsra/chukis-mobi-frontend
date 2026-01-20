import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import { LoginPage } from "./auth/LoginPage";
import { MainLayout } from "./layout/MainLayout";
import { ProductsPage } from "./pages/ProductsPage";
import { UsersPage } from "./pages/UsersPage";
import { ClientsPage } from "./pages/ClientsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { RentalsPage } from "./pages/RentalsPage";


export const App = () => {

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={
            user
              ? <Navigate to="/" />
              : <LoginPage onLogin={handleLogin} />
          }
        />

        <Route
          element={
            user
              ? <MainLayout user={user} onLogout={handleLogout} />
              : <Navigate to="/login" />
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/rentals" element={<RentalsPage />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
};
