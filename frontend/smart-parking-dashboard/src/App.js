import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { supabase } from "./supabaseClient";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Logs from "./pages/Logs";
import Analytics from "./pages/Analytics";
import LoginForm from "./components/LoginForm";
import Header from "./components/Header";
import "./App.css";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // restore session (optional)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) setIsAdmin(true);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setShowLogin(false);
  };

return (
  <Router>
    <Header
      isAdmin={isAdmin}
      onLoginClick={() => setShowLogin(true)}
      onLogout={handleLogout}
    />

    {/* If login is open AND not admin → hide everything else */}
    {!isAdmin && showLogin ? (
      <>
        {/* Dim background */}
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <LoginForm
              setIsAdmin={(v) => {
                setIsAdmin(v);
                setShowLogin(false);
              }}
            />
          </div>
        </div>
      </>
    ) : (
      <>
        {/* Normal routing only when login is not active */}
        <Routes>
          {isAdmin && (
            <>
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/analytics" element={<Analytics />} />
            </>
          )}

          <Route
            path="*"
            element={isAdmin ? <AdminDashboard /> : <UserDashboard />}
          />
        </Routes>
      </>
    )}
  </Router>
);

}

export default App;
