const apiUrl = "http://ip-api.com/json";

$httpClient.get(apiUrl, function(error, response, data) {
  if (error) {
    $done({
      title: "Request Failed",
      content: "Unable to fetch IP information. Please check your network connection.",
      icon: "exclamationmark.circle.fill",
      "icon-color": "#CB1B45"
    });
    return;
  }

  try {
    const jsonData = JSON.parse(data);
    const country = jsonData.country;
    const countryCode = jsonData.countryCode;
    const emoji = getFlagEmoji(countryCode);
    const city = jsonData.city;
    const isp = jsonData.isp;
    const ip = jsonData.query;

    const content = `IP Information: ${ip}\nCarrier: ${isp}\nLocation: ${emoji}${country} - ${city}`;

    $done({
      title: "Node Information",
      content: content,
      icon: "globe.asia.australia.fill"
    });
  } catch (e) {
    $done({
      title: "Parsing Error",
      content: "Failed to parse IP information. Please try again.",
      icon: "exclamationmark.circle.fill",
      "icon-color": "#CB1B45"
    });
  }
});

function getFlagEmoji(countryCode) {
  if (countryCode.toUpperCase() == 'TW') {
    countryCode = 'CN';
  }
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}
