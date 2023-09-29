const url = "http://ip-api.com/json";

$httpClient.get(url, (error, response, data) => {
    if (error) {
        console.error("Error:", error);
        return;
    }

    const jsonData = JSON.parse(data);
    const { countryCode, country, city, isp, query: ip } = jsonData;
    const emoji = getFlagEmoji(countryCode);

    const body = {
        title: "IP Check",
        content: `IP: ${ip}\nISP: ${isp}\nLocation: ${emoji}${country} - ${city}`,
        icon: "globe.asia.australia.fill"
    };

    $done(body);
});

function getFlagEmoji(countryCode) {
    // Convert Taiwan's country code to China's (if it's TW)
    if (countryCode.toUpperCase() === 'TW') {
        countryCode = 'CN';
    }

    return String.fromCodePoint(...Array.from(countryCode.toUpperCase(), char => 127397 + char.charCodeAt()));
}
