// CMD-V2 Format - Weather with HTTP requests made easy!

module.exports.config = {
    name: "weather",
    description: "Get weather information for a city",
    usage: "weather [city]",
    category: "utility",
    permission: 0,
    cooldown: 5,
    prefix: false  // true = requires prefix, false = no prefix needed
};

module.exports.languages = {
    "en": {
        "noCity": "❌ Please provide a city name!",
        "loading": "🌤️ Getting weather data...",
        "weather": "🌤️ Weather in %1:\n\n🌡️ Temperature: %2°C\n💨 Wind: %3 km/h\n💧 Humidity: %4%\n☁️ Condition: %5",
        "error": "❌ Could not get weather data for %1"
    },
    "bn": {
        "noCity": "❌ Doya kore city name din!",
        "loading": "🌤️ Weather data ante hocche...",
        "weather": "🌤️ %1 er weather:\n\n🌡️ Temperature: %2°C\n💨 Wind: %3 km/h\n💧 Humidity: %4%\n☁️ Condition: %5",
        "error": "❌ %1 er weather data pawa jay nai"
    }
};

module.exports.run = async (ctx) => {
    // Super easy syntax with utilities!
    const { args, reply, getText, utils, react } = ctx;
    
    // Check if city provided
    if (args.length === 0) {
        return reply(getText("noCity"));
    }
    
    const city = args.join(" ");
    
    try {
        // React to show processing (using valid Facebook reactions)
        await react("😊");
        
        // Send loading message
        await reply(getText("loading"));
        
        // Easy HTTP request!
        const weatherData = await utils.get(`http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=demo&units=metric`);
        
        // Format weather info
        const weather = getText("weather",
            weatherData.name,
            Math.round(weatherData.main.temp),
            Math.round(weatherData.wind.speed * 3.6), // m/s to km/h
            weatherData.main.humidity,
            weatherData.weather[0].description
        );
        
        // React with success (using valid Facebook reactions)
        await react("😊");
        
        return reply(weather);
        
    } catch (error) {
        // React with error (using valid Facebook reactions)
        await react("😢");
        
        return reply(getText("error", city));
    }
};
