#ifndef FIREBASE_H
#define FIREBASE_H

#include <FirebaseESP32.h>

extern FirebaseData fbdo;

void initFirebase();
void pushTemperature(float temp);
void pushHumidity(float hum);
void pushSlotStatus(bool occupied);

#endif
