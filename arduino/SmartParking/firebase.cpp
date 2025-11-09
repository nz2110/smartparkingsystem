
#include "firebase.h"
#include "config.h"

FirebaseData fbdo;

void initFirebase() {
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
}

void pushTemperature(float temp) {
  Firebase.RTDB.setFloat(&fbdo, "/parking/temp", temp);
}

void pushHumidity(float hum) {
  Firebase.RTDB.setFloat(&fbdo, "/parking/humidity", hum);
}

void pushSlotStatus(bool occupied) {
  Firebase.RTDB.setBool(&fbdo, "/parking/slot1Occupied", occupied);
}