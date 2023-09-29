const apiUrl = "http://ip-api.com/json";

async function fetchData(url) {
  try {
    const response = await $httpClient.get(url);
    const data = response.data;
    return JSON.parse(data);
  } catch (error) {
    throw new Error("Failed to fetch IP information. Please check your network connection.");
  }
}

function getFlagEmoji(countryCode) {
  if (countryCode.toUpperCase() === 'TW') {
    countryCode = 'CN';
  }
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

async function main() {
  try {
    const jsonData = await fetchData(apiUrl);
    const country = jsonData.country;
    const countryCode = jsonData.countryCode;
    const emoji = getFlagEmoji(countryCode);
    const city = jsonData.city;
    const isp = jsonData.isp;
    const ip = jsonData.query;

    const content = `IP: ${ip}\nCarrier: ${isp}\nLocation: ${emoji}${country} - ${city}`;

    $done({
      title: "Node Information",
      content: content,
      icon: "globe.asia.australia.fill"
    });
  } catch (e) {
    $done({
      title: "Request Failed",
      content: e.message,
      icon: "exclamationmark.circle.fill",
      "icon-color": "#CB1B45"
    });
  }
}

main();
