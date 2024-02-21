// weather variables
let inputField, bttn;
let city = "";
let geoLocation;
let apiKey = "&appid=506628638789b0103d43f74faf163327";
let condition, temp, humidity, wind; 
// main
let thunderstorm, drizzle, rain, snow, fog, clear; 
// rain
let rainDrops = 100;
let rainDrop = [];

// clouds
let cloud1, cloud2, cloud3, cloud4, cloud5;

// sheep variables
let butt, forward, lay, sleep, stand;

function setup() {
  createCanvas(500, 280);
  
  // weather
  inputField = createInput("");
  bttn = createButton("GET WEATHER");
  bttn.mousePressed(getLoc);
  
  // load sheep
  butt = loadImage("sheep/butt.png");
  forward = loadImage("sheep/forward.png");
  lay = loadImage("sheep/lay.png");
  sleep = loadImage("sheep/sleep.png");
  stand = loadImage("sheep/stand.png");
  landscape = loadImage("landscape.png");
  
    // Multiply raindrop instances using loop, index, and array
  for (let i = 0; i < rainDrops; i++) {
    rainDrop[i] = new Rain();
  }
  
  // load clouds
  cloud1 = loadImage("main/clouds/cloud1.png");
  cloud2 = loadImage("main/clouds/cloud2.png");
  cloud3 = loadImage("main/clouds/cloud3.png");
  cloud4 = loadImage("main/clouds/cloud4.png");
  cloud5 = loadImage("main/clouds/cloud5.png");
  
}

function getLoc() {
  // if inputField has value, updates city 
  if (inputField.value()) {
    city = inputField.value();
  }
  
  // set baseURL for geo
  let baseURL = "https://api.openweathermap.org/geo/1.0/direct?q=";
  
  // creates JSON with location info
  geoLocation = loadJSON(baseURL+city+apiKey, getWeather);
}

function getWeather() {
  // set baseURL for data
  let baseURL ="https://api.openweathermap.org/data/2.5/weather?";
  // QUESTION: what is geoLocation?
  let myLat = "lat="+geoLocation[0].lat;
  let myLon = "&lon="+geoLocation[0].lon;

  // weather info
  myWeather = loadJSON(baseURL+myLat+myLon+apiKey, gotWeather);
}

function gotWeather() {
  condition = myWeather.weather[0].main;
  temp = myWeather.main.temp - 273.15 * 9/5 + 32;
  humidity = myWeather.main.humidity;
  wind = myWeather.wind.speed;
  
  console.log(myWeather);
  console.log(myWeather.weather[0].main);
  console.log(myWeather.main.temp);
  console.log(myWeather.main.humidity);
  console.log(myWeather.wind.speed);
}

function draw() {
  background("pink");
  image(landscape, 0, 0);
  landscape.resize(500, 0);
  
  // sheep
  image(butt, 239, 222);
  image(forward, 337, 197);
  image(lay, 468, 222);
  image(sleep, 93, 225);
  image(stand, 5, 180);
  
  // thunderstorm, drizzle, rain, snow, fog, clear, clouds
  if (condition == "Clouds") {
      image(cloud1, 350, 130);
      cloud1.resize(90, 0);
      image(cloud2, 17, 55);
      cloud2.resize(70, 0);
      image(cloud3, 160, 120);
      cloud3.resize(90, 0);
      image(cloud4, 180, 10);
      cloud4.resize(60, 0);
      image(cloud5, 280, 90);
      cloud5.resize(70, 0);
  }
  if (condition == "Thunderstorm" || condition == "Drizzle" || condition == "Rain") {
    updateRainDrops();
  }
}

// Add functions to update raindrops falling against the background
function updateRainDrops() {
  for (let i = 0; i < rainDrops; i++) {
    // Draw functions from Rain Class
    rainDrop[i].show();
    rainDrop[i].shower();
  }
}