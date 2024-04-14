'use strict';

const mapKey = 'AIzaSyD_rcrSVXf04LRhC_A60JgX2Af1QW2rKLg';

const weatherKey = 'c6c4517f539b755c5edd4a3f319d52e9';

const ticketMasterKey = 'wbpJGSkpjl5DN3GpY31gGmebFl7t83rx';


// Handle the form submission
document.querySelector('#frmTown').addEventListener('submit', (e) => {
    
    // Stop form submission
    e.preventDefault(); 

    if(mapKey === '' || weatherKey === '' || ticketMasterKey === '') {
        alert('Please provide your keys in main.js');
        return false;
    }
    
    // User provided city or town name
    const cityName = encodeURIComponent(e.target.town.value);

    getWeather(cityName);

    getMap(cityName);
    
    getEvents(cityName);

    // Reset the form
    document.getElementById('frmTown').reset();
});

function getWeather(cityName) 
{
    const apiKey = weatherKey;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;
    

    fetch(url)
    .then(response => {
        if(!response.ok) {
            throw new Error('Failed to retrieve weather information');
        }
        return response.json();
    })
    .then(data => {     
        // Check if data is empty or not found
        if (Object.keys(data).length === 0 && data.constructor === Object) {
            // Data is empty or not found, show message to the user
            showMessage('Record not found');
        } else {
            // Data is valid, proceed with populating events
            populateWeather(data);
        }                   
        
    })
    .catch(error => {
        console.log(error);
        showMessage('Record not found');
    })
}

function getMap(cityName) 
{

    const apiKey = mapKey;    
    const zoom = 12;
    const mapContainer = document.querySelector('#mapContainer');    
    const size = '1200x300';
    const url = `https://maps.googleapis.com/maps/api/staticmap?center=${cityName}&zoom=${zoom}&size=${size}&key=${apiKey}`;
    

    mapContainer.innerHTML =`
        <img src='${url}' alt='city map'>
    `;
}

function getEvents(cityName) 
{
    const apiKey = ticketMasterKey;
    const city = cityName;
    const size = 10; // Limiting to 10 records
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&city=${city}&size=${size}`;
  
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to retrieve events');
        }
        return response.json();
      })
      .then(data => {        
       
        populateEvents(data);

      })
      .catch(error => {
        console.error('Error fetching events:', error);
      });
  }

  function showMessage(message)
  {
    
    const weatherSection = document.querySelector('#weatherSection');
    const weatherContainer = document.querySelector('#weatherContainer');

    weatherContainer.innerHTML = `        
        <p> ${message} </p>  
    `;    
    weatherSection.setAttribute('data-has-content', 'true');
    
  }

  function populateWeather(data) 
  {
    
    const country = data.sys.country;
    const cityName = data.name;
    const main_weather = data.weather[0].main;
    const temp = data.main.temp - 273.15;
    const feels_like = data.main.feels_like - 273.15;
    const humidity = data.main.humidity;
    const wind_speed = data.wind.speed;

    const weatherSection = document.querySelector('#weatherSection');
    const weatherContainer = document.querySelector('#weatherContainer');

    weatherContainer.innerHTML = `
        <h1> ${cityName}, ${country} </h1>
        <h3> ${main_weather} </h3>
        <p> ${temp.toFixed(2)} °C (feels like ${feels_like.toFixed(2)} °C) </p>
        <p> Humidity: ${humidity}% </p>
        <p> Wind speed: ${wind_speed.toFixed(2)}m/s </p>  
    `;

    // Make weather section visible by setting the data-has-content to true
    weatherSection.setAttribute('data-has-content', 'true');
  }

  function populateEvents(data)
  {    
    const eventsSection = document.querySelector('#eventsSection');

    // If previously populated, then empty it.
    if(eventsSection.getAttribute('data-has-content') === 'true') {
        eventsSection.innerHTML = '';
    }            

    // If there is no events information, don't proceed and just return 
    if(data.page.totalElements < 1) {
        
        const article = document.createElement('article');  

        article.innerHTML = `
            <p> There is no event for this city </p>                
        `;        

        // add article to section
        eventsSection.appendChild(article);
        
        // make section visible
        eventsSection.setAttribute('data-has-content', 'true');

        return false;
    }
    
    const events = data._embedded.events;

    // Iterate through available events and display relevant info by creating and appending article(s). 
    events.forEach(event => {
        const eventName = event.name;
        const eventDate = event.dates.start.localDate;
        const eventTime = event.dates.start.localTime ? ' '+event.dates.start.localTime : '';
        const eventCity = event._embedded.venues[0].city.name;
        const eventVenue = event._embedded.venues[0].address.line1;
        
        // Create an article and fill it with relevant info
        const article = document.createElement('article');

        article.innerHTML = `
            <p>${eventName}</p>
            <p>${ eventDate + eventTime + ', '+ eventVenue + ' - '+ eventCity } </p>
        `;        

        // Append article to events section
        eventsSection.appendChild(article);
    });

    // Make events section visible by setting the data-has-content to true
    eventsSection.setAttribute('data-has-content', 'true');
  }