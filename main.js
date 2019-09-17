$(document).ready(() => {
  /*
    Constants and variables
  */

  // OpenWeatherMap API Key
  const OW_API_KEY = '6e35f76f652b11160be0f3c988e10b83'

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
        updateWeather()
      })
    }

    // Remove the red box shadow
    $('#location-input').css('box-shadow', 'none')
  })

  /*
    Functions
  */

  // Get weather info from OpenWeatherMap API and update the app status
  let updateWeather = () => {
    // // Current weather
    // $.getJSON(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OW_API_KEY}`, data => {
    //   // Update weather info
    //   $('#location').html(data.name + ', ' + data.sys.country)
    //   $('#description').html(data.weather[0].description[0].toUpperCase() + data.weather[0].description.slice(1))
    //   $('#temperature').html(Math.round(data.main.temp))
    //   $('#mintemp').html(Math.round(data.main.temp_min))
    //   $('#maxtemp').html(Math.round(data.main.temp_max))
    //   $('#humidity').html(data.main.humidity)
    //   $('#pressure').html(data.main.pressure)

    //   // Update background and icon depending on weather status
    //   updateBackground(data.weather[0].description)
    //   updateIcon(data.weather[0].icon)
    // })

    // 7 days forecast
    $.getJSON(`${CORS_PROXY}https://api.darksky.net/forecast/${DS_API_KEY}/${lat},${lon}`, data => {
      const days = data.daily.data

      $('.tile').each((i, element) => {
        // Retrieve name of the day of the week
        const utcSeconds = days[i].time;
        const date = new Date(0)
        date.setUTCSeconds(utcSeconds)
        const dayName = date.toString().split(' ')[0]

        // Calculate average temperature in celsius
        const avgTemperatureF = (days[i].temperatureMin + days[i].temperatureMax) / 2
        const avgTemperatureC = (avgTemperatureF - 32) * 5 / 9

        $(element).children('h4').first().html(`${dayName}`)
        $(element).children('.tile-temperature').children('.data').html(Math.round(avgTemperatureC))
      })

      // // Update icons depending on weather status
      // updateIcons(days)
    })
  }

  // Update the weather using a city name (Google Maps API)
  let updateUsingCity = (city, callback) => {
    $.getJSON(`https://maps.googleapis.com/maps/api/geocode/json?address=${city}&bounds=46,0|34,20&key=${GM_API_KEY}`, data => {
      if (data.status === 'OK') {
        // Obtain the latitude and the longitude of a certain city using Google Maps API
        lat = data.results[0].geometry.location.lat
        lon = data.results[0].geometry.location.lng
        updateWeather()
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

  // Change the 5-days forecast icons depending on the weather statuses
  let updateIcons = days => {
    $('.day').each((i, element) => {
      $(element).children('.status-icon').children('img').attr('src', `img/icons/${days[i].weather[0].icon}.png`)
    })
  }

  /*
    Detect user location
  */

  updateUsingCity('San Francisco', () => { // Fallback city: San Francisco
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        lat = position.coords.latitude
        lon = position.coords.longitude
        updateWeather()
      })
    }
  })
})