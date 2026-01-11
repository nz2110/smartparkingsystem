import React from "react";

const Header = ({ isAdmin, onLoginClick }) => {
  return (
    <header className="app-header">
      {/* Brand Section */}
      <div className="brand">
        <div className="brand-title">IoT Smart Parking System</div>
        <div className="brand-sub">Real-time parking management with ESP32</div>
      </div>

      {/* Gate Status - Top Right */}
      <div className="gate-status-box">
        <div className="gate-label">Gate Status</div>
        <div className="gate-value">Closed</div>
        {!isAdmin && (
           <div style={{fontSize: '10px', color: '#444', marginTop:'5px'}}>entry gate status</div>
        )}
      </div>
      
      {/* Hidden/Subtle Admin Login Trigger handled in App.js usually, 
          or you can keep a button here if you prefer */}
    </header>
  );
};

export default Header;