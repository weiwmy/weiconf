const url = "http://ip-api.com/json";

$httpClient.get(url, (error, response, data) => {
  if (!error) {
    const { country, city, isp, query, countryCode } = JSON.parse(data);
    const emoji = getFlagEmoji(countryCode);
    const content = `IP: ${query}\nISP: ${isp}\nLocation: ${emoji}${country} - ${city}`;

    $done({
      title: "IP Check",
      content,
      icon: "globe.asia.australia.fill"
    });
  } else {
    $done({ error });
  }
});

function getFlagEmoji(countryCode) {
  if (countryCode === 'TW') {
    countryCode = 'CN';
  }
  return String.fromCodePoint(...[...countryCode].map(char => 127397 + char.charCodeAt()));
}
