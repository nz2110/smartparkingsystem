import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const Header = ({ isAdmin, onLoginClick }) => {
  const [gateStatus, setGateStatus] = useState("Closed");

  useEffect(() => {
    // Poll for gate status every second
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("system_status")
        .select("gate_status")
        .eq("id", 1)
        .single();
      
      if (data) setGateStatus(data.gate_status);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-title">IoT Smart Parking System</div>
        <div className="brand-sub">Real-time parking management with ESP32</div>
      </div>

      <div className="gate-status-box">
        <div className="gate-label">Gate Status</div>
        {/* Dynamic Gate Value */}
        <div className="gate-value" style={{ 
          color: gateStatus === 'OPEN' ? '#2ecc71' : '#e74c3c' 
        }}>
          {gateStatus}
        </div>
        <div style={{fontSize: '10px', color: '#444', marginTop:'5px'}}>entry gate status</div>
      </div>
    </header>
  );
};

export default Header;