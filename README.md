# weatherapp
## new version of damianocasula/weatherapp

This app allows you to see the current and the weekly weather for your city or any city in the world. It takes weather data from the Dark Sky API and uses Google Maps to support the search of the cities. You can see a live version at: [https://casula.me/weatherapp](https://casula.me/weatherapp).

### New features

- Using Dark Sky API instead of OpenWeatherMap
- Using webpack
- Using environment variables
- Detailed weather information for timeline items
- Better UI

### How to use the app

- Install dependencies:
  ```
  npm i
  ```

- Add environment variables for Dark Sky and Google Maps API keys:
  ```
  DS_API_KEY=<your-dark-sky-api-key>
  GM_API_KEY=<your-google-maps-api-key>
  ```

- Build the code with:
  ```
  npm run build
  ```