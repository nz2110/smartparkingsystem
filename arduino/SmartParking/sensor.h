#ifndef SENSORS_H
#define SENSORS_H

#include <DHT.h>

#define DHTPIN 5
#define DHTTYPE DHT22

#define TRIG_PIN 4
#define ECHO_PIN 18

extern DHT dht;

void initSensors();
float readTemperature();
float readHumidity();
bool isSlotOccupied();

#endif
