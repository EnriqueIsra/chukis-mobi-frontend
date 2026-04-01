import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import { LoginPage } from "./auth/LoginPage";
import { MainLayout } from "./layout/MainLayout";
import { ProductsPage } from "./pages/ProductsPage";
import { UsersPage } from "./pages/UsersPage";
import { ClientsPage } from "./pages/ClientsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { RentalsPage } from "./pages/RentalsPage";
import { CalendarPage } from "./pages/CalendarPage";
import { ProvidersPage } from "./pages/ProvidersPage";
import { RentalExternalItemsPage } from "./pages/RentalExternalItemsPage";
import { ExpensesPage } from "./pages/ExpensesPage";
import { NominaPage } from "./pages/NominaPage";
import { ReportsPage } from "./pages/ReportsPage";
import { QuotationsPage } from "./pages/QuotationsPage";
import { ContractsPage } from "./pages/ContractsPage";

// Función para verificar si token JWT está expirado
// Un token JWT tiene 3 partes separadas por puntos:
//    header.payload.signature
//    eyXXX.eyYYY.zzz
// El payloado (parte del medio) contiene un campo "exp" que es la fecha de expiración en segundos desde 1970
// Pasos:
// 1.- token.split('.')[1] -> extrae la parte del payload
// 2.- atob() -> decodifica de Base64 a texto
// 3.- JSON.parse() -> convierte el texto a objeto JavScript
// 4.- payload.exp * 1000 -> convierte segundos a milisegundos
// 5.- Comparamos con Date.now() (milisegundos actuales)
// Si exp es menor que ahora -> el token ya expiró -> return true
// Si no se puede decodificar -> asumimos expirado -> return true
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const App = () => {
  // Al iniciar el estado, ahora verificamos si el token está expirado
  // Si hay un usuario en localStorage PERO su token ya expiró
  //    - Limpiamos localStorage
  //    - Retornamos null (como si no hubiera sesión)
  //    - Esto hace que la app muestre /login directamente
  // Si el token es válido (no expirado)
  //    - Retornamos el usuario normalmente
  //    - La app muestra el dashboard como siempre.
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.token && isTokenExpired(parsed.token)) {
        localStorage.removeItem("user");
        return null;
      }
      return parsed;
    }
    return null;
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
            user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />
          }
        />

        <Route
          element={
            user ? (
              <MainLayout user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/rentals" element={<RentalsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/providers" element={<ProvidersPage />} />
          <Route path="/rental-external-items" element={<RentalExternalItemsPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/nomina" element={<NominaPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/quotations" element={<QuotationsPage />} />
          <Route path="/contracts" element={<ContractsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
