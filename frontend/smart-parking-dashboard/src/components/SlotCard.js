import React from "react";

const SlotCard = ({ slotData, isOccupied }) => {
  // Safe formatting for time
  const entryTime = slotData?.time 
    ? new Date(slotData.time).toLocaleTimeString() 
    : "--:--";
    
  // Your IoT code saves the specific string 'Entered' or 'Exited'
  // We can display that directly if we want, or map it to 'Occupied'
  const displayStatus = isOccupied ? "Occupied" : "Available";

  return (
    <div className={`slot-card ${isOccupied ? "occupied" : "available"}`}>
      
      <div className="slot-name">
        {isOccupied ? "SLOT 1 - FULL" : "SLOT 1 - FREE"}
      </div>

      <div className="slot-status">
        {displayStatus}
      </div>

      {/* IF OCCUPIED: Show the Plate Number your AI detected */}
      {isOccupied && (
        <div className="slot-details" style={{ marginTop: '20px', textAlign: 'center' }}>
          
          <div style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold', letterSpacing: '2px' }}>
            {/* Show the plate from DB, or '...' if loading */}
            {slotData?.plate || "..."}
          </div>
          
          <div style={{ color: '#ccc', fontSize: '14px', marginTop: '5px' }}>
            Entered at: {entryTime}
          </div>

        </div>
      )}

      {/* IF VACANT: Show waiting message */}
      {!isOccupied && (
        <div style={{ marginTop: '20px', color: '#888', fontStyle: 'italic' }}>
          Waiting for vehicle...
        </div>
      )}

    </div>
  );
};

export default SlotCard;