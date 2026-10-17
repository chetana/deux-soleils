#!/bin/bash
echo "=== MONTÉVRAIN (FR) ==="
curl -s --max-time 20 "https://api.open-meteo.com/v1/forecast?latitude=48.8721&longitude=2.7542&current=temperature_2m,weather_code,is_day&daily=sunrise,sunset&timezone=auto&forecast_days=1" | head -c 600
echo
echo "=== TRAPEANG AMPIL (KH) ==="
curl -s --max-time 20 "https://api.open-meteo.com/v1/forecast?latitude=11.467&longitude=104.533&current=temperature_2m,weather_code,is_day&daily=sunrise,sunset&timezone=auto&forecast_days=1" | head -c 600
echo
