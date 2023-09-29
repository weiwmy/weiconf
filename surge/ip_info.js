// Define the URL for the IP information API
let url = "http://ip-api.com/json"

// Make an HTTP GET request to the API and handle the response
$httpClient.get(url, function(error, response, data){
    // Parse the JSON data from the response
    let jsonData = JSON.parse(data)
    
    // Extract information from the JSON response
    let country = jsonData.country
    let emoji = getFlagEmoji(jsonData.countryCode)
    let city = jsonData.city
    let isp = jsonData.isp
    let ip = jsonData.query
  
    // Create a structured body object with information
    body = {
        title: "IP Check",
        content: `IP: ${ip}\nISP: ${isp}\nLocation: ${emoji}${country} - ${city}`,
        icon: "globe.asia.australia.fill"
    }
  
    // Finish the script and pass the body object as the result
    $done(body);
});

// Function to get a flag emoji based on a country code
function getFlagEmoji(countryCode) {
    // Convert Taiwan's country code to China's (if it's TW)
    if (countryCode.toUpperCase() == 'TW') {
        countryCode = 'CN'
    }
    // Map the Unicode code points for each character in the country code
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt())
    // Convert the code points into a string of flag emoji characters
    return String.fromCodePoint(...codePoints)
}
