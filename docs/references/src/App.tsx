/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import AppLayout from "./components/layout/AppLayout";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import { User } from "./constants";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<"login" | "register" | "app">("login");

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setView("app");
  };

  const handleLogout = () => {
    setUser(null);
    setView("login");
  };

  const renderView = () => {
    switch (view) {
      case "login":
        return <Login onLogin={handleLogin} onGoToRegister={() => setView("register")} />;
      case "register":
        return <Register onGoToLogin={() => setView("login")} />;
      case "app":
        return user ? <AppLayout user={user} onLogout={handleLogout} /> : <Login onLogin={handleLogin} onGoToRegister={() => setView("register")} />;
      default:
        return <Login onLogin={handleLogin} onGoToRegister={() => setView("register")} />;
    }
  };

  return (
    <TooltipProvider>
      {renderView()}
    </TooltipProvider>
  );
}
