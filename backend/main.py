import cv2
import numpy as np
import requests
import easyocr
import time
import re
from datetime import datetime  
from supabase import create_client, Client

# ===========================
# 1. SETTINGS
# ===========================
ESP32_IP = "192.168.209.179" 
SUPABASE_URL = "https://hesedvhknyjcveycxdgh.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhlc2VkdmhrbnlqY3ZleWN4ZGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NjAwMjAsImV4cCI6MjA3OTUzNjAyMH0.Iz3f0JBDaGohHAAaaAeoK_k7iHo3B5kCr6GihTWQ4Es"

# ===========================
# 2. STATE VARIABLE
# ===========================
is_occupied = False 

print("🧠 Loading AI Brain...")
reader = easyocr.Reader(['en']) 
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print("✅ AI Ready! System Started.")

# Force Green Light
try:
    requests.get(f"http://{ESP32_IP}/set_empty", timeout=1)
except:
    pass

# --- HELPER FUNCTIONS ---
def is_valid_plate(text):
    if len(text) < 3: return False
    return bool(re.match(r"^[A-Z]+[0-9]+$", text))

def get_distance():
    try:
        resp = requests.get(f"http://{ESP32_IP}/distance", timeout=2)
        return int(resp.text)
    except:
        return 999 

def take_photo():
    try:
        resp = requests.get(f"http://{ESP32_IP}/capture", stream=True)
        if resp.status_code == 200:
            arr = np.asarray(bytearray(resp.content), dtype=np.uint8)
            img = cv2.imdecode(arr, -1)
            return img
    except Exception as e:
        print(f"Error: {e}")
    return None

def update_leds(full):
    endpoint = "set_full" if full else "set_empty"
    try:
        requests.get(f"http://{ESP32_IP}/{endpoint}", timeout=1)
    except:
        pass

# --- NEW: UPDATE GATE STATUS IN SUPABASE ---
def update_gate_status_db(status):
    """
    Updates Supabase with 'OPEN' or 'CLOSED'.
    We use upsert so it always updates the row with ID 1.
    """
    try:
        supabase.table("system_status").upsert({"id": 1, "gate_status": status}).execute()
        print(f"📡 Database Updated: Gate is {status}")
    except Exception as e:
        print(f"⚠️ Failed to update DB Gate Status: {e}")

def open_gate_safely():
    print("🔓 Open Gate")
    requests.get(f"http://{ESP32_IP}/open")
    
    # 1. TELL DASHBOARD GATE IS OPEN
    update_gate_status_db("OPEN") 
    
    print("⏳ Waiting 5s...")
    time.sleep(5) 

    while True:
        dist = get_distance()
        if dist > 0 and dist < 20:
            print(f"⚠️ Car at {dist}cm. Holding Gate.")
            time.sleep(1)
        else:
            print("✅ Clear. Closing Gate.")
            break 

    requests.get(f"http://{ESP32_IP}/close")
    
    # 2. TELL DASHBOARD GATE IS CLOSED
    update_gate_status_db("CLOSED") 

# ===========================
# 3. MAIN LOOP
# ===========================
while True:
    dist = get_distance()
    
    status_icon = "🔴 FULL" if is_occupied else "🟢 EMPTY"
    print(f"Status: {status_icon} | Dist: {dist} cm", end="\r")
    
    if dist > 0 and dist < 10:
        print(f"\n🚗 CAR DETECTED! Processing...")
        
        car_img = take_photo()
        if car_img is not None:
            cv2.imwrite("debug_photo.jpg", car_img)
            
            results = reader.readtext(car_img)
            valid_plate = ""
            for (bbox, text, prob) in results:
                print(f"   [AI saw]: {text} ({prob:.2f})")
                clean = text.upper().replace(" ", "").replace(".", "")
                if prob > 0.3 and is_valid_plate(clean):
                    valid_plate = clean
                    break
            
            if valid_plate:
                print(f"✅ VERIFIED PLATE: {valid_plate}")
                
                # GET CURRENT TIME
                current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                if not is_occupied:
                    # === ENTRY ===
                    print("➡️ CAR ENTERING...")
                    print("💾 Saving to DB...")
                    try:
                        data = supabase.table("parking_slots").insert({
                            "plate": valid_plate, 
                            "slot": "Slot A", 
                            "status": "Entered",
                            "time": current_time 
                        }).execute()
                        print("✅ SAVED TO DB SUCCESS!")
                    except Exception as e:
                        print(f"❌ DATABASE ERROR: {e}")
                        print("👉 HINT: Check if 'id' column is set to Identity/Auto-Increment in Supabase!")

                    open_gate_safely()
                    is_occupied = True
                    update_leds(True)

                else:
                    # === EXIT ===
                    print("⬅️ CAR EXITING...")
                    try:
                        data = supabase.table("parking_slots").insert({
                            "plate": valid_plate, 
                            "slot": "Slot A", 
                            "status": "Exited",
                            "time": current_time 
                        }).execute()
                        print("✅ SAVED TO DB SUCCESS!")
                    except Exception as e:
                        print(f"❌ DATABASE ERROR: {e}")

                    open_gate_safely()
                    is_occupied = False
                    update_leds(False)
                    
            else:
                print("❌ Invalid Plate. Gate Closed.")
            
            print("⏳ Cooldown...")
            time.sleep(3)
            
    time.sleep(0.5)