(async () => {
  const params = getParams($argument);

  // Get a list of all available proxy groups
  const allGroup = Object.keys(await httpAPI("/v1/policy_groups"));

  // Find the root group name
  let group = params.group;
  let rootName = group;
  while (allGroup.includes(rootName)) {
    rootName = (await httpAPI(`/v1/policy_groups/select?group_name=${encodeURIComponent(rootName)}`)).policy;
  }

  // Get IP location information
  const { country, city, isp, org } = JSON.parse(await httpAPI('http://ip-api.com/json/?lang=en'));

  // Construct the response
  $done({
    title: rootName,
    content: `Country/Region: ${country} - ${city}\nISP: ${isp}\nData Center: ${org}`,
    icon: params.icon,
    "icon-color": params.color
  });
})();

async function httpAPI(path = "", method = "GET", body = null) {
  return new Promise((resolve) => {
    $httpAPI(method, path, body, (result) => {
      resolve(result);
    });
  });
}

function getParams(param) {
  return Object.fromEntries(
    $argument
      .split("&")
      .map((item) => item.split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );
}
