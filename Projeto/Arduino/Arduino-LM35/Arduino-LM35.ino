#include <Arduino.h> 

const int PINO_SENSOR_TEMPERATURA = A0;
float temperaturaCelsius;

void setup() {

  Serial.begin(9600);

  pinMode(PINO_SENSOR_TEMPERATURA, INPUT);
}

void loop() {
  
  int valorLeitura = analogRead(PINO_SENSOR_TEMPERATURA);
  
  temperaturaCelsius = (valorLeitura * 5.0 / 1023.0) / 0.01;

 
  Serial.println(temperaturaCelsius);

  delay(2000); 
} 