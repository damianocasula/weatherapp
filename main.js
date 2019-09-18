/* global Toastify, $ */

$(document).ready(() => {
  /*
    Constants and variables
  */

  // Dark Sky API Key
  const DS_API_KEY = '673727fb946c485811c9151f95ec70f8'

  // CORS Proxy for Dark Sky API
  const CORS_PROXY = 'https://bypasscors.herokuapp.com/api/?url='

  // Google Maps API Key
  const GM_API_KEY = 'AIzaSyD3lc_Lx0scYDDhlQwPXSUfpSqrOYdRTHg'

  // Latitude and longitude
  let lat = 0
  let lon = 0

  /*
    Inform the user that he sometimes need to specify the nation
  */

  setTimeout(() => {
    Toastify({
      text: 'For example, for the italian city Milan: use Milan, Italy',
      duration: 25000,
      close: true,
      backgroundColor: 'rgba(25, 25, 25, .9)'
    }).showToast()
  }, 6000)

  setTimeout(() => {
    Toastify({
      text: 'If you don\'t find the city you want, try specifying its nation',
      duration: 28000,
      close: true,
      backgroundColor: 'rgba(25, 25, 25, .9)'
    }).showToast()
  }, 2000)

  /*
    Get current year
  */

  $('#current-year').html(new Date().getFullYear())

  /*
    Event handlers
  */

  // Remove the red box shadow when the location input is updated
  $('#location-input').on('input', () => {
    $('#location-input').css('box-shadow', 'none')
  })

  // Get the weather info of a user specified city
  $('#city-name-submit').click(e => {
    updateUsingCity($('#location-input').val(), console.log)
  })

  $(document).keypress(e => {
    if (e.which === 13) {
      updateUsingCity($('#location-input').val(), console.log)
    }
  })

  // TODO: Get browser location when user clicks on #browser-location-submit button
  $('#browser-location-submit').click(e => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        lat = position.coords.latitude
        lon = position.coords.longitude
        updateCityName()
        updateWeatherInfo()
      })
    }

    // Remove the red box shadow
    $('#location-input').css('box-shadow', 'none')
  })

  /*
    Functions
  */

  // Update the city name using Google Maps API
  let updateCityName = () => {
    $.getJSON(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&sensor=true&key=${GM_API_KEY}`, data => {
      console.log(data.results)
      const results = data.results

      if (results[1]) {
        let country = null
        let city = null
        let cityAlt = null
        let c, lc, component

        for (let r = 0, rl = results.length; r < rl; r += 1) {
          let result = results[r]

          if (!city && result.types[0] === 'locality') {
            for (c = 0, lc = result.address_components.length; c < lc; c += 1) {
              component = result.address_components[c]

              if (component.types[0] === 'locality') {
                city = component.long_name
                break
              }
            }
          } else if (!city && !cityAlt && result.types[0] === 'administrative_area_level_1') {
            for (c = 0, lc = result.address_components.length; c < lc; c += 1) {
              component = result.address_components[c]

              if (component.types[0] === 'administrative_area_level_1') {
                cityAlt = component.long_name
                break
              }
            }
          } else if (!country && result.types[0] === 'country') {
            country = result.address_components[0].long_name
          }

          if (city && country) {
            break
          }
        }

        $('#location').html(`${city}, ${country}`)
      }
    })
  }

  // Get weather info from Dark Sky API and update the app status
  let updateWeatherInfo = () => {
    $.getJSON(`${CORS_PROXY}https://api.darksky.net/forecast/${DS_API_KEY}/${lat},${lon}`, data => {
      updateCurrentWeatherInfo(data.currently)
      updateTimelineWeatherInfo(data.daily.data)
    })
  }

  // Update current weather info
  let updateCurrentWeatherInfo = currentWeather => {
    console.log(currentWeather)

    $('#description').html(currentWeather.summary)
    $('#temperature').html(Math.round(fahrenheitToCelsius(currentWeather.temperature)))
    $('#humidity').html(currentWeather.humidity * 100)
    $('#pressure').html(currentWeather.pressure)

    // // Update background and icon depending on weather status
    // updateBackground(data.weather[0].description)
    // updateIcon(data.weather[0].icon)
  }

  // Update 7 days forecast
  let updateTimelineWeatherInfo = weeklyWeather => {
    $('.tile').each((i, element) => {
      // Retrieve name of the day of the week
      const utcSeconds = weeklyWeather[i].time
      let date = new Date(0)
      date.setUTCSeconds(utcSeconds)
      const dayName = date.toString().split(' ')[0]

      // Calculate rounded celsius min and max temperatures
      const roundedMinTemperatureC = Math.round(fahrenheitToCelsius(weeklyWeather[i].temperatureMin))
      const roundedMaxTemperatureC = Math.round(fahrenheitToCelsius(weeklyWeather[i].temperatureMax))

      // Update tile
      $(element).children('h4').first().html(`${dayName}`)
      $(element).children('.tile-temperature').children('.data').html(`${roundedMinTemperatureC} - ${roundedMaxTemperatureC}`)
    })

    // // Update icons depending on weather status
    // updateIcons(days)
  }

  // Update the weather using a city name (Google Maps API)
  let updateUsingCity = (city, callback) => {
    $.getJSON(`https://maps.googleapis.com/maps/api/geocode/json?address=${city}&bounds=46,0|34,20&key=${GM_API_KEY}`, data => {
      if (data.status === 'OK') {
        // Obtain the latitude and the longitude of a certain city using Google Maps API
        lat = data.results[0].geometry.location.lat
        lon = data.results[0].geometry.location.lng
        updateCityName()
        updateWeatherInfo()
      } else { // Error in the API request
        // Red border
        $('#location-input').css('box-shadow', '0 0 3px rgba(220, 20, 20, 1)')

        // Error toast
        Toastify({
          text: 'City not found',
          duration: 4500,
          close: true,
          backgroundColor: 'rgba(220, 20, 20, .5)',
          positionLeft: true
        }).showToast()
      }
    }).done(() => callback())
  }

  // Change the background depending on the weather status
  let updateBackground = status => {
    if (status.includes('thunderstorm')) status = 'thunderstorm'
    if (status.includes('drizzle') || status.includes('rain')) status = 'rain'
    if (status.includes('snow')) status = 'snow'
    if (status.includes('clouds') && !status.includes('few clouds')) status = 'clouds'
    if (status.includes('sand') || status.includes('dust')) status = 'sand'

    status = status.replace(' ', '-')

    $('body').css('background-image', `url('img/backgrounds/${status}.jpg')`)
  }

  // Change the icon depending on the weather status
  let updateIcon = icon => {
    $('#status-icon > img').attr('src', `img/icons/${icon}.png`)
  }

  // Change the 7-days forecast icons depending on the weather statuses
  let updateIcons = days => {
    $('.day').each((i, element) => {
      $(element).children('.status-icon').children('img').attr('src', `img/icons/${days[i].weather[0].icon}.png`)
    })
  }

  // Convert Fahrenheit to Celsius
  let fahrenheitToCelsius = fahrenheit => (fahrenheit - 32) * 5 / 9

  /*
    Detect user location
  */

  updateUsingCity('San Francisco', () => { // Fallback city: San Francisco
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        lat = position.coords.latitude
        lon = position.coords.longitude
        updateCityName()
        updateWeatherInfo()
      })
    }
  })

  /*
     Current time and date
  */
  let today = new Date()
  date.setUTCSeconds(utcSeconds)
  const currentDay = date.toString()
  const currentDayArray = currentDay.split(' ')
  const currentTimeArray = currentDayArray[4].split(':')
  $('#current-time').html(`${currentTimeArray[0]}:${currentTimeArray[1]}`)
  $('#current-day').html(`${currentDayArray[1]} ${currentDayArray[2]} ${currentDayArray[3]}`)

})
