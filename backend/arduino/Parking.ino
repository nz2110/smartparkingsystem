#include "esp_camera.h"
#include <WiFi.h>
#include <WebServer.h>
#include <ESP32Servo.h>

// =======================
// 1. SETTINGS & PINS
// =======================
const char* ssid = "android";        // <--- CHECK THIS
const char* password = "nurzharifah@7378"; // <--- CHECK THIS

#define TRIG_PIN 13
#define ECHO_PIN 12
#define SERVO_PIN 14
#define GREEN_LED 15
#define RED_LED 2
#define FLASH_LED 4

WebServer server(80);
Servo myservo;

// =======================
// 2. CAMERA CONFIG
// =======================
void configCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = 5; config.pin_d1 = 18; config.pin_d2 = 19; config.pin_d3 = 21;
  config.pin_d4 = 36; config.pin_d5 = 39; config.pin_d6 = 34; config.pin_d7 = 35;
  config.pin_xclk = 0; config.pin_pclk = 22; config.pin_vsync = 25; config.pin_href = 23;
  config.pin_sccb_sda = 26; config.pin_sccb_scl = 27; config.pin_pwdn = 32; config.pin_reset = -1;
  config.xclk_freq_hz = 20000000; config.pixel_format = PIXFORMAT_JPEG;
  
  if(psramFound()){ config.frame_size = FRAMESIZE_VGA; config.jpeg_quality = 10; config.fb_count = 2; }
  else { config.frame_size = FRAMESIZE_QVGA; config.jpeg_quality = 12; config.fb_count = 1; }
  esp_camera_init(&config);
}

// =======================
// 3. SERVER FUNCTIONS
// =======================

// --- NEW: LED STATE COMMANDS ---
void handleSetFull() {
  digitalWrite(GREEN_LED, LOW);
  digitalWrite(RED_LED, HIGH);  // RED ON (Occupied)
  server.send(200, "text/plain", "FULL");
}

void handleSetEmpty() {
  digitalWrite(GREEN_LED, HIGH); // GREEN ON (Available)
  digitalWrite(RED_LED, LOW);
  server.send(200, "text/plain", "EMPTY");
}

// --- GATE COMMANDS (Motor Only) ---
void handleOpen() {
  myservo.write(180); 
  server.send(200, "text/plain", "OPENED");
}

void handleClose() {
  myservo.write(0); 
  server.send(200, "text/plain", "CLOSED");
}

// --- SENSORS ---
void handleDistance() {
  long duration, distance;
  digitalWrite(TRIG_PIN, LOW); delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  duration = pulseIn(ECHO_PIN, HIGH);
  distance = duration * 0.034 / 2;
  server.send(200, "text/plain", String(distance));
}

void handleCapture() {
  digitalWrite(FLASH_LED, HIGH); delay(150);
  camera_fb_t * fb = esp_camera_fb_get();
  digitalWrite(FLASH_LED, LOW);
  if (!fb) { server.send(500, "text/plain", "Fail"); return; }
  server.sendHeader("Content-Disposition", "inline; filename=capture.jpg");
  server.send_P(200, "image/jpeg", (const char *)fb->buf, fb->len);
  esp_camera_fb_return(fb);
}

// =======================
// 4. MAIN SETUP
// =======================
void setup() {
  Serial.begin(115200);
  
  pinMode(TRIG_PIN, OUTPUT); pinMode(ECHO_PIN, INPUT);
  pinMode(GREEN_LED, OUTPUT); pinMode(RED_LED, OUTPUT); pinMode(FLASH_LED, OUTPUT);
  
  myservo.setPeriodHertz(50); myservo.attach(SERVO_PIN, 500, 2400); myservo.write(0);

  // Default State: GREEN (Empty)
  digitalWrite(GREEN_LED, HIGH); 
  digitalWrite(RED_LED, LOW);

  configCamera();
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\n✅ ONLINE: " + WiFi.localIP().toString());

  server.on("/capture", handleCapture);
  server.on("/distance", handleDistance);
  server.on("/open", handleOpen);
  server.on("/close", handleClose);
  
  // Register the new LED commands
  server.on("/set_full", handleSetFull);
  server.on("/set_empty", handleSetEmpty);
  
  server.begin();
}

void loop() {
  server.handleClient();
}