import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import SlotCard from "../components/SlotCard";

const UserDashboard = () => {
  const [latestEntry, setLatestEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestEntry();
    // Poll every 1 second to catch the moment the car enters/exits
    const interval = setInterval(fetchLatestEntry, 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchLatestEntry() {
    // 1. GET THE LATEST LOG
    // We order by 'id' because it's the safest way to get the newest row.
    const { data, error } = await supabase
      .from("parking_slots")
      .select("*")
      .order("id", { ascending: false }) 
      .limit(1);

    if (error) {
      console.error("Error fetching logs:", error);
    } else if (data && data.length > 0) {
      setLatestEntry(data[0]);
    }
    setLoading(false);
  }

  // --- LOGIC: CALCULATE OCCUPIED NUMBER ---
  // Your IoT code saves "Entered" when a car comes in.
  // It saves "Exited" when a car leaves.
  // So we simply check: Is the newest status "Entered"?
  const isOccupied = latestEntry?.status === "Entered";

  return (
    <main className="dashboard-root">
      
      {/* 1. STATS SECTION */}
      <section className="stats-container">
        
        {/* Available Counter */}
        <div className="stat-card green">
          <div className="stat-title">Available</div>
          {/* If NOT occupied, available is 1. If occupied, available is 0. */}
          <div className="stat-value">{!isOccupied ? 1 : 0}</div>
        </div>

        {/* Occupied Counter */}
        <div className="stat-card red">
          <div className="stat-title">Occupied</div>
          {/* If occupied, count is 1. Else 0. */}
          <div className="stat-value">{isOccupied ? 1 : 0}</div>
        </div>

      </section>

      {/* 2. SLOT VISUALIZATION */}
      <section className="layout-section">
        <div className="layout-header">Live Parking Spot Status</div>
        
        <div className="single-slot-container">
           {loading ? (
             <div style={{color:'white'}}>Syncing with Gate...</div>
           ) : (
             <SlotCard 
                slotData={latestEntry} 
                isOccupied={isOccupied} 
             />
           )}
        </div>
      </section>

    </main>
  );
};

export default UserDashboard;