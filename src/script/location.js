// src/script/location.js
console.log('location.js loaded');

if (!navigator.geolocation) {
  console.warn('Geolocation not supported');
} else {
  navigator.geolocation.getCurrentPosition(onSuccess, onError, {
    enableHighAccuracy: true,
    timeout:           10000,
    maximumAge:        0
  });
}

function onError(err) {
  console.error('Geolocation error:', err);
}

async function onSuccess(position) {
  console.log('Got position', position);
  const lat = position.coords.latitude.toFixed(4);
  const lon = position.coords.longitude.toFixed(4);
  const apiKey = '26c5adb12406f436f381157dadc63935';

  try {
    const resp = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?` +
      `lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    const data = await resp.json();
    console.log('Weather data', data);

    // city, icon, temp, description
    document.getElementById('city').textContent        = data.name;
    const icon = data.weather[0].icon;
    document.getElementById('weather-icon').src       =
      `https://openweathermap.org/img/wn/${icon}@2x.png`;
    document.getElementById('temp').textContent       =
      `${Math.round(data.main.temp)}°C`;
    document.getElementById('description').textContent =
      data.weather[0].description;
  } catch (e) {
    console.error('Weather fetch error:', e);
  }
}
