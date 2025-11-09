#include <WiFi.h>
#include "config.h"
#include "sensors.h"
#include "firebase.h"

void setup() {
  Serial.begin(115200);

  // Connect WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected to WiFi");

  // Init sensors & Firebase
  initSensors();
  initFirebase();
}

void loop() {
  float temp = readTemperature();
  float hum = readHumidity();
  bool occupied = isSlotOccupied();

  // Push data to Firebase
  pushTemperature(temp);
  pushHumidity(hum);
  pushSlotStatus(occupied);

  // Print to Serial Monitor
  Serial.print("Temp: "); Serial.print(temp);
  Serial.print(" °C, Humidity: "); Serial.print(hum);
  Serial.print(" %, Slot Occupied: "); Serial.println(occupied);

  delay(2000);
}
